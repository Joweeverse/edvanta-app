import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Button, Field, colors } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { validateProfile } from '../utils/validators';
import * as Api from '../services/ApiService';

export default function EditProfileScreen({ navigation }) {
  const { session, updateUser } = useAuth();
  const u = session.user;
  const [form, setForm] = useState({ name: u.name || '', bio: u.bio || '', portfolio_url: u.portfolio_url || '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm({ ...form, [k]: v });

  const submit = async () => {
    const e = validateProfile(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const updated = await Api.updateProfile(session.token, u.id, form);
      await updateUser(updated);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Gagal menyimpan', err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20 }}>
      <Field label="Nama" value={form.name} onChangeText={set('name')} error={errors.name} autoCapitalize="words" />
      <Field label="Bio singkat" value={form.bio} onChangeText={set('bio')} multiline numberOfLines={3} autoCapitalize="sentences" />
      <Field label="Tautan portofolio" value={form.portfolio_url} onChangeText={set('portfolio_url')} error={errors.portfolio_url}
        keyboardType="url" placeholder="https://..." />
      <Button title={busy ? 'Menyimpan...' : 'Simpan'} onPress={submit} disabled={busy} />
    </ScrollView>
  );
}
