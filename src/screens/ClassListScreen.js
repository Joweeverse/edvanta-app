import React, { useMemo, useState } from 'react';
import { FlatList, TextInput, View, RefreshControl } from 'react-native';
import { Loading, ErrorState, EmptyState, ClassCard, colors } from '../components/ui';
import { useAsync } from '../components/useAsync';
import { useAuth } from '../context/AuthContext';
import { useFavorit } from '../context/FavoritContext';
import * as Api from '../services/ApiService';

export default function ClassListScreen({ navigation }) {
  const { session } = useAuth();
  const { isFavorit, toggle } = useFavorit();
  const [query, setQuery] = useState('');
  const { loading, error, data, reload } = useAsync(() => Api.getClasses(session.token), [session.token]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data || []).filter((c) => !q || `${c.title} ${c.category || ''}`.toLowerCase().includes(q));
  }, [data, query]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Cari kelas atau kategori"
        placeholderTextColor={colors.muted}
        style={{ margin: 16, marginBottom: 0, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
      />
      {filtered.length === 0 ? (
        <EmptyState message={query ? 'Tidak ada kelas yang cocok.' : 'Belum ada kelas tersedia.'} />
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16, gap: 14 }}
          data={filtered}
          keyExtractor={(i) => i.id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
          renderItem={({ item }) => (
            <ClassCard
              item={item}
              favorite={isFavorit(item.id)}
              onToggleFavorite={() => toggle(item)}
              onPress={() => navigation.navigate('ClassDetail', { classItem: item })}
            />
          )}
        />
      )}
    </View>
  );
}
