# Edvanta (aplikasi mobile)

Aplikasi React Native (Expo) untuk layanan Edvanta Classroom Service. Siswa mendaftar, membuka kelas, membaca materi, mengerjakan kuis yang dinilai server, dan melihat progres.

## Menjalankan

```
npm install
cp .env.example .env      # isi EXPO_PUBLIC_API_URL bila perlu
npx expo start
npm test
```

## Build APK

```
eas build -p android --profile preview
```

URL API untuk APK diambil dari `eas.json` (profile `preview`, https).

## Akun demo

Diisi sebelum dikumpulkan: siswa `EMAIL_DEMO` / `PASSWORD_DEMO`.

## Struktur

- `src/services/ApiService.js`: semua pemanggilan API (Edvanta dan kelompok lain)
- `src/config.js`: URL API sendiri dan daftar API kelompok lain
- `src/screens`: Login, Register, daftar kelas, detail kelas, materi, kuis, kelas saya, jelajah, profil
- `__tests__`: pengujian Jest
