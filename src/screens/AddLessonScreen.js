import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Button, Field, colors } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { validateLesson } from '../utils/validators';
import * as Api from '../services/ApiService';

export default function AddLessonScreen({ route, navigation }) {
  const { classItem, nextOrder } = route.params;
  const { session } = useAuth();
  const [form, setForm] = useState({ title: '', content: '', video_url: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm({ ...form, [k]: v });

  const submit = async () => {
    const e = validateLesson(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await Api.createLesson(session.token, classItem.id, nextOrder, form);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Gagal menambah materi', err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20 }}>
      <Field label={`Judul materi (urutan ${nextOrder})`} value={form.title} onChangeText={set('title')} error={errors.title} autoCapitalize="sentences" />
      <Field label="Isi materi (teks)" value={form.content} onChangeText={set('content')} error={errors.content}
        multiline numberOfLines={6} autoCapitalize="sentences" />
      <Field label="Tautan YouTube (opsional)" value={form.video_url} onChangeText={set('video_url')} error={errors.video_url}
        keyboardType="url" placeholder="https://youtu.be/..." />
      <Button title={busy ? 'Menyimpan...' : 'Simpan materi'} onPress={submit} disabled={busy} />
    </ScrollView>
  );
}
