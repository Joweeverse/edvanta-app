import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Button, Field, colors } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { validateRegister } from '../utils/validators';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', passwordConfirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm({ ...form, [k]: v });

  const submit = async () => {
    const e = validateRegister(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await signUp(form);
    } catch (err) {
      Alert.alert('Pendaftaran gagal', err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }} style={{ backgroundColor: colors.bg }}>
      <Field label="Nama" value={form.name} onChangeText={set('name')} error={errors.name} autoCapitalize="words" />
      <Field label="Email" value={form.email} onChangeText={set('email')} error={errors.email} keyboardType="email-address" />
      <Field label="Password" value={form.password} onChangeText={set('password')} error={errors.password} secureTextEntry />
      <Field label="Ulangi password" value={form.passwordConfirm} onChangeText={set('passwordConfirm')} error={errors.passwordConfirm} secureTextEntry />
      <Button title={busy ? 'Memproses...' : 'Daftar'} onPress={submit} disabled={busy} />
    </ScrollView>
  );
}
