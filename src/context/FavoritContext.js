import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const FavoritContext = createContext(null);
export const useFavorit = () => useContext(FavoritContext);

// Kelas favorit disimpan di perangkat, terpisah untuk setiap akun
// (kunci: edvanta_favorit_<id pengguna>), supaya akun lain tidak ikut berubah.
export function FavoritProvider({ children }) {
  const { session } = useAuth();
  const userId = session && session.user ? session.user.id : null;
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems([]);
    if (!userId) return;
    let cancelled = false;
    AsyncStorage.getItem(`edvanta_favorit_${userId}`)
      .then((v) => { if (!cancelled && v) setItems(JSON.parse(v)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userId]);

  const toggle = useCallback((cls) => {
    if (!userId) return;
    setItems((prev) => {
      const next = prev.some((x) => x.id === cls.id) ? prev.filter((x) => x.id !== cls.id) : [cls, ...prev];
      AsyncStorage.setItem(`edvanta_favorit_${userId}`, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, [userId]);

  const isFavorit = useCallback((id) => items.some((x) => x.id === id), [items]);

  return <FavoritContext.Provider value={{ items, toggle, isFavorit }}>{children}</FavoritContext.Provider>;
}