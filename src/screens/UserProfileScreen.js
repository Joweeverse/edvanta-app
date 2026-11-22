import React from 'react';
import { ScrollView, Text, View, Linking } from 'react-native';
import { Button, Loading, ErrorState, Heading, colors } from '../components/ui';
import { useAsync } from '../components/useAsync';
import { useAuth } from '../context/AuthContext';
import * as Api from '../services/ApiService';

// Profil publik pengguna lain: nama, bio singkat, tautan portofolio
// (dan poin kredibilitas bila pengguna itu mentor). Email tidak ditampilkan.
export default function UserProfileScreen({ route, navigation }) {
  const { userId } = route.params;
  const { session } = useAuth();
  const { loading, error, data, reload } = useAsync(() => Api.getMe(session.token, userId), [userId]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const u = data;
  const isMentor = u.role === 'mentor';
  const isMe = u.id === session.user.id;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 24, gap: 12 }}>
      <Heading>{u.name || 'Pengguna'}</Heading>
      <Text style={{ color: colors.muted }}>{isMentor ? 'Mentor' : 'Siswa'}</Text>

      {isMentor ? (
        <View style={{ backgroundColor: colors.card, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontWeight: '700', color: colors.primary, fontSize: 22 }}>{u.credibility_points || 0}</Text>
          <Text style={{ color: colors.muted }}>Poin kredibilitas</Text>
        </View>
      ) : null}

      <Text style={{ color: colors.text }}>{u.bio ? u.bio : 'Belum ada bio.'}</Text>

      {u.portfolio_url ? (
        <Text style={{ color: colors.accent }} onPress={() => Linking.openURL(u.portfolio_url)}>
          {u.portfolio_url}
        </Text>
      ) : (
        <Text style={{ color: colors.muted }}>Belum ada tautan portofolio.</Text>
      )}

      {isMe ? <Button title="Edit profil saya" secondary onPress={() => navigation.navigate('EditProfile')} /> : null}
    </ScrollView>
  );
}