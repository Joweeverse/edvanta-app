import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'edvanta_favorit';
const FavoritContext = createContext(null);
export const useFavorit = () => useContext(FavoritContext);

// Kelas favorit disimpan di perangkat (objek kelas utuh agar bisa tampil tanpa jaringan).
export function FavoritProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => v && setItems(JSON.parse(v)))
      .catch(() => {});
  }, []);

  const toggle = useCallback((cls) => {
    setItems((prev) => {
      const next = prev.some((x) => x.id === cls.id) ? prev.filter((x) => x.id !== cls.id) : [cls, ...prev];
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const isFavorit = useCallback((id) => items.some((x) => x.id === id), [items]);

  return <FavoritContext.Provider value={{ items, toggle, isFavorit }}>{children}</FavoritContext.Provider>;
}
