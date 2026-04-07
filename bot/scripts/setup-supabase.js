require('dotenv').config();
const https = require('https');
const { URL } = require('url');

const projectRef = 'dpwojvpnbkdrhrqmqsff';
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!accessToken) {
  console.error('❌ Error: SUPABASE_ACCESS_TOKEN must be set in .env');
  process.exit(1);
}

const SQL_API = `https://api.supabase.com/v1/projects/${projectRef}/query`;

function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const urlObj = new URL(SQL_API);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': serviceKey,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${body.substring(0, 200)}`));
        } else {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function setupDatabase() {
  console.log('🚀 Starting Supabase database setup...\n');
  console.log(`📡 Project: ${projectRef}`);
  console.log(`🔑 Token: ${accessToken.substring(0, 20)}...\n`);

  const tables = [
    'categories',
    'knowledge', 
    'events',
    'chat_history',
    'user_sessions',
    'bot_session',
    'admin_users',
    'daily_stats'
  ];

  console.log('📋 Checking existing tables...\n');
  for (const table of tables) {
    const sql = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${table}');`;
    try {
      const result = await executeSQL(sql);
      const exists = result.includes('true');
      console.log(`${exists ? '✅' : '⚠️ '} ${table} ${exists ? 'exists' : 'missing'}`);
    } catch (e) {
      console.log(`❌ ${table}: ${e.message.substring(0, 50)}`);
    }
  }

  console.log('\n📂 Inserting categories...');
  try {
    await executeSQL(`INSERT INTO categories (nama, deskripsi) VALUES ('organisasi', 'Informasi umum tentang PORMIKI'), ('event', 'Seminar, webinar, workshop dan kegiatan') ON CONFLICT (nama) DO NOTHING;`);
    console.log('✅ Categories inserted');
  } catch (e) {
    console.log(`⚠️  ${e.message.substring(0, 60)}`);
  }

  console.log('\n📚 Inserting FAQ...');
  const faqs = [
    { q: 'apa itu pormiki', a: 'PORMIKI (Perekam Medis dan Informasi Kesehatan Indonesia) adalah organisasi profesi bagi para perekam medis dan informasi kesehatan di Indonesia. Organisasi ini berperan dalam pengembangan profesi, standarisasi kompetensi, dan peningkatan kualitas pengelolaan rekam medis dan informasi kesehatan di fasilitas pelayanan kesehatan.' },
    { q: 'visi misi', a: 'Visi PORMIKI: Menjadi organisasi profesi yang unggul dalam pengembangan perekam medis dan informasi kesehatan di Indonesia. Misi: 1. Meningkatkan kompetensi dan profesionalisme anggota, 2. Mengembangkan standar profesi perekam medis, 3. Memperjuangkan kesejahteraan anggota, 4. Menjalin kerjasama dengan instansi terkait.' },
    { q: 'cara daftar', a: 'Cara menjadi anggota PORMIKI: 1. Isi formulir pendaftaran, 2. Siapkan dokumen (KTP, Ijazah, Sertifikat kompetensi), 3. Bayar iuran anggota, 4. Verifikasi data oleh admin, 5. Kartu anggota akan diterbitkan.' },
    { q: 'manfaat anggota', a: 'Manfaat menjadi anggota PORMIKI: Akses pelatihan dan sertifikasi profesi, Jaringan profesional nasional, Informasi lowongan kerja di bidang rekam medis, Diskon untuk seminar dan workshop, Pendampingan karir dan pengembangan kompetensi.' },
    { q: 'struktur organisasi', a: 'Struktur Organisasi PORMIKI: Pengurus Pusat (tingkat nasional), Pengurus Daerah (tingkat provinsi), Pengurus Cabang (tingkat kabupaten/kota). Setiap tingkatan memiliki: Ketua Umum/Ketua, Sekretaris, Bendahara.' },
    { q: 'kontak', a: 'Kontak PORMIKI: Email: info@pormiki.or.id, WhatsApp: hubungi via bot ini, Website: www.pormiki.or.id, Sekretariat: Jakarta, Jam layanan: Senin-Jumat 08.00-16.00 WIB' }
  ];

  for (const faq of faqs) {
    try {
      const safeA = faq.a.replace(/'/g, "''");
      await executeSQL(`INSERT INTO knowledge (category_id, pertanyaan_kunci, jawaban, aktif) SELECT id, ARRAY['${faq.q}'], '${safeA}', true FROM categories WHERE nama = 'organisasi' ON CONFLICT DO NOTHING;`);
      console.log(`✅ FAQ: ${faq.q}`);
    } catch (e) {
      console.log(`⚠️  ${faq.q}: ${e.message.substring(0, 40)}`);
    }
  }

  console.log('\n🎉 Setup complete!');
  console.log('\n📝 Next: Please run SQL in Supabase SQL Editor to create tables if not exists.');
}

setupDatabase();