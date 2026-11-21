import React from 'react';
import { FlatList } from 'react-native';
import { EmptyState, ClassCard, colors } from '../components/ui';
import { useFavorit } from '../context/FavoritContext';

export default function FavoritScreen({ navigation }) {
  const { items, toggle } = useFavorit();
  if (items.length === 0) return <EmptyState message="Belum ada kelas favorit. Ketuk ikon hati di daftar kelas." />;
  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 14 }}
      data={items}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => (
        <ClassCard item={item} favorite onToggleFavorite={() => toggle(item)}
          onPress={() => navigation.navigate('ClassDetail', { classItem: item })} />
      )}
    />
  );
}
