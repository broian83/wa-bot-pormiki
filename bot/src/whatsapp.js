const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

const {
  searchKnowledge,
  getActiveEvents,
  getActiveKnowledge,
  logChat,
  getUserSession,
  createUserSession,
  updateUserSession,
  updateBotSession,
  getBotSession
} = require('./supabase');
const { generateResponse, generateResponseWithModel } = require('./ai');

const { handleMenu } = require('./commands/menu');
const { handleFaq } = require('./commands/faq');
const { handleEvent } = require('./commands/event');
const { handleRegister } = require('./commands/register');
const { handleAdmin } = require('./commands/admin');

const ADMIN_NUMBER = process.env.BOT_ADMIN_NUMBER;

let client = null;
let qrCode = null;
let isConnected = false;

function extractDisconnectReason(error) {
  if (!error) return null;
  return error.message || 'unknown';
}

async function startWhatsApp(io) {
  const authPath = path.join(__dirname, '..', '.wwebjs_auth');

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: authPath }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      executablePath: process.env.CHROME_PATH || undefined
    },
    restartOnAuthFail: true
  });

  client.on('qr', async (qr) => {
    qrCode = qr;
    isConnected = false;
    await updateBotSession('waiting_qr', qr);
    if (io) {
      io.emit('qr_update', { qr, status: 'waiting_qr' });
    }
    console.log('📱 QR Code received. Scan with WhatsApp');
  });

  client.on('authenticated', async () => {
    console.log('✅ WhatsApp authenticated!');
    qrCode = null;
    isConnected = true;
    await updateBotSession('connected');
    if (io) {
      io.emit('connection_update', { status: 'connected' });
    }
  });

  client.on('auth_failure', async (msg) => {
    console.error('❌ Auth failure:', msg);
    isConnected = false;
    await updateBotSession('disconnected');
    if (io) {
      io.emit('connection_update', { status: 'disconnected', error: msg });
    }
  });

  client.on('disconnected', async (reason) => {
    console.log('WhatsApp disconnected:', reason);
    isConnected = false;
    qrCode = null;
    await updateBotSession('disconnected');
    if (io) {
      io.emit('connection_update', { status: 'disconnected' });
    }
  });

  client.on('ready', async () => {
    console.log('✅ WhatsApp client ready!');
    isConnected = true;
    await updateBotSession('connected');
    if (io) {
      io.emit('connection_update', { status: 'connected' });
    }
  });

  client.on('message', async (msg) => {
    if (msg.fromMe) return;

    const from = msg.from;
    const phoneNumber = msg.from.replace('@c.us', '');
    const pushName = msg.pushName || 'User';
    const messageText = msg.body;

    if (!messageText.trim()) return;

    await handleMessage(from, phoneNumber, pushName, messageText.trim(), io);
  });

  await client.initialize();
  return client;
}

async function handleMessage(from, phoneNumber, pushName, message, io) {
  const lowerMsg = message.toLowerCase();

  let userSession = await getUserSession(phoneNumber);
  if (!userSession) {
    userSession = await createUserSession(phoneNumber, 'ai');
  }

  if (lowerMsg === '/menu' || lowerMsg === 'menu' || lowerMsg === 'help') {
    const reply = await handleMenu();
    await client.sendMessage(from, reply);
    await logChat(phoneNumber, pushName, message, reply, null, null, null, userSession.mode);
    return;
  }

  if (lowerMsg.startsWith('/admin') || lowerMsg.startsWith('/takeover') || lowerMsg.startsWith('/release')) {
    const reply = await handleAdmin(lowerMsg, phoneNumber, pushName);
    if (reply) {
      await client.sendMessage(from, reply);
      await logChat(phoneNumber, pushName, message, reply, null, null, 'admin_command', userSession.mode);
    }
    return;
  }

  if (lowerMsg.startsWith('/event') || lowerMsg === 'event' || lowerMsg === 'events' || lowerMsg.includes('kegiatan')) {
    const reply = await handleEvent(lowerMsg);
    await client.sendMessage(from, reply);
    await logChat(phoneNumber, pushName, message, reply, null, null, 'event', userSession.mode);
    return;
  }

  if (lowerMsg.startsWith('/faq') || lowerMsg === 'faq') {
    const reply = await handleFaq();
    await client.sendMessage(from, reply);
    await logChat(phoneNumber, pushName, message, reply, null, null, 'faq', userSession.mode);
    return;
  }

  if (lowerMsg.startsWith('/daftar') || lowerMsg === 'daftar' || lowerMsg === 'register') {
    const reply = await handleRegister();
    await client.sendMessage(from, reply);
    await logChat(phoneNumber, pushName, message, reply, null, null, 'register', userSession.mode);
    return;
  }

  if (userSession.mode === 'admin') {
    const reply = `⏳ Pesan Anda sedang dibaca oleh admin kami. Mohon tunggu sebentar, admin akan segera merespons.`;
    await client.sendMessage(from, reply);
    await logChat(phoneNumber, pushName, message, reply, null, null, null, 'admin');

    if (io) {
      io.emit('new_message', {
        phoneNumber,
        pushName,
        message,
        mode: 'admin',
        timestamp: new Date().toISOString()
      });
    }
    return;
  }

  const knowledgeResults = await searchKnowledge(message);
  const aiResponse = await generateResponse(message, knowledgeResults, userSession.mode);

  await client.sendMessage(from, aiResponse);

  const matchedKnowledge = knowledgeResults.length > 0 ? knowledgeResults[0].id : null;
  const category = knowledgeResults.length > 0 ? knowledgeResults[0].categories?.nama : null;

  await logChat(phoneNumber, pushName, message, aiResponse, matchedKnowledge, process.env.OPENROUTER_MODEL, category, userSession.mode);
}

async function sendAdminMessage(phoneNumber, message) {
  if (!client || !isConnected) {
    throw new Error('Bot not connected');
  }

  const jid = phoneNumber + '@c.us';
  await client.sendMessage(jid, message);
  return true;
}

function getQRCode() {
  return qrCode;
}

function getConnectionStatus() {
  return {
    connected: isConnected,
    qr: qrCode
  };
}

function getSocket() {
  return client;
}

module.exports = {
  startWhatsApp,
  sendAdminMessage,
  getQRCode,
  getConnectionStatus,
  getSocket
};