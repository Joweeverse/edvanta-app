import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Switch, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { Loading, ErrorState, EmptyState, Button, colors } from '../components/ui';
import { useAsync } from '../components/useAsync';
import { useAuth } from '../context/AuthContext';
import * as Api from '../services/ApiService';

// Diskusi per materi: kolom publik dan pesan privat antara siswa dan mentor kelas.
export default function DiscussionScreen({ route }) {
  const { lesson, classItem } = route.params;
  const { session } = useAuth();
  const isMentor = session.user.id === classItem.mentor;
  const [text, setText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [replyTo, setReplyTo] = useState(null); // { id, name } : mentor membalas privat
  const [busy, setBusy] = useState(false);

  const { loading, error, data, reload } = useAsync(
    () => Api.getDiscussions(session.token, lesson.id),
    [lesson.id]
  );

  const send = async () => {
    if (!text.trim()) { Alert.alert('Pesan kosong', 'Tulis pesan dulu.'); return; }
    const priv = isMentor ? !!replyTo : isPrivate;
    setBusy(true);
    try {
      await Api.postDiscussion(session.token, {
        lesson: lesson.id,
        user: session.user.id,
        message: text,
        isPrivate: priv,
        recipient: isMentor ? (replyTo && replyTo.id) : classItem.mentor,
      });
      setText('');
      setReplyTo(null);
      await reload();
    } catch (e) {
      Alert.alert('Gagal mengirim', e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      {(data || []).length === 0 ? (
        <EmptyState message="Belum ada diskusi. Mulai dengan bertanya." />
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16, gap: 10 }}
          data={data}
          keyExtractor={(i) => i.id}
          onRefresh={reload}
          refreshing={loading}
          renderItem={({ item }) => {
            const author = (item.expand && item.expand.user && item.expand.user.name) || 'Pengguna';
            const mine = item.user === session.user.id;
            return (
              <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%', backgroundColor: mine ? colors.selectedBg : colors.card, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border, gap: 4 }}>
                <Text style={{ fontWeight: '700', color: colors.accent, fontSize: 12 }}>
                  {author}{item.is_private ? ' · privat' : ''}
                </Text>
                <Text style={{ color: colors.text }}>{item.message}</Text>
                {isMentor && item.is_private && !mine ? (
                  <TouchableOpacity onPress={() => setReplyTo({ id: item.user, name: author })}>
                    <Text style={{ color: colors.primary, fontSize: 12 }}>Balas privat</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          }}
        />
      )}
      <View style={{ padding: 12, gap: 8, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border }}>
        {isMentor ? (
          replyTo ? (
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Text style={{ color: colors.primary }}>Membalas privat ke {replyTo.name} (ketuk untuk batal)</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Switch value={isPrivate} onValueChange={setIsPrivate} trackColor={{ true: colors.primary }} />
            <Text style={{ color: colors.text }}>Kirim privat ke mentor</Text>
          </View>
        )}
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Tulis pesan"
          placeholderTextColor={colors.muted}
          multiline
          style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.text, backgroundColor: colors.bg }}
        />
        <Button title={busy ? 'Mengirim...' : 'Kirim'} onPress={send} disabled={busy} />
      </View>
    </KeyboardAvoidingView>
  );
}
