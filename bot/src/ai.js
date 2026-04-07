require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const AGENTROUTER_API_KEY = process.env.AGENTROUTER_API_KEY;
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'meta-llama/llama-3.3-70b-instruct';
const AGENTROUTER_API_URL = 'https://api.agentrouter.org/v1/chat/completions';

const MODELS = [
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'Meta' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'google/gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'Google' },
  { id: 'mistralai/mistral-small-3.1', name: 'Mistral Small 3.1', provider: 'Mistral' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek' },
  { id: 'qwen/qwen2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'Alibaba' },
];

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

function getModelList() {
  return MODELS;
}

function getDefaultModel() {
  return DEFAULT_MODEL;
}

function setDefaultModel(model) {
  process.env.DEFAULT_MODEL = model;
}

async function generateResponse(userMessage, knowledgeContext = [], sessionMode = 'ai') {
  if (sessionMode === 'admin') {
    return null;
  }

  return generateResponseWithModel(userMessage, knowledgeContext, DEFAULT_MODEL);
}

async function generateResponseWithModel(userMessage, knowledgeContext, model) {
  let contextText = '';
  if (knowledgeContext.length > 0) {
    contextText = '\n\nINFORMASI YANG TERSEDIA:\n';
    knowledgeContext.forEach((k) => {
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
    const response = await fetch(AGENTROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AGENTROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://pormiki.or.id',
        'X-Title': 'WA Bot PORMIKI'
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AgentRouter API error:', errorData);
      return '⚠️ Maaf, terjadi kesalahan pada sistem. Silakan coba lagi nanti atau hubungi admin.';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '⚠️ Maaf, saya tidak dapat memproses pertanyaan Anda saat ini.';

  } catch (error) {
    console.error('AI generation error:', error.message);
    return '⚠️ Maaf, terjadi kesalahan koneksi. Silakan coba lagi nanti.';
  }
}

module.exports = {
  generateResponse,
  generateResponseWithModel,
  getModelList,
  getDefaultModel,
  setDefaultModel,
  MODELS,
  SYSTEM_PROMPT
};