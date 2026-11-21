// Alamat API sendiri. Saat build APK, nilainya datang dari eas.json (profile preview).
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://edvanta.stei.site/api';

// Layanan kelompok lain. Isi setelah mendapat base URL, kunci, dan dokumentasinya.
// Tiap entri: name, baseUrl, apiKey (kosongkan bila tidak perlu), path, dan fungsi map
// yang mengubah respons mereka menjadi { id, title, subtitle }.
export const EXTERNAL_APIS = [
  {
    key: 'kelompokA',
    name: 'Kelompok A (ganti nama)',
    baseUrl: 'https://GANTI-KELOMPOK-A.stei.fun/api',
    apiKey: '',
    path: '/GANTI-PATH',
    map: (r) => ({
      id: String(r.id),
      title: r.title || r.name || String(r.id),
      subtitle: r.description || '',
    }),
  },
  {
    key: 'kelompokB',
    name: 'Kelompok B (ganti nama)',
    baseUrl: 'https://GANTI-KELOMPOK-B.stei.site/api',
    apiKey: '',
    path: '/GANTI-PATH',
    map: (r) => ({
      id: String(r.id),
      title: r.title || r.name || String(r.id),
      subtitle: r.description || '',
    }),
  },
];
