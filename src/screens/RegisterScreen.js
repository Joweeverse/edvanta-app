import React, { useState } from 'react';
import { ScrollView, Alert, View, Text, TouchableOpacity } from 'react-native';
import { Button, Field, colors } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { validateRegister } from '../utils/validators';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', passwordConfirm: '', role: 'student' });
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
      <Text style={{ fontWeight: '600', color: colors.text, marginBottom: 6 }}>Daftar sebagai</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        {[['student', 'Siswa'], ['mentor', 'Mentor']].map(([val, label]) => (
          <TouchableOpacity key={val} onPress={() => setForm({ ...form, role: val })}
            style={{ flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center',
              borderColor: form.role === val ? colors.primary : colors.border,
              backgroundColor: form.role === val ? colors.selectedBg : colors.card }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Field label="Nama" value={form.name} onChangeText={set('name')} error={errors.name} autoCapitalize="words" />
      <Field label="Email" value={form.email} onChangeText={set('email')} error={errors.email} keyboardType="email-address" />
      <Field label="Password" value={form.password} onChangeText={set('password')} error={errors.password} secureTextEntry />
      <Field label="Ulangi password" value={form.passwordConfirm} onChangeText={set('passwordConfirm')} error={errors.passwordConfirm} secureTextEntry />
      <Button title={busy ? 'Memproses...' : 'Daftar'} onPress={submit} disabled={busy} />
    </ScrollView>
  );
}
