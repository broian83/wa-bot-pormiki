require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const knowledgeData = [
  {
    pertanyaan_kunci: ['daftar webinar', 'cara daftar webinar', 'pendaftaran webinar', 'join webinar', 'registrasi webinar'],
    jawaban: 'Cara Daftar Webinar Komunikasi Profesional: 1. Buka https://pormiki.cpdnakes.org/ 2. Pilih menu KEGIATAN LMS di sidebar (paling bawah) 3. Klik Pelatihan / Seminar 4. Klik Daftar 5. Scroll ke bawah, isi alamat email LMS Anda 6. Klik Daftar 7. Klik menu KEGIATAN YANG DIIKUTI di sidebar kanan bawah 8. Catat link Zoom webinar 9. Masuk ke grup seminar. Gratis! Dapat 5 SKP!'
  }
];

async function insertKnowledge() {
  const { data: eventCat } = await supabase
    .from('categories')
    .select('id')
    .eq('nama', 'event')
    .single();
  
  console.log('Event Category ID:', eventCat?.id);
  
  for (const item of knowledgeData) {
    await supabase.from('knowledge').insert({
      category_id: eventCat?.id,
      pertanyaan_kunci: item.pertanyaan_kunci,
      jawaban: item.jawaban,
      aktif: true
    });
    console.log('Inserted:', item.pertanyaan_kunci[0]);
  }
  
  console.log('Done! Registration instructions added.');
}

insertKnowledge().catch(console.error);