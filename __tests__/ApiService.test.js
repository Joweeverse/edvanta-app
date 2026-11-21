import * as Api from '../src/services/ApiService';

const ok = (body) => Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });
const fail = (status, body) => Promise.resolve({ ok: false, status, text: () => Promise.resolve(JSON.stringify(body)) });

beforeEach(() => { global.fetch = jest.fn(); });

test('login mengirim identity dan mengembalikan token', async () => {
  fetch.mockReturnValueOnce(ok({ token: 'T', record: { id: 'u1' } }));
  const r = await Api.login(' a@b.co ', 'pw');
  expect(r.token).toBe('T');
  const [url, opts] = fetch.mock.calls[0];
  expect(url).toMatch(/\/auth\/auth-with-password$/);
  expect(JSON.parse(opts.body)).toEqual({ identity: 'a@b.co', password: 'pw' });
});

test('getClasses memakai header Bearer', async () => {
  fetch.mockReturnValueOnce(ok({ items: [{ id: 'c1' }] }));
  const r = await Api.getClasses('TOK');
  expect(r).toHaveLength(1);
  expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer TOK');
});

test('error server menjadi ApiError dengan pesan', async () => {
  fetch.mockReturnValueOnce(fail(401, { error: 'X-API-Key atau Bearer token diperlukan' }));
  await expect(Api.getClasses('')).rejects.toMatchObject({ status: 401 });
});

test('jaringan putus menjadi pesan yang ramah', async () => {
  fetch.mockRejectedValueOnce(new Error('network'));
  await expect(Api.getClasses('T')).rejects.toThrow('Tidak dapat terhubung ke server');
});

test('getExternal mengirim X-API-Key dan memetakan hasil', async () => {
  fetch.mockReturnValueOnce(ok({ items: [{ id: 1, name: 'A', description: 'd' }] }));
  const api = { baseUrl: 'https://x.test/api', path: '/p', apiKey: 'K', map: (r) => ({ id: String(r.id), title: r.name, subtitle: r.description }) };
  const r = await Api.getExternal(api);
  expect(r).toEqual([{ id: '1', title: 'A', subtitle: 'd' }]);
  expect(fetch.mock.calls[0][1].headers['X-API-Key']).toBe('K');
});

test('submitQuiz memanggil endpoint submit', async () => {
  fetch.mockReturnValueOnce(ok({ score: 100, passed: true }));
  const r = await Api.submitQuiz('T', 'q1', [0, 1]);
  expect(r.passed).toBe(true);
  expect(fetch.mock.calls[0][0]).toMatch(/\/quizzes\/q1\/submit$/);
});

test('sesi: simpan lalu muat mengembalikan null bila token kosong', async () => {
  await Api.saveSession('T', { id: 'u1' });
  expect(await Api.loadSession()).toBeNull();
});
