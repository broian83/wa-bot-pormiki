require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `Kamu adalah asisten virtual resmi PORMIKI (Perekam Medis dan Informasi Kesehatan Indonesia).

TUGAS:
- Menjawab pertanyaan anggota dan calon anggota PORMIKI
- Memberikan informasi tentang organisasi PORMIKI
- Memberikan informasi tentang event (seminar, webinar, workshop)
- Membantu proses pendaftaran anggota

ATURAN:
1. Gunakan HANYA informasi dari knowledge base yang diberikan
2. Jika tidak tahu jawabannya, katakan bahwa akan meneruskan ke admin
3. Gunakan bahasa Indonesia yang sopan dan profesional
4. Jawaban harus singkat, jelas, dan informatif
5. Gunakan emoji secukupnya untuk membuat pesan lebih ramah
6. Jangan membuat informasi yang tidak ada di knowledge base
7. Jika user minta bicara dengan admin, beri tahu bahwa akan diteruskan

FORMAT JAWABAN:
- Gunakan bullet points untuk list
- Gunakan emoji yang relevan
- Break line yang rapi untuk WhatsApp`;

async function generateResponse(userMessage, knowledgeContext = [], sessionMode = 'ai') {
  if (sessionMode === 'admin') {
    return null;
  }

  let contextText = '';
  if (knowledgeContext.length > 0) {
    contextText = '\n\nINFORMASI YANG TERSEDIA:\n';
    knowledgeContext.forEach((k, i) => {
      contextText += `\n[${k.category || 'info'}] ${k.jawaban}\n`;
    });
  } else {
    contextText = '\n\nINFORMASI YANG TERSEDIA:\nTidak ada informasi spesifik yang cocok. Jika pertanyaan di luar scope PORMIKI, arahkan ke admin.\n';
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT + contextText },
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://pormiki.or.id',
        'X-Title': 'WA Bot PORMIKI'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return '⚠️ Maaf, terjadi kesalahan pada sistem. Silakan coba lagi nanti atau hubungi admin.';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '⚠️ Maaf, saya tidak dapat memproses pertanyaan Anda saat ini.';

  } catch (error) {
    console.error('AI generation error:', error.message);
    return '⚠️ Maaf, terjadi kesalahan koneksi. Silakan coba lagi nanti.';
  }
}

async function generateResponseWithModel(userMessage, knowledgeContext, model) {
  const contextText = knowledgeContext.length > 0
    ? '\n\nINFORMASI YANG TERSEDIA:\n' + knowledgeContext.map(k => `\n[${k.category || 'info'}] ${k.jawaban}\n`).join('')
    : '\n\nINFORMASI YANG TERSEDIA:\nTidak ada informasi spesifik yang cocok.\n';

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT + contextText },
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://pormiki.or.id',
        'X-Title': 'WA Bot PORMIKI'
      },
      body: JSON.stringify({
        model: model || OPENROUTER_MODEL,
        messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return '⚠️ Maaf, terjadi kesalahan pada sistem.';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '⚠️ Maaf, saya tidak dapat memproses pertanyaan Anda.';

  } catch (error) {
    console.error('AI generation error:', error.message);
    return '⚠️ Maaf, terjadi kesalahan koneksi.';
  }
}

module.exports = {
  generateResponse,
  generateResponseWithModel,
  SYSTEM_PROMPT
};
