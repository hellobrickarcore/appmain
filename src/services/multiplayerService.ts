import { supabase } from './supabaseService';
import { GameModeId } from '../types';

export type LobbyStatus = 'waiting' | 'matched' | 'started' | 'completed' | 'cancelled';

export interface Lobby {
    id: string;
    host_id: string;
    opponent_id: string | null;
    mode_id: GameModeId;
    status: LobbyStatus;
    created_at: string;
    updated_at: string;
}

class MultiplayerService {
    /**
     * Find an existing waiting lobby for a specific mode or create a new one
     */
    async findOrJoinLobby(userId: string, modeId: GameModeId): Promise<Lobby> {
        if (!supabase) throw new Error('Supabase not configured');

        // 1. Try to find a waiting lobby hosted by someone else
        const { data: waitingLobby, error: findError } = await supabase
            .from('game_lobby')
            .select('*')
            .eq('status', 'waiting')
            .eq('mode_id', modeId)
            .neq('host_id', userId)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();

        if (findError) {
            console.error('Error finding lobby:', findError);
        }

        if (waitingLobby) {
            // 2. Join the existing lobby as opponent
            const { data: joinedLobby, error: joinError } = await supabase
                .from('game_lobby')
                .update({
                    opponent_id: userId,
                    status: 'matched'
                })
                .eq('id', waitingLobby.id)
                .select()
                .single();

            if (joinError) {
                console.error('Error joining lobby:', joinError);
                // If someone else joined it first, try again
                return this.findOrJoinLobby(userId, modeId);
            }

            return joinedLobby as Lobby;
        }

        // 3. No lobby found, create a new one
        const { data: newLobby, error: createError } = await supabase
            .from('game_lobby')
            .upsert({
                host_id: userId,
                mode_id: modeId,
                status: 'waiting'
            }, { onConflict: 'host_id' }) // Use upsert with host_id conflict to reuse existing waiting lobby if any
            .select()
            .single();

        if (createError) {
            console.error('Error creating lobby:', createError);
            throw createError;
        }

        return newLobby as Lobby;
    }

    /**
     * Subscribe to changes in a specific lobby
     */
    subscribeToLobby(lobbyId: string, onUpdate: (lobby: Lobby) => void) {
        if (!supabase) return () => { };

        const channel = supabase
            .channel(`lobby:${lobbyId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'game_lobby',
                    filter: `id=eq.${lobbyId}`
                },
                (payload) => {
                    onUpdate(payload.new as Lobby);
                }
            )
            .subscribe();

        return () => {
            if (supabase) supabase.removeChannel(channel);
        };
    }

    /**
     * Start the match (host only)
     */
    async startMatch(lobbyId: string) {
        if (!supabase) throw new Error('Supabase not configured');

        const { error } = await supabase
            .from('game_lobby')
            .update({ status: 'started' })
            .eq('id', lobbyId);

        if (error) throw error;
    }
   /**
     * Cancel or leave a lobby
     */
    async leaveLobby(lobbyId: string, userId: string): Promise<void> {
        if (!supabase) return;

        const { data: lobby } = await supabase
            .from('game_lobby')
            .select('*')
            .eq('id', lobbyId)
            .single();

        if (!lobby) return;

        if (lobby.host_id === userId) {
            // If host leaves, cancel the whole lobby or if matched, remove host? 
            // Simplified: just cancel if it's waiting or matched
            await supabase
                .from('game_lobby')
                .update({ status: 'cancelled' })
                .eq('id', lobbyId);
        } else if (lobby.opponent_id === userId) {
            // If opponent leaves, set back to waiting
            await supabase
                .from('game_lobby')
                .update({
                    opponent_id: null,
                    status: 'waiting'
                })
                .eq('id', lobbyId);
        }
    }

    /**
     * Get any active "waiting" lobbies for notification
     */
    async getWaitingLobbies(): Promise<Lobby[]> {
        if (!supabase) return [];

        const { data } = await supabase
            .from('game_lobby')
            .select('*')
            .eq('status', 'waiting')
            .order('created_at', { ascending: false });

        return (data || []) as Lobby[];
    }
    /**
     * Subscribe to ANY change in game_lobby table
     */
    subscribeToAllLobbies(onEvent: (payload: any) => void) {
        if (!supabase) return null;

        const channel = supabase
            .channel('global:lobbies')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'game_lobby'
                },
                (payload) => {
                    onEvent(payload);
                }
            )
            .subscribe();

        return channel;
    }

    /**
     * Unsubscribe from a channel
     */
    unsubscribe(channel: any) {
        if (supabase && channel) {
            supabase.removeChannel(channel);
        }
    }
}

export const multiplayerService = new MultiplayerService();
