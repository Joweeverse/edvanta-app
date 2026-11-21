import React from 'react';
import { View, Text } from 'react-native';
import { Button, Heading, colors } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const u = session.user;
  return (
    <View style={{ flex: 1, padding: 24, gap: 10, backgroundColor: colors.bg }}>
      <Heading>{u.name || 'Pengguna'}</Heading>
      <Text style={{ color: colors.muted }}>{u.email}</Text>
      <Text style={{ color: colors.muted }}>Peran: {u.role || 'student'}</Text>
      <View style={{ height: 12 }} />
      <Button title="Keluar" onPress={signOut} />
    </View>
  );
}
