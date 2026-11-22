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

test('createQuiz mengirim soal dengan pilihan terisi saja', async () => {
  fetch.mockReturnValueOnce(ok({ id: 'q1' }));
  await Api.createQuiz('T', 'L1', { title: ' K ', passing_score: '70', questions: [{ question: ' A? ', options: ['a', 'b', '', ''], answer: 0 }] });
  const body = JSON.parse(fetch.mock.calls[0][1].body);
  expect(body.passing_score).toBe(70);
  expect(body.questions[0].options).toEqual(['a', 'b']);
  expect(body.lesson).toBe('L1');
});

test('postDiscussion privat menyertakan recipient', async () => {
  fetch.mockReturnValueOnce(ok({ id: 'd1' }));
  await Api.postDiscussion('T', { lesson: 'L', user: 'U', message: ' hi ', isPrivate: true, recipient: 'M' });
  const body = JSON.parse(fetch.mock.calls[0][1].body);
  expect(body).toEqual({ lesson: 'L', user: 'U', message: 'hi', is_private: true, recipient: 'M' });
});

test('getCertificate memakai POST ke endpoint sertifikat', async () => {
  fetch.mockReturnValueOnce(ok({ code: 'EDV-X' }));
  await Api.getCertificate('T', 'C1');
  expect(fetch.mock.calls[0][0]).toMatch(/\/classes\/C1\/certificate$/);
  expect(fetch.mock.calls[0][1].method).toBe('POST');
});

test('certificateTemplateUrl menyusun URL berkas kelas', () => {
  expect(Api.certificateTemplateUrl({ id: 'c1' })).toBeNull();
  expect(Api.certificateTemplateUrl({ id: 'c1', certificate_template: 'a b.png' })).toMatch(/\/files\/classes\/c1\/a%20b\.png$/);
});
