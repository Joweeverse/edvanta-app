const esc = (v) =>
  String(v || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const CERT_WIDTH = 842; // A4 landscape, satuan titik
export const CERT_HEIGHT = 595;

// Menyusun HTML sertifikat dari respons POST /classes/{id}/certificate.
// templateDataUri (opsional): gambar template buatan mentor, dipakai sebagai latar penuh.
// Teks ditaruh di tengah: nama siswa pada ~42% tinggi, judul kelas pada ~58%,
// sehingga template sebaiknya menyisakan ruang kosong di bagian tengah.
export function buildCertificateHtml(cert, templateDataUri) {
  const date = cert.issued_at ? String(cert.issued_at).slice(0, 10) : '';
  const custom = !!templateDataUri;
  const background = custom
    ? `background:url('${templateDataUri}') center/100% 100% no-repeat;`
    : 'background:#FAF3E6;';
  const frame = custom ? '' : 'border:6px double #A4532B;';
  return `<!doctype html><html><head><meta charset="utf-8"/>
  <meta name="viewport" content="width=${CERT_WIDTH}"/>
  <style>
  @page{size:${CERT_WIDTH}pt ${CERT_HEIGHT}pt;margin:0}
  html,body{margin:0;padding:0}
  .page{position:relative;width:${CERT_WIDTH}px;height:${CERT_HEIGHT}px;box-sizing:border-box;${background}${frame}
    font-family:Georgia,serif;color:#3B2A20;text-align:center;overflow:hidden}
  .abs{position:absolute;left:0;right:0}
  .title{top:${custom ? 8 : 12}%;font-size:38px;color:#A4532B;${custom ? 'display:none;' : ''}}
  .given{top:30%;font-size:15px;${custom ? 'display:none;' : ''}}
  .name{top:42%;font-size:40px;color:#2E3A6B}
  .cls{top:58%;font-size:24px}
  .mentor{top:68%;font-size:14px;color:#8A7664}
  .meta{bottom:6%;font-size:12px;color:#8A7664}
  </style></head><body><div class="page">
  <div class="abs title">Sertifikat Kelulusan</div>
  <div class="abs given">Diberikan kepada</div>
  <div class="abs name">${esc(cert.student)}</div>
  <div class="abs cls">${esc(cert.class_title)}</div>
  <div class="abs mentor">Mentor: ${esc(cert.mentor)}</div>
  <div class="abs meta">Diterbitkan ${esc(date)} · Kode ${esc(cert.code)}</div>
  </div></body></html>`;
}
