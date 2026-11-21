import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Loading, colors, Button } from '../components/ui';
import { useAsync } from '../components/useAsync';
import * as Api from '../services/ApiService';

// Menampilkan data dari layanan kelompok lain (integrasi).
export default function ExploreScreen() {
  const { loading, data, reload } = useAsync(() => Api.getAllExternal(), []);
  if (loading && !data) return <Loading label="Mengambil data kelompok lain..." />;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      {(data || []).map(({ api, items, error }) => (
        <View key={api.key} style={{ backgroundColor: colors.card, padding: 14, borderRadius: 12, gap: 8 }}>
          <Text style={{ fontWeight: '800', color: colors.text }}>{api.name}</Text>
          {error ? (
            <Text style={{ color: colors.error }}>Gagal memuat: {error}</Text>
          ) : items.length === 0 ? (
            <Text style={{ color: colors.muted }}>Tidak ada data.</Text>
          ) : (
            items.slice(0, 10).map((it) => (
              <View key={it.id}>
                <Text style={{ fontWeight: '600', color: colors.text }}>{it.title}</Text>
                {it.subtitle ? <Text style={{ color: colors.muted }} numberOfLines={2}>{it.subtitle}</Text> : null}
              </View>
            ))
          )}
        </View>
      ))}
      <Button title="Muat ulang" secondary onPress={reload} />
    </ScrollView>
  );
}
