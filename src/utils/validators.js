export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email || !email.trim()) errors.email = 'Email wajib diisi';
  else if (!isValidEmail(email)) errors.email = 'Format email tidak valid';
  if (!password) errors.password = 'Password wajib diisi';
  return errors;
}

export function validateRegister({ name, email, password, passwordConfirm }) {
  const errors = {};
  if (!name || name.trim().length < 3) errors.name = 'Nama minimal 3 karakter';
  if (!email || !email.trim()) errors.email = 'Email wajib diisi';
  else if (!isValidEmail(email)) errors.email = 'Format email tidak valid';
  if (!password || password.length < 8) errors.password = 'Password minimal 8 karakter';
  if (passwordConfirm !== password) errors.passwordConfirm = 'Konfirmasi password tidak sama';
  return errors;
}

export const isYouTubeUrl = (v) =>
  /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]{6,}/.test((v || '').trim());

export function validateClass({ title, category, description }) {
  const errors = {};
  if (!title || title.trim().length < 3) errors.title = 'Judul minimal 3 karakter';
  if (!category || !category.trim()) errors.category = 'Kategori wajib diisi';
  if (!description || description.trim().length < 10) errors.description = 'Deskripsi minimal 10 karakter';
  return errors;
}

export function validateLesson({ title, content, video_url }) {
  const errors = {};
  if (!title || title.trim().length < 3) errors.title = 'Judul minimal 3 karakter';
  const hasVideo = video_url && video_url.trim();
  if (!(content && content.trim()) && !hasVideo) errors.content = 'Isi teks atau tautan YouTube wajib diisi';
  if (hasVideo && !isYouTubeUrl(video_url)) errors.video_url = 'Tautan harus berupa URL YouTube';
  return errors;
}

// questions: [{ question, options: [..4], answer: index }]
export function validateQuiz({ title, passing_score, questions }) {
  const errors = {};
  if (!title || title.trim().length < 3) errors.title = 'Judul kuis minimal 3 karakter';
  const score = Number(passing_score);
  if (!Number.isFinite(score) || score < 1 || score > 100) errors.passing_score = 'Nilai minimum 1 sampai 100';
  if (!questions || questions.length === 0) {
    errors.questions = 'Tambahkan minimal satu soal';
  } else {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const filled = (q.options || []).filter((o) => o && o.trim());
      if (!q.question || !q.question.trim()) { errors.questions = `Soal ${i + 1}: pertanyaan kosong`; break; }
      if (filled.length < 2) { errors.questions = `Soal ${i + 1}: isi minimal dua pilihan`; break; }
      if (!q.options[q.answer] || !q.options[q.answer].trim()) { errors.questions = `Soal ${i + 1}: kunci jawaban menunjuk pilihan kosong`; break; }
    }
  }
  return errors;
}

export function validateProfile({ name, portfolio_url }) {
  const errors = {};
  if (!name || name.trim().length < 3) errors.name = 'Nama minimal 3 karakter';
  if (portfolio_url && portfolio_url.trim() && !/^https?:\/\/\S+\.\S+/.test(portfolio_url.trim())) {
    errors.portfolio_url = 'Tautan harus diawali http:// atau https://';
  }
  return errors;
}
