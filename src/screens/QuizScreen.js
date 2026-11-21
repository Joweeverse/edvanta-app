import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { Button, colors } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import * as Api from '../services/ApiService';

export default function QuizScreen({ route }) {
  const { quiz } = route.params;
  const { session } = useAuth();
  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async () => {
    if (answers.some((a) => a === null)) {
      Alert.alert('Belum lengkap', 'Jawab semua pertanyaan dulu.');
      return;
    }
    setBusy(true);
    try {
      setResult(await Api.submitQuiz(session.token, quiz.id, answers));
    } catch (e) {
      Alert.alert('Gagal mengirim', e.message);
    } finally {
      setBusy(false);
    }
  };

  if (questions.length === 0) {
    return <View style={{ padding: 24 }}><Text style={{ color: colors.muted }}>Kuis ini belum memiliki pertanyaan.</Text></View>;
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      {questions.map((q, qi) => (
        <View key={qi} style={{ backgroundColor: colors.card, padding: 14, borderRadius: 10, gap: 8 }}>
          <Text style={{ fontWeight: '700', color: colors.text }}>{qi + 1}. {q.question}</Text>
          {(q.options || []).map((opt, oi) => {
            const picked = answers[qi] === oi;
            return (
              <TouchableOpacity
                key={oi}
                disabled={!!result}
                onPress={() => setAnswers(answers.map((a, i) => (i === qi ? oi : a)))}
                style={{ padding: 10, borderRadius: 8, borderWidth: 1, borderColor: picked ? colors.primary : colors.border, backgroundColor: picked ? colors.selectedBg : '#fff' }}
              >
                <Text style={{ color: colors.text }}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
      {result ? (
        <View style={{ backgroundColor: result.passed ? colors.okBg : colors.errorBg, padding: 16, borderRadius: 10 }}>
          <Text style={{ fontWeight: '800', fontSize: 18, color: result.passed ? colors.ok : colors.error }}>
            {result.passed ? 'Lulus' : 'Belum lulus'}: nilai {result.score}
          </Text>
          <Text style={{ color: colors.text }}>Benar {result.correct} dari {result.total}. Progres kelas {result.progress}%.</Text>
        </View>
      ) : (
        <Button title={busy ? 'Mengirim...' : 'Kirim jawaban'} onPress={submit} disabled={busy} />
      )}
    </ScrollView>
  );
}
