import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { Button, Field, colors } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { validateQuiz } from '../utils/validators';
import * as Api from '../services/ApiService';

const emptyQuestion = () => ({ question: '', options: ['', '', '', ''], answer: 0 });

export default function CreateQuizScreen({ route, navigation }) {
  const { lesson } = route.params;
  const { session } = useAuth();
  const [title, setTitle] = useState('');
  const [passing, setPassing] = useState('60');
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const patchQ = (i, patch) => setQuestions(questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  const patchOpt = (i, oi, v) => patchQ(i, { options: questions[i].options.map((o, k) => (k === oi ? v : o)) });

  const submit = async () => {
    const form = { title, passing_score: passing, questions };
    const e = validateQuiz(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await Api.createQuiz(session.token, lesson.id, form);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Gagal membuat kuis', err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 8 }}>
      <Text style={{ color: colors.muted }}>Materi: {lesson.title}</Text>
      <Field label="Judul kuis" value={title} onChangeText={setTitle} error={errors.title} autoCapitalize="sentences" />
      <Field label="Nilai minimum lulus (1 sampai 100)" value={passing} onChangeText={setPassing} error={errors.passing_score} keyboardType="numeric" />

      {questions.map((q, i) => (
        <View key={i} style={{ backgroundColor: colors.card, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.border, marginBottom: 8 }}>
          <Field label={`Soal ${i + 1}`} value={q.question} onChangeText={(v) => patchQ(i, { question: v })} autoCapitalize="sentences" />
          {q.options.map((o, oi) => (
            <View key={oi} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <TouchableOpacity onPress={() => patchQ(i, { answer: oi })} accessibilityLabel={`Jawaban benar pilihan ${oi + 1}`}
                style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                {q.answer === oi ? <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary }} /> : null}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Field label="" value={o} onChangeText={(v) => patchOpt(i, oi, v)} placeholder={`Pilihan ${oi + 1}`} autoCapitalize="sentences" />
              </View>
            </View>
          ))}
          <Text style={{ color: colors.muted, fontSize: 12 }}>Ketuk lingkaran untuk menandai kunci jawaban.</Text>
          {questions.length > 1 ? (
            <Button title="Hapus soal" secondary onPress={() => setQuestions(questions.filter((_, idx) => idx !== i))} />
          ) : null}
        </View>
      ))}
      {errors.questions ? <Text style={{ color: colors.error }}>{errors.questions}</Text> : null}
      <Button title="+ Tambah soal" secondary onPress={() => setQuestions([...questions, emptyQuestion()])} />
      <Button title={busy ? 'Menyimpan...' : 'Simpan kuis'} onPress={submit} disabled={busy} />
    </ScrollView>
  );
}
