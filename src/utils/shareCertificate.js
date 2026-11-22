import * as Print from 'expo-print';
import { buildCertificateHtml, CERT_WIDTH, CERT_HEIGHT } from './certificateHtml';

// Mengunduh gambar template sebagai data URI agar ikut tercetak. Gagal diam-diam:
// bila template tidak terjangkau, sertifikat memakai template bawaan aplikasi.
async function toDataUri(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return null;
  }
}

// Membuka dialog cetak sistem. Pengguna memilih "Simpan sebagai PDF" untuk mengunduh.
// Cara ini tidak membutuhkan akses berkas, sehingga aman di Expo Go maupun APK.
export async function shareCertificate(cert, templateUrl) {
  const dataUri = templateUrl ? await toDataUri(templateUrl) : null;
  const html = buildCertificateHtml(cert, dataUri);
  await Print.printAsync({ html, width: CERT_WIDTH, height: CERT_HEIGHT });
}
