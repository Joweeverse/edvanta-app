import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Button, Field, colors } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { validateClass } from '../utils/validators';
import * as Api from '../services/ApiService';

export default function CreateClassScreen({ navigation }) {
  const { session } = useAuth();
  const [form, setForm] = useState({ title: '', category: '', description: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm({ ...form, [k]: v });

  const submit = async () => {
    const e = validateClass(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const created = await Api.createClass(session.token, session.user.id, form);
      navigation.replace('MentorClass', { classItem: created });
    } catch (err) {
      Alert.alert('Gagal membuat kelas', err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20 }}>
      <Field label="Judul kelas" value={form.title} onChangeText={set('title')} error={errors.title} autoCapitalize="sentences" />
      <Field label="Kategori" value={form.category} onChangeText={set('category')} error={errors.category} autoCapitalize="words" />
      <Field label="Deskripsi" value={form.description} onChangeText={set('description')} error={errors.description}
        multiline numberOfLines={4} autoCapitalize="sentences" />
      <Button title={busy ? 'Menyimpan...' : 'Simpan kelas'} onPress={submit} disabled={busy} />
    </ScrollView>
  );
}
