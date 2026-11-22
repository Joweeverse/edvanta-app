import React, { useEffect } from 'react';
import { FlatList, View } from 'react-native';
import { Loading, ErrorState, EmptyState, ClassCard, Button, colors } from '../components/ui';
import { useAsync } from '../components/useAsync';
import { useAuth } from '../context/AuthContext';
import * as Api from '../services/ApiService';

// Tab "Kelas Diampu" untuk mentor: kelas milik sendiri dan tombol membuat kelas baru.
export default function MentorClassesScreen({ navigation }) {
  const { session } = useAuth();
  const { loading, error, data, reload } = useAsync(
    () => Api.getMyClasses(session.token, session.user.id),
    [session.token, session.user.id]
  );

  useEffect(() => navigation.addListener('focus', reload), [navigation, reload]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 14 }}
      data={data || []}
      keyExtractor={(i) => i.id}
      onRefresh={reload}
      refreshing={loading}
      ListHeaderComponent={<Button title="+ Buat kelas baru" onPress={() => navigation.navigate('CreateClass')} />}
      ListEmptyComponent={<EmptyState message="Anda belum membuat kelas." />}
      renderItem={({ item }) => (
        <ClassCard item={item} onPress={() => navigation.navigate('MentorClass', { classItem: item })} />
      )}
    />
  );
}
