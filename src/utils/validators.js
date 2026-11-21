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
