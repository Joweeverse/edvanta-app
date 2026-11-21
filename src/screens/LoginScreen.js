import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Button, Field, fonts, colors } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { validateLogin } from '../utils/validators';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const e = validateLogin(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await signIn(form.email, form.password);
    } catch (err) {
      Alert.alert('Login gagal', err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 80 }} style={{ backgroundColor: colors.bg }}>
      <Text style={{ fontSize: 34, fontWeight: '700', color: colors.primary, fontFamily: fonts.title }}>Edvanta</Text>
      <Text style={{ color: colors.muted, marginBottom: 28 }}>Belajar di kelas digital</Text>
      <Field label="Email" value={form.email} keyboardType="email-address" error={errors.email}
        onChangeText={(v) => setForm({ ...form, email: v })} placeholder="nama@email.com" />
      <Field label="Password" value={form.password} secureTextEntry error={errors.password}
        onChangeText={(v) => setForm({ ...form, password: v })} placeholder="Password" />
      <Button title={busy ? 'Memproses...' : 'Masuk'} onPress={submit} disabled={busy} />
      <View style={{ height: 12 }} />
      <Button title="Belum punya akun? Daftar" secondary onPress={() => navigation.navigate('Register')} />
    </ScrollView>
  );
}
