require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const SUMOPOD_API_KEY = process.env.SUMOPOD_API_KEY || 'sk-kgUvudVPlAltU0K8d6RVJw';
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'seed-2-0-mini';
const SUMOPOD_API_URL = 'https://ai.sumopod.com/v1/chat/completions';

const MODELS = [
  // OpenAI
  { id: 'gpt-5', name: 'GPT-5', provider: 'OpenAI' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'OpenAI' },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'OpenAI' },
  { id: 'gpt-5.1', name: 'GPT-5.1', provider: 'OpenAI' },
  { id: 'gpt-5.1-codex', name: 'GPT-5.1 Codex', provider: 'OpenAI' },
  { id: 'gpt-5.1-codex-mini', name: 'GPT-5.1 Codex Mini', provider: 'OpenAI' },
  { id: 'gpt-5.2', name: 'GPT-5.2', provider: 'OpenAI' },
  { id: 'gpt-5.2-codex', name: 'GPT-5.2 Codex', provider: 'OpenAI' },
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'OpenAI' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'OpenAI' },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', provider: 'OpenAI' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  
  // Anthropic
  { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', provider: 'Anthropic' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
  
  // Google
  { id: 'gemini/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google' },
  { id: 'gemini/gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google' },
  { id: 'gemini/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', provider: 'Google' },
  { id: 'gemini/gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google' },
  { id: 'gemini/gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', provider: 'Google' },
  { id: 'gemini/gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', provider: 'Google' },
  { id: 'gemini/gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', provider: 'Google' },
  { id: 'gemini/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
  { id: 'gemini/gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google' },
  
  // Meta
  { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Meta' },
  { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'Meta' },
  
  // BytePlus/DeepSeek
  { id: 'deepseek-v3-2', name: 'DeepSeek V3', provider: 'DeepSeek' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek' },
  { id: 'seed-2-0-pro', name: 'Seed 2.0 Pro (90% Off)', provider: 'BytePlus' },
  { id: 'seed-2-0-mini', name: 'Seed 2.0 Mini (90% Off)', provider: 'BytePlus' },
  { id: 'seed-2-0-lite', name: 'Seed 2.0 Lite (90% Off)', provider: 'BytePlus' },
  { id: 'kimi-k2-5-260127', name: 'Kimi K2.5', provider: 'BytePlus' },
  { id: 'glm-4-7', name: 'GLM-4-7', provider: 'BytePlus' },
  
  // MiniMax
  { id: 'MiniMax-M2.7-highspeed', name: 'MiniMax M2.7 Highspeed (90% Off)', provider: 'MiniMax' },
  
  // Z.AI
  { id: 'glm-5', name: 'GLM-5 (90% Off)', provider: 'Z.AI' },
  { id: 'glm-5-turbo', name: 'GLM-5 Turbo (90% Off)', provider: 'Z.AI' },
  { id: 'glm-5.1', name: 'GLM-5.1 (90% Off)', provider: 'Z.AI' },
  
  // Mistral
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral' },
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

let currentApiKey = SUMOPOD_API_KEY;
let currentModel = DEFAULT_MODEL;

function getModelList() {
  return MODELS;
}

function getDefaultModel() {
  return currentModel;
}

function setDefaultModel(model) {
  currentModel = model;
}

function getApiKey() {
  return currentApiKey;
}

function setApiKey(key) {
  currentApiKey = key;
}

async function generateResponse(userMessage, knowledgeContext = [], sessionMode = 'ai') {
  if (sessionMode === 'admin') {
    return null;
  }

  return generateResponseWithModel(userMessage, knowledgeContext, currentModel);
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
    const response = await fetch(SUMOPOD_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || currentModel,
        messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('SumoPod API error:', errorData);
      return 'Maaf, terjadi kesalahan pada sistem. Silakan coba lagi nanti atau hubungi admin.';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat memproses pertanyaan Anda saat ini.';

  } catch (error) {
    console.error('AI generation error:', error.message);
    return 'Maaf, terjadi kesalahan koneksi. Silakan coba lagi nanti.';
  }
}

module.exports = {
  generateResponse,
  generateResponseWithModel,
  getModelList,
  getDefaultModel,
  setDefaultModel,
  getApiKey,
  setApiKey,
  MODELS,
  SYSTEM_PROMPT
};