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

export async function register({ name, email, password, passwordConfirm }) {
  await request(`${API_URL}/auth/records`, {
    method: 'POST',
    body: { name: name.trim(), email: email.trim(), password, passwordConfirm, role: 'student' },
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
