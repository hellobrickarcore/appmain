import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://tlcqiixlpmpguixzbbxj.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =========================================================================
// Real-time Database Synchronization Helpers
// =========================================================================

/**
 * Fetch the authenticated user's portfolio collection from Supabase.
 */
export async function getSupabaseCollection() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_collections")
    .select(`
      id,
      set_num,
      condition,
      purchase_price,
      purchase_date,
      notes,
      created_at
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching Supabase collection:", error.message);
    throw error;
  }

  // Format fields to match CollectionItem interface
  return data.map((item) => ({
    id: item.id,
    userId: user.id,
    setNum: item.set_num,
    condition: item.condition as "sealed" | "used" | "partial",
    purchasePrice: item.purchase_price ? parseFloat(item.purchase_price) : null,
    purchaseDate: item.purchase_date,
    addedAt: item.created_at,
    notes: item.notes || "",
  }));
}

/**
 * Sync local collection item to Supabase.
 */
export async function addSupabaseCollectionItem(item: {
  setNum: string;
  condition: "sealed" | "used" | "partial";
  purchasePrice: number | null;
  purchaseDate: string | null;
  notes?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_collections")
    .insert([
      {
        user_id: user.id,
        set_num: item.setNum,
        condition: item.condition,
        purchase_price: item.purchasePrice,
        purchase_date: item.purchaseDate,
        notes: item.notes || "",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error inserting collection item into Supabase:", error.message);
    throw error;
  }

  return data;
}

/**
 * Remove an item from Supabase collection.
 */
export async function removeSupabaseCollectionItem(setNum: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { error } = await supabase
    .from("user_collections")
    .delete()
    .eq("user_id", user.id)
    .eq("set_num", setNum);

  if (error) {
    console.error("Error deleting collection item from Supabase:", error.message);
    throw error;
  }

  return true;
}

/**
 * Update an item in Supabase collection.
 */
export async function updateSupabaseCollectionItem(id: string, updates: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_collections")
    .update(updates)
    .eq("user_id", user.id)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating collection item in Supabase:", error.message);
    throw error;
  }

  return data;
}

/**
 * Fetch the authenticated user's wishlist price monitors from Supabase.
 */
export async function getSupabaseWishlist() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("wishlists")
    .select(`
      id,
      set_num,
      target_price,
      created_at
    `)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching Supabase wishlist:", error.message);
    throw error;
  }

  return data.map((item) => ({
    id: item.id,
    userId: user.id,
    setNum: item.set_num,
    targetPrice: item.target_price ? parseFloat(item.target_price) : null,
    addedAt: item.created_at,
  }));
}

/**
 * Add item to Supabase wishlist.
 */
export async function addSupabaseWishlistItem(item: {
  setNum: string;
  targetPrice: number | null;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("wishlists")
    .insert([
      {
        user_id: user.id,
        set_num: item.setNum,
        target_price: item.targetPrice,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error inserting wishlist item into Supabase:", error.message);
    throw error;
  }

  return data;
}

/**
 * Remove an item from Supabase wishlist.
 */
export async function removeSupabaseWishlistItem(setNum: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", user.id)
    .eq("set_num", setNum);

  if (error) {
    console.error("Error deleting wishlist item from Supabase:", error.message);
    throw error;
  }

  return true;
}
