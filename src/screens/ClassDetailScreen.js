import React, { useState } from 'react';
import { ScrollView, Text, View, Alert, TouchableOpacity } from 'react-native';
import { Button, Loading, ErrorState, EmptyState, ProgressBar, Heading, colors } from '../components/ui';
import { useAsync } from '../components/useAsync';
import { useAuth } from '../context/AuthContext';
import * as Api from '../services/ApiService';

export default function ClassDetailScreen({ route, navigation }) {
  const { classItem } = route.params;
  const { session } = useAuth();
  const [busy, setBusy] = useState(false);

  const { loading, error, data, reload } = useAsync(async () => {
    const [lessons, enrollments] = await Promise.all([
      Api.getLessons(session.token, classItem.id),
      Api.getMyEnrollments(session.token, session.user.id),
    ]);
    const enrollment = enrollments.find((e) => e.class === classItem.id) || null;
    return { lessons, enrollment };
  }, [classItem.id]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const { lessons, enrollment } = data;
  const done = enrollment ? enrollment.completed_lessons || [] : [];

  const doEnroll = async () => {
    setBusy(true);
    try {
      await Api.enroll(session.token, session.user.id, classItem.id);
      await reload();
    } catch (e) {
      Alert.alert('Gagal mendaftar', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Heading>{classItem.title}</Heading>
      <Text style={{ color: colors.muted }}>{classItem.description}</Text>

      {enrollment ? (
        <View style={{ gap: 6 }}>
          <Text style={{ color: colors.text }}>Progres: {enrollment.progress || 0}%</Text>
          <ProgressBar value={enrollment.progress || 0} />
        </View>
      ) : (
        <Button title={busy ? 'Memproses...' : 'Daftar ke kelas ini'} onPress={doEnroll} disabled={busy} />
      )}

      <Text style={{ fontWeight: '700', marginTop: 8, color: colors.text }}>Materi</Text>
      {lessons.length === 0 ? (
        <EmptyState message="Belum ada materi." />
      ) : (
        lessons.map((l) => (
          <TouchableOpacity
            key={l.id}
            disabled={!enrollment}
            onPress={() => navigation.navigate('Lesson', { lesson: l, classItem })}
            style={{ backgroundColor: colors.card, padding: 14, borderRadius: 10, opacity: enrollment ? 1 : 0.6 }}
          >
            <Text style={{ fontWeight: '600', color: colors.text }}>
              {l.order}. {l.title} {done.includes(l.id) ? '✓' : ''}
            </Text>
          </TouchableOpacity>
        ))
      )}
      {!enrollment && lessons.length > 0 ? (
        <Text style={{ color: colors.muted, fontSize: 12 }}>Daftar dulu untuk membuka materi.</Text>
      ) : null}
    </ScrollView>
  );
}
