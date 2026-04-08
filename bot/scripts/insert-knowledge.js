require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const knowledgeData = [
  {
    pertanyaan_kunci: ['nama resmi', 'nama por miki', 'nama lengkap', 'identitas por miki'],
    jawaban: 'Nama Resmi: Perhimpunan Profesional Perekam Medis dan Informasi Kesehatan Indonesia. Singkatan: PORMIKI. Tanggal Berdiri: 18 Februari 1989 di Jakarta.'
  },
  {
    pertanyaan_kunci: ['visi', 'misi por miki', 'tujuan organisasi'],
    jawaban: 'Visi: Mewujudkan Perekam Medis dan Informasi Kesehatan yang Profesional dan berkualitas pada era Digitalisasi Kesehatan. Misi: 1. Meningkatkan kekuatan organisasi 2. Meningkatkan kompetensi dan pengembangan keprofesian PMIK 3. Meningkatkan standar mutu pelayanan rekam medis dan informasi kesehatan 4. Meningkatkan kesejahteraan anggota 5. Meningkatkan kerjasama dengan jejaring dan organisasi profesi'
  },
  {
    pertanyaan_kunci: ['aplikasi portfolio', 'cpd online', 'portal por miki', 'website'],
    jawaban: 'Aplikasi Portofolio (CPD Online): https://pormiki.cpdnakes.org/ Fungsi: Pendaftaran, Update e-KTA, Mutasi, dan Input SKP (P2KB).'
  },
  {
    pertanyaan_kunci: ['e-kta', 'nomor anggota', 'nomor kartu anggota'],
    jawaban: 'Nomor e-KTA: Unik 13 digit dengan format: Kode Provinsi-Kab/Kota + Kriteria + Abjad Nama + Nomor Urut + Tahun Registrasi. e-KTA wajib diperpanjang setiap 1 tahun.'
  },
  {
    pertanyaan_kunci: ['syarat anggota', 'jadi anggota', 'pendaftaran anggota', 'cara daftar'],
    jawaban: 'Syarat Menjadi Anggota: 1. Lulusan D3 RMIK atau Sarjana Terapan MIK 2. Memiliki Ijazah dan Sertifikat Sumpah Profesi 3. Wajib memiliki akun di platform Satu Sehat (Pemerintah) untuk pengembangan profesi'
  },
  {
    pertanyaan_kunci: ['iuran', 'uang pangkal', 'biaya anggota', 'tarif 2025'],
    jawaban: 'Tarif Iuran 2025-2028: Anggota Baru Rp 150.000 (Tahun pertama), Perpanjangan Rp 120.000/tahun. Pembagian Dana: DPP 25%, DPD 30%, DPC 45%.'
  },
  {
    pertanyaan_kunci: ['p2kb', 'pengembangan profesi', 'skp', 'satuan kredit profesi'],
    jawaban: 'Pengembangan Profesi Berkelanjutan (P2KB): Anggota wajib memenuhi SKP dalam 5 tahun: 1. Ranah Pembelajaran Min 45%: Seminar, Workshop, Pelatihan 2. Ranah Pelayanan Min 35%: Koding ICD-10/ICD-9, Analisa RM, Manajemen RME 3. Ranah Pengadian Min 5%: Bakti sosial, Pengurus organisasi'
  },
  {
    pertanyaan_kunci: ['struktur organisasi', 'hierarki', 'dpp', 'dpd', 'dpc', 'pengurus'],
    jawaban: 'Struktur Organisasi: DPP Tingkat Pusat (Ibukota Negara), DPD Tingkat Provinsi (Min 10 anggota), DPC Tingkat Kabupaten/Kota (Min 10 anggota). Masa Bakti: 3 tahun (Maksimal 2 periode).'
  },
  {
    pertanyaan_kunci: ['lembaga khusus', 'plc', 'mke', 'majelis kehormatan', 'dewan pengawas'],
    jawaban: 'Lembaga Khusus PORMIKI: 1. PORMIKI Learning Center (PLC): Badan hukum PT, pelatihan teknis resmi 2. Majelis Kehormatan Etik (MKE): Mengurusi pelanggaran etik 3. Majelis Pembelaan Anggota: Perlindungan hukum 4. Dewan Pengawas: Mengawasi kinerja DPP'
  },
  {
    pertanyaan_kunci: ['mutasi', 'pindah cabang', 'ganti kota'],
    jawaban: 'Tata Cara Mutasi: 1. Ajukan permohonan di https://pormiki.cpdnakes.org/ 2. Isi formulir mutasi diketahui DPD Asal 3. Verifikasi: Admin DPD Asal -> Admin DPD Tujuan -> Admin Pusat 4. Iuran tahun berjalan sesuai kesepakatan DPD terkait'
  },
  {
    pertanyaan_kunci: ['kode etik', 'sanksi', 'pelanggaran', 'etika'],
    jawaban: 'Kewajiban Etik: Menjaga rahasia jabatan/pasien, menjunjung tinggi profesionalisme, patuh AD/ART. Jenis Sanksi: Kategori 1 Pembinaan, Kategori 2 Penginsafan, Kategori 3 Skorsing min 12 bulan, Kategori 4 Pemecatan.'
  },
  {
    pertanyaan_kunci: ['atribut', 'batik', 'jas', 'stempel', 'lagu wajib'],
    jawaban: 'Atribut Resmi: Batik PORMIKI motif nasional untuk acara resmi, Jas PORMIKI warna Hitam dengan Pin, Stempel bulat tinta Hijau, Lagu wajib Indonesia Raya -> Mars PORMIKI -> Hymne PORMIKI.'
  },
  {
    pertanyaan_kunci: ['program kerja', 'program unggul', '2025-2028', 'roadmap'],
    jawaban: 'Program Kerja Unggulan 2025-2028: 1. Digitalisasi Chatbot AI Q&A 2. Sertifikasi LSP PMIK berlisensi BNSP 3. Karier Modul Pelatihan Jabatan Fungsional 4. Aset Pembangunan Rumah PORMIKI 5. RME Pendampingan fasilitas kesehatan'
  },
  {
    pertanyaan_kunci: ['lulusan s1 mik', 'konversi', 'rpl', 'ijazah'],
    jawaban: 'T: Lulusan S1 MIK bisa langsung dapat e-KTA? J: Sesuai aturan 2025, lulusan S1 MIK wajib mengikuti konversi/RPL ke jenjang vokasi D3/D4 untuk diakui keprofesian PMIK.'
  },
  {
    pertanyaan_kunci: ['klaim skp', 'jurnal ilmiah', 'publikasi'],
    jawaban: 'T: Cara klaim SKP dari jurnal ilmiah? J: Unggah bukti publikasi/link ke CPD Online. Penulis pertama dapat hingga 7.5 SKP.'
  },
  {
    pertanyaan_kunci: ['logo por miki', 'komersial', 'izin logo'],
    jawaban: 'T: Boleh gunakan Logo PORMIKI untuk komersial? J: Dilarang keras. Penggunaan logo harus izin tertulis dari DPP PORMIKI.'
  },
  {
    pertanyaan_kunci: ['lupa password', 'reset password', 'akun cpdnakes'],
    jawaban: 'T: Lupa password akun CPD Online? J: Gunakan menu reset di https://pormiki.cpdnakes.org/ atau hubungi Sekretariat DPC/DPD.'
  },
  {
    pertanyaan_kunci: ['jabatan fungsional', 'jafung', 'kenaikan jenjang'],
    jawaban: 'T: PORMIKI memfasilitasi kenaikan Jabatan Fungsional? J: Ya. Bidang Diklat DPP memiliki program pelatihan Jafung PMIK dan sosialisasi Uji Kompetensi Jafung.'
  },
  {
    pertanyaan_kunci: ['prodi rmik baru', 'izin prodi', 'rekomendasi'],
    jawaban: 'T: Peran PORMIKI dalam perizinan Prodi RMIK baru? J: DPP PORMIKI melalui Bidang Diklat memberikan rekomendasi ke institusi lewat Pusdiknakes.'
  },
  {
    pertanyaan_kunci: ['modul koding', 'standar pengkodean', 'klasifikasi'],
    jawaban: 'T: Ada modul resmi untuk standar koding? J: Ya. PORMIKI memiliki Modul Pelatihan Klasifikasi Kodifikasi Penyakit dan Tindakan.'
  },
  {
    pertanyaan_kunci: ['publikasi populer', 'koran', 'artikel kesehatan', 'skp publikasi'],
    jawaban: 'T: Menulis di majalah populer dapat SKP? J: Ya, publikasi karya ilmiah populer dapat 0.5 SKP per publikasi.'
  },
  {
    pertanyaan_kunci: ['narasumber seminar', 'skp narasumber', 'pemateri'],
    jawaban: 'T: Berapa SKP jadi narasumber seminar? J: Narasumber dapat nilai lebih tinggi dari peserta, disesuaikan level materi melalui CPD Online.'
  },
  {
    pertanyaan_kunci: ['peneliti', 'skp peneliti', 'penelitian'],
    jawaban: 'T: Cara klaim SKP sebagai Peneliti? J: Peneliti Utama dapat 5 SKP per penelitian, Anggota dapat 2 SKP (Maksimal 10 SKP dalam 5 tahun).'
  },
  {
    pertanyaan_kunci: ['mengadukan etik', 'pelaporan pelanggaran', 'siapa berhak'],
    jawaban: 'T: Siapa berhak mengadukan pelanggaran etik? J: Pasien, teman sejawat, tenaga kesehatan lain, institusi kesehatan, atau organisasi profesi.'
  },
  {
    pertanyaan_kunci: ['persidangan etik', 'sidang mke', 'terbuka'],
    jawaban: 'T: Persidangan MKE terbuka? J: Tidak. Persidangan MKE tertutup untuk menjaga kerahasiaan dan integritas.'
  },
  {
    pertanyaan_kunci: ['dampingan pengacara', 'pengacara sidang etik'],
    jawaban: 'T: Boleh didampingi pengacara di sidang etik? J: Tidak. Teradu tidak boleh didampingi pengacara, tapi berhak didampingi Pembela (anggota PORMIKI).'
  },
  {
    pertanyaan_kunci: ['banding mke', 'keberatan putusan', 'mke pusat'],
    jawaban: 'T: Tidak puas putusan MKE Daerah? J: Bisa mengajukan Banding ke MKE Pusat maksimal 14 hari kerja.'
  },
  {
    pertanyaan_kunci: ['update data', 'perbaikan data', 'data anggota'],
    jawaban: 'T: Batas perbaikan data di CPD Online? J: Anggota wajib update data saat ada perubahan status kepegawaian atau domisili.'
  },
  {
    pertanyaan_kunci: ['warna stempel', 'tinta stempel', 'stempel hijau'],
    jawaban: 'T: Warna tinta stempel PORMIKI? J: Hijau (sesuai Juknis Administrasi 2025).'
  },
  {
    pertanyaan_kunci: ['format nomor surat', 'klasifikasi surat', 'surat resmi'],
    jawaban: 'T: Format nomor surat PORMIKI? J: Kode klasifikasi + nomor urut/bulan romawi/tahun. Contoh: OT 00 01/01/2025.'
  }
];

async function insertKnowledge() {
  console.log('Starting knowledge insert...');

  // Get category ID
  const { data: orgCat } = await supabase
    .from('categories')
    .select('id')
    .eq('nama', 'organisasi')
    .single();
  
  console.log('Category ID:', orgCat?.id);
  
  // Clear existing
  if (orgCat?.id) {
    await supabase.from('knowledge').delete().eq('category_id', orgCat.id);
    console.log('Cleared existing knowledge');
  }
  
  // Insert new
  for (const item of knowledgeData) {
    await supabase.from('knowledge').insert({
      category_id: orgCat?.id,
      pertanyaan_kunci: item.pertanyaan_kunci,
      jawaban: item.jawaban,
      aktif: true
    });
    console.log('Inserted:', item.pertanyaan_kunci[0]);
  }
  
  console.log('Done! Total:', knowledgeData.length);
}

insertKnowledge().catch(console.error);