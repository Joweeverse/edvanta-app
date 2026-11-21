import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Loading, ErrorState, EmptyState, ProgressBar, colors } from '../components/ui';
import { useAsync } from '../components/useAsync';
import { useAuth } from '../context/AuthContext';
import * as Api from '../services/ApiService';

export default function MyClassesScreen({ navigation }) {
  const { session } = useAuth();
  const { loading, error, data, reload } = useAsync(
    () => Api.getMyEnrollments(session.token, session.user.id),
    [session.token]
  );

  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data || data.length === 0) return <EmptyState message="Anda belum mengikuti kelas. Daftar dari tab Kelas." />;

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      data={data}
      keyExtractor={(i) => i.id}
      onRefresh={reload}
      refreshing={loading}
      renderItem={({ item }) => {
        const cls = (item.expand && item.expand.class) || { id: item.class, title: 'Kelas' };
        return (
          <TouchableOpacity
            onPress={() => navigation.navigate('ClassDetail', { classItem: cls })}
            style={{ backgroundColor: colors.card, padding: 16, borderRadius: 12, gap: 8 }}
          >
            <Text style={{ fontWeight: '700', color: colors.text }}>{cls.title}</Text>
            <ProgressBar value={item.progress || 0} />
            <Text style={{ color: colors.muted }}>{item.progress || 0}% selesai</Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}
