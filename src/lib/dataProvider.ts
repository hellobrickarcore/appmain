// src/lib/dataProvider.ts

/**
 * Centralized data provider for HelloBrick app.
 * Provides functions to retrieve collection, wishlist, LEGO sets and valuations
 * from persistent storage or remote APIs.
 */

import { apiRequest } from '../services/apiService';
import { CollectionItem, WishlistItem, LegoSet, SetValuation } from '../types';

/**
 * Retrieve collection from localStorage.
 * Returns an empty array if not present.
 */
export const getCollectionFromStorage = async (): Promise<CollectionItem[]> => {
  const stored = localStorage.getItem('hellobrick_collection_sets');
  if (!stored) return [];
  try {
    return JSON.parse(stored) as CollectionItem[];
  } catch (e) {
    console.warn('Failed to parse collection storage, returning empty array');
    return [];
  }
};

/**
 * Retrieve wishlist from localStorage.
 */
export const getWishlistFromStorage = async (): Promise<WishlistItem[]> => {
  const stored = localStorage.getItem('hellobrick_wishlist_sets');
  if (!stored) return [];
  try {
    return JSON.parse(stored) as WishlistItem[];
  } catch (e) {
    console.warn('Failed to parse wishlist storage, returning empty array');
    return [];
  }
};

/**
 * Fetch all LEGO sets from the backend.
 * Expected to return an array of LegoSet objects.
 */
export const getSets = async (): Promise<LegoSet[]> => {
  // Replace with real endpoint as needed
  const url = `${process.env.VITE_API_BASE_URL || ''}/sets`;
  const data = await apiRequest(url);
  return data as LegoSet[];
};

/**
 * Fetch valuations map keyed by setNum.
 */
export const getValuationsMap = async (): Promise<Map<string, SetValuation>> => {
  const url = `${process.env.VITE_API_BASE_URL || ''}/valuations`;
  const data = await apiRequest(url);
  // Assume data is an array of valuations
  const map = new Map<string, SetValuation>();
  if (Array.isArray(data)) {
    data.forEach((v: SetValuation) => {
      if (v.setNum) map.set(v.setNum, v);
    });
  }
  return map;
};

/**
 * Helper to persist collection changes back to storage.
 */
export const saveCollection = (collection: CollectionItem[]) => {
  localStorage.setItem('hellobrick_collection_sets', JSON.stringify(collection));
};

/**
 * Helper to persist wishlist changes back to storage.
 */
export const saveWishlist = (wishlist: WishlistItem[]) => {
  localStorage.setItem('hellobrick_wishlist_sets', JSON.stringify(wishlist));
};

/**
 * Exported object for convenient import.
 */
export const dataProvider = {
  getCollectionFromStorage,
  getWishlistFromStorage,
  getSets,
  getValuationsMap,
  saveCollection,
  saveWishlist,
};
