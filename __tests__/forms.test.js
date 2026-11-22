import { isYouTubeUrl, validateClass, validateLesson, validateQuiz, validateProfile } from '../src/utils/validators';
import { buildCertificateHtml } from '../src/utils/certificateHtml';

describe('form mentor', () => {
  test('URL YouTube', () => {
    expect(isYouTubeUrl('https://youtu.be/abcdef123')).toBe(true);
    expect(isYouTubeUrl('https://www.youtube.com/watch?v=abcdef123')).toBe(true);
    expect(isYouTubeUrl('https://example.com/x')).toBe(false);
  });
  test('kelas wajib lengkap', () => {
    expect(Object.keys(validateClass({ title: '', category: '', description: '' }))).toHaveLength(3);
    expect(validateClass({ title: 'Dasar Web', category: 'Teknologi', description: 'Pengantar web dasar' })).toEqual({});
  });
  test('materi butuh teks atau video, video harus YouTube', () => {
    expect(validateLesson({ title: 'Bab 1', content: '', video_url: '' }).content).toBeDefined();
    expect(validateLesson({ title: 'Bab 1', content: '', video_url: 'https://x.com' }).video_url).toBeDefined();
    expect(validateLesson({ title: 'Bab 1', content: 'isi', video_url: '' })).toEqual({});
  });
  test('kuis: nilai, soal, dan kunci jawaban', () => {
    const ok = { question: 'A?', options: ['a', 'b', '', ''], answer: 1 };
    expect(validateQuiz({ title: 'Kuis 1', passing_score: '60', questions: [ok] })).toEqual({});
    expect(validateQuiz({ title: 'Kuis 1', passing_score: '0', questions: [ok] }).passing_score).toBeDefined();
    expect(validateQuiz({ title: 'Kuis 1', passing_score: '60', questions: [] }).questions).toBeDefined();
    expect(validateQuiz({ title: 'Kuis 1', passing_score: '60', questions: [{ ...ok, answer: 3 }] }).questions).toMatch(/kunci/);
  });
  test('profil: tautan portofolio', () => {
    expect(validateProfile({ name: 'Johan', portfolio_url: 'abc' }).portfolio_url).toBeDefined();
    expect(validateProfile({ name: 'Johan', portfolio_url: 'https://a.id' })).toEqual({});
  });
  test('sertifikat: HTML memuat data dan lolos escape', () => {
    const html = buildCertificateHtml({ student: 'A <b>', class_title: 'Kelas', mentor: 'M', code: 'EDV-1', issued_at: '2026-11-22 01:00:00Z' });
    expect(html).toContain('EDV-1');
    expect(html).toContain('A &lt;b&gt;');
  });
});

describe('template sertifikat', () => {
  const cert = { student: 'Budi', class_title: 'Kelas', mentor: 'M', code: 'EDV-2', issued_at: '2026-11-22' };
  test('tanpa template memakai desain bawaan', () => {
    const html = buildCertificateHtml(cert);
    expect(html).toContain('Sertifikat Kelulusan');
    expect(html).not.toContain('url(');
  });
  test('dengan template memakai gambar sebagai latar dan tetap memuat nama siswa', () => {
    const html = buildCertificateHtml(cert, 'data:image/png;base64,AAA');
    expect(html).toContain("url('data:image/png;base64,AAA')");
    expect(html).toContain('Budi');
  });
});
