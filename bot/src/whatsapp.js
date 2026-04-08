const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');

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
const authStateDir = path.join(__dirname, '..', 'auth_info_baileys');

let sock = null;
let qrCode = null;
let isConnected = false;
let reconnectTimer = null;
let isStarting = false;

function extractDisconnectReason(lastDisconnect) {
  const error = lastDisconnect?.error;
  const boomStatus = error?.output?.statusCode;
  const streamCode = Number(error?.data?.attrs?.code || error?.output?.payload?.attrs?.code);
  const reason = Number.isFinite(boomStatus) ? boomStatus : (Number.isFinite(streamCode) ? streamCode : null);
  return { reason, error };
}

function scheduleReconnect(io, delayMs = 3000) {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    startWhatsApp(io);
  }, delayMs);
}

async function startWhatsApp(io) {
  if (isStarting) return sock;
  isStarting = true;

  const { state, saveCreds } = await useMultiFileAuthState(authStateDir);

  sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    browser: Browsers.macOS('Chrome'),
    countryCode: 'ID',
    generateHighQualityLinkPreview: true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCode = qr;
      await updateBotSession('waiting_qr', qr);
      if (io) {
        io.emit('qr_update', { qr, status: 'waiting_qr' });
      }
    }

    if (connection === 'close') {
      const { reason, error } = extractDisconnectReason(lastDisconnect);
      isConnected = false;
      await updateBotSession('disconnected');
      if (io) {
        io.emit('connection_update', { status: 'disconnected' });
      }

      console.log('WhatsApp disconnected:', {
        reason: reason ?? 'unknown',
        message: error?.message || 'no error message',
        attrsCode: error?.data?.attrs?.code || error?.output?.payload?.attrs?.code || null,
        attrsText: error?.data?.attrs?.text || error?.output?.payload?.attrs?.text || null,
        data: error?.data || null
      });

      const shouldResetAuth = [
        DisconnectReason.loggedOut,
        DisconnectReason.badSession,
        DisconnectReason.multideviceMismatch,
        DisconnectReason.forbidden,
        405
      ].includes(reason);

      if (shouldResetAuth) {
        console.log('❌ Logged out. Please re-scan QR.');
        fs.rmSync(authStateDir, { recursive: true, force: true });
        scheduleReconnect(io);
      } else {
        console.log('🔄 Reconnecting...', reason);
        scheduleReconnect(io);
      }
    } else if (connection === 'open') {
      isConnected = true;
      qrCode = null;
      await updateBotSession('connected');
      if (io) {
        io.emit('connection_update', { status: 'connected' });
      }
      console.log('✅ WhatsApp connected!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    if (!from || from.includes('g.us')) return;

    const phoneNumber = from.replace('@s.whatsapp.net', '');
    const pushName = msg.pushName || 'User';

    let messageText = '';
    if (msg.message.conversation) {
      messageText = msg.message.conversation;
    } else if (msg.message.extendedTextMessage) {
      messageText = msg.message.extendedTextMessage.text;
    } else if (msg.message.imageMessage) {
      messageText = msg.message.imageMessage.caption || '';
    } else if (msg.message.videoMessage) {
      messageText = msg.message.videoMessage.caption || '';
    }

    if (!messageText.trim()) return;

    await handleMessage(from, phoneNumber, pushName, messageText.trim(), io);
  });

  isStarting = false;
  return sock;
}

async function handleMessage(from, phoneNumber, pushName, message, io) {
  const lowerMsg = message.toLowerCase();

  let userSession = await getUserSession(phoneNumber);
  if (!userSession) {
    userSession = await createUserSession(phoneNumber, 'ai');
  }

  if (lowerMsg === '/menu' || lowerMsg === 'menu' || lowerMsg === 'help') {
    const reply = await handleMenu();
    await sock.sendMessage(from, { text: reply });
    await logChat(phoneNumber, pushName, message, reply, null, null, null, userSession.mode);
    return;
  }

  if (lowerMsg.startsWith('/admin') || lowerMsg.startsWith('/takeover') || lowerMsg.startsWith('/release')) {
    const reply = await handleAdmin(lowerMsg, phoneNumber, pushName);
    if (reply) {
      await sock.sendMessage(from, { text: reply });
      await logChat(phoneNumber, pushName, message, reply, null, null, 'admin_command', userSession.mode);
    }
    return;
  }

  if (lowerMsg.startsWith('/event') || lowerMsg === 'event' || lowerMsg === 'events' || lowerMsg.includes('kegiatan')) {
    const reply = await handleEvent(lowerMsg);
    await sock.sendMessage(from, { text: reply });
    await logChat(phoneNumber, pushName, message, reply, null, null, 'event', userSession.mode);
    return;
  }

  if (lowerMsg.startsWith('/faq') || lowerMsg === 'faq') {
    const reply = await handleFaq();
    await sock.sendMessage(from, { text: reply });
    await logChat(phoneNumber, pushName, message, reply, null, null, 'faq', userSession.mode);
    return;
  }

  if (lowerMsg.startsWith('/daftar') || lowerMsg === 'daftar' || lowerMsg === 'register') {
    const reply = await handleRegister();
    await sock.sendMessage(from, { text: reply });
    await logChat(phoneNumber, pushName, message, reply, null, null, 'register', userSession.mode);
    return;
  }

  if (userSession.mode === 'admin') {
    const reply = `⏳ Pesan Anda sedang dibaca oleh admin kami. Mohon tunggu sebentar, admin akan segera merespons.`;
    await sock.sendMessage(from, { text: reply });
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

  await sock.sendMessage(from, { text: aiResponse });

  const matchedKnowledge = knowledgeResults.length > 0 ? knowledgeResults[0].id : null;
  const category = knowledgeResults.length > 0 ? knowledgeResults[0].categories?.nama : null;

  await logChat(phoneNumber, pushName, message, aiResponse, matchedKnowledge, process.env.OPENROUTER_MODEL, category, userSession.mode);
}

async function sendAdminMessage(phoneNumber, message) {
  if (!sock || !isConnected) {
    throw new Error('Bot not connected');
  }

  const jid = phoneNumber + '@s.whatsapp.net';
  await sock.sendMessage(jid, { text: message });
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
  return sock;
}

module.exports = {
  startWhatsApp,
  sendAdminMessage,
  getQRCode,
  getConnectionStatus,
  getSocket
};



