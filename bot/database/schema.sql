-- ==========================================
-- PORMIKI WA BOT - SUPABASE SCHEMA
-- Auto-setup script will execute this
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CATEGORIES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(100) NOT NULL UNIQUE,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (nama, deskripsi) VALUES
  ('organisasi', 'Informasi umum tentang PORMIKI'),
  ('event', 'Seminar, webinar, workshop, dan kegiatan')
ON CONFLICT (nama) DO NOTHING;

-- ==========================================
-- 2. KNOWLEDGE TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  pertanyaan_kunci TEXT[] NOT NULL,
  jawaban TEXT NOT NULL,
  aktif BOOLEAN DEFAULT true,
  tanggal_mulai TIMESTAMPTZ,
  tanggal_selesai TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster search
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge(category_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_aktif ON knowledge(aktif);
CREATE INDEX IF NOT EXISTS idx_knowledge_dates ON knowledge(tanggal_mulai, tanggal_selesai);

-- Insert sample knowledge - Organisasi
INSERT INTO knowledge (category_id, pertanyaan_kunci, jawaban, aktif) 
SELECT 
  id,
  ARRAY['apa itu pormiki', 'pormiki itu apa', 'pormiki', 'tentang pormiki'],
  'PORMIKI (Perekam Medis dan Informasi Kesehatan Indonesia) adalah organisasi profesi bagi para perekam medis dan informasi kesehatan di Indonesia. Organisasi ini berperan dalam pengembangan profesi, standarisasi kompetensi, dan peningkatan kualitas pengelolaan rekam medis dan informasi kesehatan di fasilitas pelayanan kesehatan.',
  true
FROM categories WHERE nama = 'organisasi'
ON CONFLICT DO NOTHING;

INSERT INTO knowledge (category_id, pertanyaan_kunci, jawaban, aktif) 
SELECT 
  id,
  ARRAY['visi misi', 'visi pormiki', 'misi pormiki', 'tujuan pormiki'],
  'Visi PORMIKI: Menjadi organisasi profesi yang unggul dalam pengembangan perekam medis dan informasi kesehatan di Indonesia.\n\nMisi:\n1. Meningkatkan kompetensi dan profesionalisme anggota\n2. Mengembangkan standar profesi perekam medis\n3. Memperjuangkan kesejahteraan anggota\n4. Menjalin kerjasama dengan instansi terkait\n5. Meningkatkan peran perekam medis dalam sistem kesehatan nasional',
  true
FROM categories WHERE nama = 'organisasi'
ON CONFLICT DO NOTHING;

INSERT INTO knowledge (category_id, pertanyaan_kunci, jawaban, aktif) 
SELECT 
  id,
  ARRAY['cara daftar', 'pendaftaran', 'jadi anggota', 'daftar anggota', 'registrasi anggota'],
  'Cara menjadi anggota PORMIKI:\n\n1. Isi formulir pendaftaran (kirim kata "DAFTAR" ke bot ini)\n2. Siapkan dokumen: KTP, Ijazah, Sertifikat kompetensi\n3. Bayar iuran anggota\n4. Verifikasi data oleh admin\n5. Kartu anggota akan diterbitkan\n\nUntuk info lebih lanjut, hubungi admin PORMIKI daerah Anda.',
  true
FROM categories WHERE nama = 'organisasi'
ON CONFLICT DO NOTHING;

INSERT INTO knowledge (category_id, pertanyaan_kunci, jawaban, aktif) 
SELECT 
  id,
  ARRAY['manfaat anggota', 'keuntungan', 'faedah anggota', 'manfaat jadi anggota'],
  'Manfaat menjadi anggota PORMIKI:\n\n✅ Akses pelatihan dan sertifikasi profesi\n✅ Jaringan profesional nasional\n✅ Informasi lowongan kerja di bidang rekam medis\n✅ Diskon untuk seminar dan workshop\n✅ Pendampingan karir dan pengembangan kompetensi\n✅ Akses ke resource dan jurnal profesi\n✅ Suara dalam musyawarah organisasi',
  true
FROM categories WHERE nama = 'organisasi'
ON CONFLICT DO NOTHING;

INSERT INTO knowledge (category_id, pertanyaan_kunci, jawaban, aktif) 
SELECT 
  id,
  ARRAY['struktur organisasi', 'pengurus', 'ketua', 'pengurus pusat'],
  'Struktur Organisasi PORMIKI:\n\n📌 Pengurus Pusat (tingkat nasional)\n📌 Pengurus Daerah (tingkat provinsi)\n📌 Pengurus Cabang (tingkat kabupaten/kota)\n\nSetiap tingkatan memiliki:\n- Ketua Umum/Ketua\n- Sekretaris\n- Bendahara\n- Bidang-bidang sesuai kebutuhan\n\nUntuk info pengurus daerah Anda, silakan hubungi admin.',
  true
FROM categories WHERE nama = 'organisasi'
ON CONFLICT DO NOTHING;

INSERT INTO knowledge (category_id, pertanyaan_kunci, jawaban, aktif) 
SELECT 
  id,
  ARRAY['kontak', 'hubungi', 'admin', 'kontak admin', 'telepon', 'email'],
  'Kontak PORMIKI:\n\n📧 Email: info@pormiki.or.id\n📱 WhatsApp Admin: Hubungi via bot ini\n🌐 Website: www.pormiki.or.id\n📍 Sekretariat: Jakarta\n\nJam layanan admin:\nSenin - Jumat: 08.00 - 16.00 WIB\nSabtu: 08.00 - 12.00 WIB',
  true
FROM categories WHERE nama = 'organisasi'
ON CONFLICT DO NOTHING;

-- ==========================================
-- 3. EVENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX IF NOT EXISTS idx_events_aktif ON events(aktif);
CREATE INDEX IF NOT EXISTS idx_events_tanggal ON events(tanggal_mulai, tanggal_selesai);

-- ==========================================
-- 4. CHAT HISTORY TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX IF NOT EXISTS idx_chat_phone ON chat_history(phone_number);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_history(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_category ON chat_history(category);
CREATE INDEX IF NOT EXISTS idx_chat_session_mode ON chat_history(session_mode);

-- ==========================================
-- 5. USER SESSIONS TABLE (Human Takeover)
-- ==========================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  mode VARCHAR(20) DEFAULT 'ai',
  admin_id UUID,
  admin_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_phone ON user_sessions(phone_number);
CREATE INDEX IF NOT EXISTS idx_sessions_mode ON user_sessions(mode);

-- ==========================================
-- 6. BOT SESSION TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS bot_session (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status VARCHAR(20) DEFAULT 'disconnected',
  qr_code TEXT,
  connected_at TIMESTAMPTZ,
  disconnected_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. ADMIN USERS TABLE (for dashboard login)
-- ==========================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 8. DAILY STATS TABLE (for caching)
-- ==========================================
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tanggal DATE NOT NULL UNIQUE,
  total_chat INTEGER DEFAULT 0,
  total_user INTEGER DEFAULT 0,
  ai_mode_chat INTEGER DEFAULT 0,
  admin_mode_chat INTEGER DEFAULT 0,
  top_topics JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stats_tanggal ON daily_stats(tanggal);

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_updated_at BEFORE UPDATE ON knowledge FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bot_session_updated_at BEFORE UPDATE ON bot_session FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_stats_updated_at BEFORE UPDATE ON daily_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Public read policies for knowledge and events (bot needs to read)
CREATE POLICY "Knowledge public read" ON knowledge FOR SELECT USING (aktif = true);
CREATE POLICY "Events public read" ON events FOR SELECT USING (aktif = true);
CREATE POLICY "Categories public read" ON categories FOR SELECT USING (true);

-- ==========================================
-- AUTO-EXPIRE EVENTS FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION auto_expire_events()
RETURNS void AS $$
BEGIN
  UPDATE events 
  SET aktif = false 
  WHERE tanggal_selesai < NOW() AND aktif = true;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- DONE
-- ==========================================
