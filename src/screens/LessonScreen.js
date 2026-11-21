import React from 'react';
import { ScrollView, Text, Linking } from 'react-native';
import { Button, Loading, ErrorState, Heading, colors } from '../components/ui';
import { useAsync } from '../components/useAsync';
import { useAuth } from '../context/AuthContext';
import * as Api from '../services/ApiService';

export default function LessonScreen({ route, navigation }) {
  const { lesson } = route.params;
  const { session } = useAuth();
  const { loading, error, data: quiz, reload } = useAsync(
    () => Api.getQuizForLesson(session.token, lesson.id),
    [lesson.id]
  );

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Heading>{lesson.title}</Heading>
      <Text style={{ color: colors.text, lineHeight: 22 }}>{lesson.content || 'Materi ini belum memiliki isi teks.'}</Text>
      {lesson.video_url ? <Button title="Buka video" secondary onPress={() => Linking.openURL(lesson.video_url)} /> : null}
      {quiz ? (
        <Button title={`Kerjakan kuis: ${quiz.title}`} onPress={() => navigation.navigate('Quiz', { quiz, lesson })} />
      ) : (
        <Text style={{ color: colors.muted }}>Materi ini belum memiliki kuis.</Text>
      )}
    </ScrollView>
  );
}
