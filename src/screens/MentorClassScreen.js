import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Button, Loading, ErrorState, EmptyState, Heading, colors } from '../components/ui';
import { useAsync } from '../components/useAsync';
import { useAuth } from '../context/AuthContext';
import * as Api from '../services/ApiService';
import { shareCertificate } from '../utils/shareCertificate';

function Stat({ label, value }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.primary }}>{value}</Text>
      <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

// Dasbor mentor: statistik kelas, daftar materi, tambah materi, dan buat kuis.
export default function MentorClassScreen({ route, navigation }) {
  const { classItem } = route.params;
  const { session } = useAuth();
  const [busy, setBusy] = useState(false);

  const { loading, error, data, reload } = useAsync(async () => {
    const [stats, lessons, quizzes, cls] = await Promise.all([
      Api.getClassStats(session.token, classItem.id),
      Api.getLessons(session.token, classItem.id),
      Api.getQuizzesForClass(session.token, classItem.id),
      Api.getClass(session.token, classItem.id),
    ]);
    return { stats, lessons, quizzes, cls };
  }, [classItem.id]);

  useEffect(() => navigation.addListener('focus', reload), [navigation, reload]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const { stats, lessons, quizzes, cls } = data;

  const pickTemplate = async () => {
  const res = await DocumentPicker.getDocumentAsync({
    type: ['image/png', 'image/jpeg'],
    copyToCacheDirectory: true,
  });
    if (res.canceled || !res.assets || res.assets.length === 0) return;
    const asset = res.assets[0];
    if (asset.size && asset.size > 5 * 1024 * 1024) {
      Alert.alert('Gambar terlalu besar', 'Gunakan gambar di bawah 5 MB.');
      return;
    }
    setBusy(true);
    try {
      await Api.uploadCertificateTemplate(session.token, classItem.id, asset);
      await reload();
      Alert.alert('Berhasil', 'Template sertifikat disimpan.');
    } catch (e) {
      Alert.alert('Gagal mengunggah', e.message);
    } finally {
      setBusy(false);
    }
  };

  const preview = async () => {
    setBusy(true);
    try {
      await shareCertificate(
        { student: 'Nama Siswa', class_title: cls.title, mentor: session.user.name || 'Mentor', code: 'EDV-PRATINJAU', issued_at: new Date().toISOString() },
        Api.certificateTemplateUrl(cls)
      );
    } catch (e) {
      Alert.alert('Pratinjau gagal', e.message);
    } finally {
      setBusy(false);
    }
  };
  const quizOf = (lessonId) => quizzes.find((q) => q.lesson === lessonId);

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Heading>{classItem.title}</Heading>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Stat label="Peserta" value={stats.participants} />
        <Stat label="Lulus" value={stats.completed} />
        <Stat label="Rata-rata progres" value={`${stats.average_progress}%`} />
      </View>
      <Text style={{ color: colors.muted }}>Poin kredibilitas Anda: {stats.mentor_points}</Text>

      <View style={{ backgroundColor: colors.card, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
        <Text style={{ fontWeight: '700', color: colors.text }}>Template sertifikat</Text>
        <Text style={{ color: colors.muted, fontSize: 12 }}>
          {cls.certificate_template
            ? 'Template buatan Anda dipakai. Nama siswa ditaruh di tengah gambar, jadi sisakan ruang kosong di sana.'
            : 'Memakai template bawaan aplikasi. Unggah gambar (PNG atau JPG) untuk memakai template sendiri.'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title={busy ? 'Memproses...' : 'Pilih gambar template'} secondary onPress={pickTemplate} disabled={busy} />
          <Button title="Pratinjau" secondary onPress={preview} disabled={busy} />
        </View>
      </View>

      <Text style={{ fontWeight: '700', color: colors.text, marginTop: 8 }}>Materi ({lessons.length})</Text>
      {lessons.length === 0 ? <EmptyState message="Belum ada materi." /> : lessons.map((l) => {
        const quiz = quizOf(l.id);
        return (
          <View key={l.id} style={{ backgroundColor: colors.card, padding: 14, borderRadius: 10, gap: 8, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontWeight: '600', color: colors.text }}>{l.order}. {l.title}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              {quiz ? `Kuis: ${quiz.title} (min. ${quiz.passing_score})` : 'Belum ada kuis'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {!quiz ? <Button title="Buat kuis" secondary onPress={() => navigation.navigate('CreateQuiz', { lesson: l })} /> : null}
              <Button title="Diskusi" secondary onPress={() => navigation.navigate('Discussion', { lesson: l, classItem })} />
            </View>
          </View>
        );
      })}
      <Button title="+ Tambah materi" onPress={() => navigation.navigate('AddLesson', { classItem, nextOrder: lessons.length + 1 })} />
    </ScrollView>
  );
}
