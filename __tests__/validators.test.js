import { isValidEmail, validateLogin, validateRegister } from '../src/utils/validators';

describe('validators', () => {
  test('email valid dan tidak valid', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('abc')).toBe(false);
  });
  test('login kosong menghasilkan dua error', () => {
    const e = validateLogin({ email: '', password: '' });
    expect(e.email).toBeDefined();
    expect(e.password).toBeDefined();
  });
  test('login benar tanpa error', () => {
    expect(validateLogin({ email: 'a@b.co', password: 'x' })).toEqual({});
  });
  test('register: password pendek dan konfirmasi beda', () => {
    const e = validateRegister({ name: 'Jo', email: 'a@b.co', password: '123', passwordConfirm: '456' });
    expect(e.name).toBeDefined();
    expect(e.password).toBeDefined();
    expect(e.passwordConfirm).toBeDefined();
  });
  test('register valid', () => {
    expect(validateRegister({ name: 'Johan', email: 'a@b.co', password: '12345678', passwordConfirm: '12345678' })).toEqual({});
  });
});
