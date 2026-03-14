import { Brick, LegoSet } from '../types';
import { getConversationalIdeas } from './geminiService';

const RECON_DATABASE: LegoSet[] = [
    {
        id: 'set_001',
        name: 'Mini Space Shuttle',
        setNumber: '31117-M',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400',
        partCount: 12,
        ownedParts: 0,
        bricks: [
            { id: 'b1', name: '2x4 White Brick', count: 4, category: 'Bricks', color: 'White', image: 'https://picsum.photos/seed/b1/100/100' },
            { id: 'b2', name: '1x2 Blue Plate', count: 4, category: 'Plates', color: 'Blue', image: 'https://picsum.photos/seed/b2/100/100' },
            { id: 'b3', name: '2x2 Technic Pin', count: 4, category: 'Technic', color: 'Grey', image: 'https://picsum.photos/seed/b3/100/100' },
        ]
    },
    {
        id: 'set_002',
        name: 'Red Race Car',
        setNumber: '60322-C',
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400',
        partCount: 8,
        ownedParts: 0,
        bricks: [
            { id: 'r1', name: '2x2 Red Brick', count: 4, category: 'Bricks', color: 'Red', image: 'https://picsum.photos/seed/r1/100/100' },
            { id: 'r2', name: '1x4 Black Plate', count: 4, category: 'Plates', color: 'Black', image: 'https://picsum.photos/seed/r2/100/100' },
        ]
    },
    {
        id: 'set_003',
        name: 'Garden Flower',
        setNumber: '40460-F',
        image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=400',
        partCount: 15,
        ownedParts: 0,
        bricks: [
            { id: 'g1', name: '1x1 Green Round', count: 10, category: 'Bricks', color: 'Green', image: 'https://picsum.photos/seed/g1/100/100' },
            { id: 'g2', name: '4x4 Yellow Plate', count: 5, category: 'Plates', color: 'Yellow', image: 'https://picsum.photos/seed/g2/100/100' },
        ]
    }
];

export const suggestionEngine = {
    /**
     * Calculate how much of each set can be built with current inventory
     */
    getSuggestions(userBricks: Brick[]): LegoSet[] {
        if (!userBricks) return RECON_DATABASE;

        return RECON_DATABASE.map(set => {
            let ownedParts = 0;
            
            // For each required brick in the set
            const updatedBricks = set.bricks.map(reqBrick => {
                // Find matching brick in user inventory (match by name and color)
                const inventoryMatch = userBricks.find(ub => 
                    ub.name.toLowerCase().includes(reqBrick.name.toLowerCase()) ||
                    (ub.category === reqBrick.category && ub.color === reqBrick.color)
                );
                
                const countOwned = inventoryMatch ? Math.min(inventoryMatch.count, reqBrick.count) : 0;
                ownedParts += countOwned;
                
                return { ...reqBrick, owned: countOwned };
            });

            return {
                ...set,
                ownedParts,
                bricks: updatedBricks as any
            };
        }).sort((a, b) => (b.ownedParts / b.partCount) - (a.ownedParts / a.partCount));
    },

    /**
     * Smart "Creative" Suggestions
     * Pulls conversational builds from Gemini.
     */
    async getSmartCreativeIdeas(userBricks: Brick[], query: string): Promise<any[]> {
        try {
            const results = await getConversationalIdeas(query, userBricks);
            return results.builds.map(b => ({
                ...b,
                xp: b.difficulty === 'Ready' ? 100 : b.difficulty === 'Almost' ? 200 : 500
            }));
        } catch (err) {
            console.error('[SuggestionEngine] Gemini failed, falling back to static themes', err);
            
            const colorCounts: Record<string, number> = {};
            userBricks.forEach(b => {
                 const c = b.color || 'Unknown';
                 colorCounts[c] = (colorCounts[c] || 0) + b.count;
            });

            const dominantColor = Object.entries(colorCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Mixed';

            return [
                {
                    title: `Cyberpunk ${dominantColor} City`,
                    description: `Using your ${colorCounts[dominantColor] || 0} ${dominantColor} pieces, you could build a futuristic skyscraper base.`,
                    difficulty: 'Master',
                    xp: 250
                }
            ];
        }
    }
};
