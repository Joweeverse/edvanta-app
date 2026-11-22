import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { API_URL, EXTERNAL_APIS } from '../config';

const TOKEN_KEY = 'edvanta_token';
const USER_KEY = 'edvanta_user';
const TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(url, { method = 'GET', body, headers = {} } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }
    if (!res.ok) {
      const msg = (data && (data.error || data.message)) || `Permintaan gagal (${res.status})`;
      throw new ApiError(msg, res.status);
    }
    return data;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (e.name === 'AbortError') throw new ApiError('Koneksi terlalu lama, coba lagi', 0);
    throw new ApiError('Tidak dapat terhubung ke server', 0);
  } finally {
    clearTimeout(timer);
  }
}

// ---------- Sesi ----------
// Token disimpan di SecureStore (terenkripsi), data pengguna di AsyncStorage.
export async function saveSession(token, user) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}
export async function loadSession() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const user = await AsyncStorage.getItem(USER_KEY);
  return token && user ? { token, user: JSON.parse(user) } : null;
}
export async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

// ---------- API sendiri (Edvanta) ----------
export async function login(email, password) {
  const d = await request(`${API_URL}/auth/auth-with-password`, {
    method: 'POST',
    body: { identity: email.trim(), password },
  });
  return { token: d.token, user: d.record };
}

export async function register({ name, email, password, passwordConfirm, role = 'student' }) {
  await request(`${API_URL}/auth/records`, {
    method: 'POST',
    body: { name: name.trim(), email: email.trim(), password, passwordConfirm, role },
  });
  return login(email, password);
}

export async function getClasses(token, page = 1) {
  const d = await request(`${API_URL}/classes?page=${page}&perPage=30&sort=-created`, {
    headers: authHeader(token),
  });
  return d.items || [];
}

export async function getLessons(token, classId) {
  const d = await request(
    `${API_URL}/lessons?filter=${encodeURIComponent(`class="${classId}"`)}&sort=order&perPage=100`,
    { headers: authHeader(token) }
  );
  return d.items || [];
}

export async function getQuizForLesson(token, lessonId) {
  const d = await request(
    `${API_URL}/quizzes?filter=${encodeURIComponent(`lesson="${lessonId}"`)}&perPage=1`,
    { headers: authHeader(token) }
  );
  return (d.items || [])[0] || null;
}

export async function getMyEnrollments(token, userId) {
  const d = await request(
    `${API_URL}/enrollments?filter=${encodeURIComponent(`user="${userId}"`)}&expand=class&perPage=100`,
    { headers: authHeader(token) }
  );
  return d.items || [];
}

export async function enroll(token, userId, classId) {
  return request(`${API_URL}/enrollments`, {
    method: 'POST',
    headers: authHeader(token),
    body: { user: userId, class: classId },
  });
}

export async function submitQuiz(token, quizId, answers) {
  return request(`${API_URL}/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: authHeader(token),
    body: { answers },
  });
}

// ---------- Mentor ----------
export async function getMyClasses(token, mentorId) {
  const d = await request(
    `${API_URL}/classes?filter=${encodeURIComponent(`mentor="${mentorId}"`)}&sort=-created&perPage=100`,
    { headers: authHeader(token) }
  );
  return d.items || [];
}

export async function createClass(token, mentorId, { title, category, description }) {
  return request(`${API_URL}/classes`, {
    method: 'POST',
    headers: authHeader(token),
    body: { title: title.trim(), category: category.trim(), description: description.trim(), mentor: mentorId },
  });
}

export async function createLesson(token, classId, order, { title, content, video_url }) {
  return request(`${API_URL}/lessons`, {
    method: 'POST',
    headers: authHeader(token),
    body: { class: classId, title: title.trim(), order, content: (content || '').trim(), video_url: (video_url || '').trim() },
  });
}

export async function getQuizzesForClass(token, classId) {
  const d = await request(
    `${API_URL}/quizzes?filter=${encodeURIComponent(`lesson.class="${classId}"`)}&perPage=100`,
    { headers: authHeader(token) }
  );
  return d.items || [];
}

export async function createQuiz(token, lessonId, { title, passing_score, questions }) {
  return request(`${API_URL}/quizzes`, {
    method: 'POST',
    headers: authHeader(token),
    body: {
      lesson: lessonId,
      title: title.trim(),
      passing_score: Number(passing_score),
      questions: questions.map((q) => ({
        question: q.question.trim(),
        options: q.options.map((o) => o.trim()).filter(Boolean),
        answer: q.answer,
      })),
    },
  });
}

export async function getClassStats(token, classId) {
  return request(`${API_URL}/classes/${classId}/stats`, { headers: authHeader(token) });
}

// ---------- Sertifikat, diskusi, profil ----------
export async function getClass(token, classId) {
  return request(`${API_URL}/classes/${classId}`, { headers: authHeader(token) });
}

// URL gambar template sertifikat buatan mentor (null bila belum ada).
export function certificateTemplateUrl(cls) {
  if (!cls || !cls.certificate_template) return null;
  return `${API_URL}/files/classes/${cls.id}/${encodeURIComponent(cls.certificate_template)}`;
}

// Mentor mengunggah gambar template (multipart). asset: hasil ImagePicker.
export function uploadCertificateTemplate(token, classId, asset) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('certificate_template', {
      uri: asset.uri,
      name: asset.name || asset.fileName || 'template.jpg',
      type: asset.mimeType || 'image/jpeg',
    });
    const xhr = new XMLHttpRequest();
    xhr.open('PATCH', `${API_URL}/classes/${classId}`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.timeout = 60000;
    xhr.onload = () => {
      let data = null;
      try { data = JSON.parse(xhr.responseText); } catch { data = null; }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new ApiError((data && (data.error || data.message)) || `Unggah gagal (${xhr.status})`, xhr.status));
    };
    xhr.onerror = () => reject(new ApiError('Tidak dapat terhubung ke server', 0));
    xhr.ontimeout = () => reject(new ApiError('Unggah terlalu lama, coba gambar yang lebih kecil', 0));
    xhr.send(form);
  });
}

export async function getCertificate(token, classId) {
  return request(`${API_URL}/classes/${classId}/certificate`, { method: 'POST', headers: authHeader(token) });
}

export async function getDiscussions(token, lessonId) {
  const d = await request(
    `${API_URL}/discussions?filter=${encodeURIComponent(`lesson="${lessonId}"`)}&sort=created&expand=user&perPage=100`,
    { headers: authHeader(token) }
  );
  return d.items || [];
}

export async function postDiscussion(token, { lesson, user, message, isPrivate, recipient }) {
  return request(`${API_URL}/discussions`, {
    method: 'POST',
    headers: authHeader(token),
    body: { lesson, user, message: message.trim(), is_private: !!isPrivate, ...(isPrivate && recipient ? { recipient } : {}) },
  });
}

export async function getMe(token, userId) {
  return request(`${API_URL}/auth/records/${userId}`, { headers: authHeader(token) });
}

export async function updateProfile(token, userId, { name, bio, portfolio_url }) {
  return request(`${API_URL}/auth/records/${userId}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: { name: name.trim(), bio: (bio || '').trim(), portfolio_url: (portfolio_url || '').trim() },
  });
}

// ---------- API kelompok lain ----------
export async function getExternal(api) {
  const headers = api.apiKey ? { 'X-API-Key': api.apiKey } : {};
  const d = await request(`${api.baseUrl}${api.path}`, { headers });
  const list = Array.isArray(d) ? d : d.items || d.data || [];
  return list.map(api.map);
}

export async function getAllExternal() {
  const results = await Promise.allSettled(EXTERNAL_APIS.map((a) => getExternal(a)));
  return EXTERNAL_APIS.map((a, i) => ({
    api: a,
    items: results[i].status === 'fulfilled' ? results[i].value : [],
    error: results[i].status === 'rejected' ? results[i].reason.message : null,
  }));
}
