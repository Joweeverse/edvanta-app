import React, { useEffect } from 'react';
import { View, Text, Linking } from 'react-native';
import { Button, Heading, colors } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import * as Api from '../services/ApiService';

export default function ProfileScreen({ navigation }) {
  const { session, signOut, updateUser } = useAuth();
  const u = session.user;
  const isMentor = u.role === 'mentor';

  // Muat ulang data akun (poin kredibilitas dapat berubah di server).
  useEffect(() => {
    const refresh = () => Api.getMe(session.token, u.id).then(updateUser).catch(() => {});
    refresh();
    return navigation.addListener('focus', refresh);
  }, [navigation, session.token, u.id, updateUser]);

  return (
    <View style={{ flex: 1, padding: 24, gap: 10, backgroundColor: colors.bg }}>
      <Heading>{u.name || 'Pengguna'}</Heading>
      <Text style={{ color: colors.muted }}>{u.email}</Text>
      <Text style={{ color: colors.muted }}>Peran: {isMentor ? 'Mentor' : 'Siswa'}</Text>
      {isMentor ? (
        <View style={{ backgroundColor: colors.card, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, gap: 4 }}>
          <Text style={{ fontWeight: '700', color: colors.primary, fontSize: 22 }}>{u.credibility_points || 0}</Text>
          <Text style={{ color: colors.muted }}>Poin kredibilitas (bertambah tiap siswa baru mendaftar)</Text>
        </View>
      ) : null}
      {u.bio ? <Text style={{ color: colors.text }}>{u.bio}</Text> : null}
      {u.portfolio_url ? (
        <Text style={{ color: colors.accent }} onPress={() => Linking.openURL(u.portfolio_url)}>{u.portfolio_url}</Text>
      ) : null}
      <View style={{ height: 8 }} />
      <Button title="Edit profil" secondary onPress={() => navigation.navigate('EditProfile')} />
      <Button title="Keluar" onPress={signOut} />
    </View>
  );
}
