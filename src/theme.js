import { Platform } from 'react-native';

// Palet bergaya batik dan kopi, sama arahnya dengan KatalogKu:
// latar krem, primer soga/terakota, aksen indigo, judul serif.
export const colors = {
  bg: '#FAF3E6',        // krem
  card: '#FFFDF8',
  primary: '#A4532B',   // soga / terakota
  primaryDark: '#7E3D1D',
  accent: '#2E3A6B',    // indigo
  text: '#3B2A20',      // cokelat kopi
  muted: '#8A7664',
  border: '#E4D5BF',
  ok: '#4C7A4A',
  okBg: '#E8F0E3',
  error: '#B3261E',
  errorBg: '#FBE9E7',
  selectedBg: '#F6E4D8',
};

export const fonts = {
  title: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
};

// Warna banner kartu kelas berdasarkan kategori (tanpa gambar, jadi tetap rapi).
const BANNERS = ['#A4532B', '#2E3A6B', '#6B4E2E', '#4C6B5A', '#7A3E55'];
export function bannerColor(seed = '') {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 997;
  return BANNERS[h % BANNERS.length];
}
