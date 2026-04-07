-- ==========================================
-- PORMIKI WA BOT - DATABASE SETUP
-- Copy all SQL below and run in Supabase SQL Editor
-- ==========================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(100) NOT NULL UNIQUE,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Insert categories
INSERT INTO categories (nama, deskripsi) VALUES
  ('organisasi', 'Informasi umum tentang PORMIKI'),
  ('event', 'Seminar, webinar, workshop dan kegiatan')
ON CONFLICT (nama) DO NOTHING;

-- 4. Create knowledge table
CREATE TABLE IF NOT EXISTS knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  pertanyaan_kunci TEXT[] NOT NULL,
  jawaban TEXT NOT NULL,
  aktif BOOLEAN DEFAULT true,
  tanggal_mulai TIMESTAMPTZ,
  tanggal_selesai TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Insert FAQ knowledge
INSERT INTO knowledge (category_id, pertanyaan_kunci, jawaban, aktif) 
SELECT id, ARRAY['apa itu pormiki', 'pormiki itu apa', 'pormiki', 'tentang pormiki'],
'PORMIKI (Perekam Medis dan Informasi Kesehatan Indonesia) adalah organisasi profesi bagi para perekam medis dan informasi kesehatan di Indonesia. Organisasi ini berperan dalam pengembangan profesi, standarisasi kompetensi, dan peningkatan kualitas pengelolaan rekam medis dan informasi kesehatan di fasilitas pelayanan kesehatan.',
true FROM categories WHERE nama = 'organisasi' ON CONFLICT DO NOTHING;

INSERT INTO knowledge (category_id, pertanyaan_kunci, jawaban, aktif) 
SELECT id, ARRAY['visi misi', 'visi pormiki', 'misi pormiki', 'tujuan pormiki'],
'Visi PORMIKI: Menjadi organisasi profesi yang unggul dalam pengembangan perekam medis dan informasi kesehatan di Indonesia. Misi: 1. Meningkatkan kompetensi dan profesionalisme anggota, 2. Mengembangkan standar profesi perekam medis, 3. Memperjuangkan kesejahteraan anggota, 4. Menjalin kerjasama dengan instansi terkait, 5. Meningkatkan peran perekam medis dalam sistem kesehatan nasional.',
true FROM categories WHERE nama = 'organisasi' ON CONFLICT DO NOTHING;

INSERT INTO knowledge (category_id, pertanyaan_kunci, jawaban, aktif) 
SELECT id, ARRAY['cara daftar', 'pendaftaran', 'jadi anggota', 'daftar anggota', 'registrasi anggota'],
'Cara menjadi anggota PORMIKI: 1. Isi formulir pendaftaran (kirim kata "DAFTAR" ke bot ini), 2. Siapkan dokumen: KTP, Ijazah, Sertifikat kompetensi, 3. Bayar iuran anggota, 4. Verifikasi data oleh admin, 5. Kartu anggota akan diterbitkan. Untuk info lebih lanjut, hubungi admin PORMIKI daerah Anda.',
true FROM categories WHERE nama = 'organisasi' ON CONFLICT DO NOTHING;

INSERT INTO knowledge (category_id, pertanyaan_kunci, jawaban, aktif) 
SELECT id, ARRAY['manfaat anggota', 'keuntungan', 'faedah anggota', 'manfaat jadi anggota'],
'Manfaat menjadi anggota PORMIKI: Akses pelatihan dan sertifikasi profesi, Jaringan profesional nasional, Informasi lowongan kerja di bidang rekam medis, Diskon untuk seminar dan workshop, Pendampingan karir dan pengembangan kompetensi.',
true FROM categories WHERE nama = 'organisasi' ON CONFLICT DO NOTHING;

INSERT INTO knowledge (category_id, pertanyaan_kunci, jawaban, aktif) 
SELECT id, ARRAY['struktur organisasi', 'pengurus', 'ketua', 'pengurus pusat'],
'Struktur Organisasi PORMIKI: Pengurus Pusat (tingkat nasional), Pengurus Daerah (tingkat provinsi), Pengurus Cabildo (tingkat kabupaten/kota). Setiap tingkatan memiliki: Ketua Umum/Ketua, Sekretaris, Bendahara.',
true FROM categories WHERE nama = 'organisasi' ON CONFLICT DO NOTHING;

INSERT INTO knowledge (category_id, pertanyaan_kunci, jawaban, aktif) 
SELECT id, ARRAY['kontak', 'hubungi', 'admin', 'kontak admin', 'telepon', 'email'],
'Kontak PORMIKI: Email: info@pormiki.or.id, WhatsApp: Hubungi via bot ini, Website: www.pormiki.or.id, Sekretariat: Jakarta, Jam layanan: Senin-Jumat 08.00-16.00 WIB',
true FROM categories WHERE nama = 'organisasi' ON CONFLICT DO NOTHING;

-- 6. Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  deskripsi TEXT NOT NULL,
  tanggal_mulai TIMESTAMPTZ NOT NULL,
  tanggal_selesai TIMESTAMPTZ NOT NULL,
  lokasi VARCHAR(255),
  tipe VARCHAR(50) DEFAULT 'offline',
  harga DECIMAL(10,2) DEFAULT 0,
  kontak VARCHAR(100),
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  user_name VARCHAR(100),
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  knowledge_used UUID REFERENCES knowledge(id),
  model_ai VARCHAR(100),
  category VARCHAR(50),
  session_mode VARCHAR(20) DEFAULT 'ai',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  mode VARCHAR(20) DEFAULT 'ai',
  admin_id UUID,
  admin_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create bot_session table
CREATE TABLE IF NOT EXISTS bot_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(20) DEFAULT 'disconnected',
  qr_code TEXT,
  connected_at TIMESTAMPTZ,
  disconnected_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Create daily_stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL UNIQUE,
  total_chat INTEGER DEFAULT 0,
  total_user INTEGER DEFAULT 0,
  ai_mode_chat INTEGER DEFAULT 0,
  admin_mode_chat INTEGER DEFAULT 0,
  top_topics JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- 13. Create RLS policies
CREATE POLICY "Knowledge public read" ON knowledge FOR SELECT USING (aktif = true);
CREATE POLICY "Events public read" ON events FOR SELECT USING (aktif = true);
CREATE POLICY "Categories public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Chat history read" ON chat_history FOR SELECT USING (true);
CREATE POLICY "User sessions read" ON user_sessions FOR SELECT USING (true);
CREATE POLICY "Bot session read" ON bot_session FOR SELECT USING (true);
CREATE POLICY "Daily stats read" ON daily_stats FOR SELECT USING (true);

-- ✅ Run this in Supabase SQL Editor!