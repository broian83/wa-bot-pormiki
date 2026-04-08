require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const { startWhatsApp, getQRCode, getConnectionStatus, sendAdminMessage } = require('./whatsapp');
const {
  getChatHistory,
  getStats,
  getDailyStats,
  getActiveKnowledge,
  getKnowledgeByCategory,
  addKnowledge,
  updateKnowledge,
  deleteKnowledge,
  getActiveEvents,
  addEvent,
  deleteEvent,
  getUserSession,
  updateUserSession
} = require('./supabase');
const { getModelList, getDefaultModel, setDefaultModel, getApiKey, setApiKey, MODELS } = require('./ai');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.DASHBOARD_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const DASHBOARD_PORT = process.env.DASHBOARD_PORT || 3001;

io.on('connection', (socket) => {
  console.log('🔌 Dashboard connected:', socket.id);

  socket.on('admin_send_message', async ({ phoneNumber, message }) => {
    try {
      await sendAdminMessage(phoneNumber, message);
      socket.emit('message_sent', { success: true });
    } catch (error) {
      socket.emit('message_sent', { success: false, error: error.message });
    }
  });

  socket.on('admin_takeover', async ({ phoneNumber, adminName }) => {
    await updateUserSession(phoneNumber, {
      mode: 'admin',
      admin_name: adminName,
      updated_at: new Date().toISOString()
    });
    socket.emit('takeover_success', { phoneNumber });
  });

  socket.on('admin_release', async ({ phoneNumber }) => {
    await updateUserSession(phoneNumber, {
      mode: 'ai',
      admin_name: null,
      updated_at: new Date().toISOString()
    });
    socket.emit('release_success', { phoneNumber });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Dashboard disconnected:', socket.id);
  });
});

// Bot Status
app.get('/api/status', (req, res) => {
  const status = getConnectionStatus();
  res.json(status);
});

// QR Code
app.get('/api/qr', (req, res) => {
  const qr = getQRCode();
  if (qr) {
    res.json({ qr });
  } else {
    res.json({ qr: null });
  }
});

// AI Models
app.get('/api/models', (req, res) => {
  const models = getModelList();
  const current = getDefaultModel();
  res.json({ models, current });
});

app.put('/api/models/current', (req, res) => {
  const { model } = req.body;
  if (model) {
    setDefaultModel(model);
    res.json({ success: true, current: model });
  } else {
    res.status(400).json({ error: 'Model is required' });
  }
});

// AI API Key
app.get('/api/apikey', (req, res) => {
  const apiKey = getApiKey();
  if (apiKey) {
    const masked = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
    res.json({ apiKey: masked, hasKey: true });
  } else {
    res.json({ apiKey: null, hasKey: false });
  }
});

app.put('/api/apikey', (req, res) => {
  const { apiKey } = req.body;
  if (apiKey && apiKey.startsWith('sk-')) {
    setApiKey(apiKey);
    res.json({ success: true, message: 'API Key updated successfully' });
  } else {
    res.status(400).json({ error: 'Invalid API Key format' });
  }
});

// Chat History
app.get('/api/chat', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const filters = {
    phoneNumber: req.query.phone,
    category: req.query.category,
    sessionMode: req.query.mode,
    startDate: req.query.startDate,
    endDate: req.query.endDate
  };

  const result = await getChatHistory(page, limit, filters);
  res.json(result);
});

// Statistics
app.get('/api/stats', async (req, res) => {
  const stats = await getStats();
  res.json(stats);
});

app.get('/api/stats/daily', async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const data = await getDailyStats(days);
  res.json(data);
});

// Knowledge Management
app.get('/api/knowledge', async (req, res) => {
  const category = req.query.category;
  if (category) {
    const data = await getKnowledgeByCategory(category);
    res.json(data);
  } else {
    const data = await getActiveKnowledge();
    res.json(data);
  }
});

app.post('/api/knowledge', async (req, res) => {
  const { category_id, pertanyaan_kunci, jawaban, tanggal_mulai, tanggal_selesai } = req.body;
  const data = await addKnowledge(category_id, pertanyaan_kunci, jawaban, tanggal_mulai, tanggal_selesai);
  res.json(data);
});

app.put('/api/knowledge/:id', async (req, res) => {
  const data = await updateKnowledge(req.params.id, req.body);
  res.json(data);
});

app.delete('/api/knowledge/:id', async (req, res) => {
  const success = await deleteKnowledge(req.params.id);
  res.json({ success });
});

// Events Management
app.get('/api/events', async (req, res) => {
  const data = await getActiveEvents();
  res.json(data);
});

app.post('/api/events', async (req, res) => {
  const data = await addEvent(req.body);
  res.json(data);
});

app.delete('/api/events/:id', async (req, res) => {
  const success = await deleteEvent(req.params.id);
  res.json({ success });
});

// User Sessions
app.get('/api/sessions', async (req, res) => {
  const phoneNumber = req.query.phone;
  if (phoneNumber) {
    const data = await getUserSession(phoneNumber);
    res.json(data);
  } else {
    res.json([]);
  }
});

async function startBot() {
  console.log('🚀 Starting WA Bot PORMIKI...');
  console.log('🤖 Using AgentRouter AI');
  console.log('📋 Available models:', MODELS.map(m => m.name).join(', '));
  
  await startWhatsApp(io);
  server.listen(DASHBOARD_PORT, () => {
    console.log(`📡 Bot API server running on port ${DASHBOARD_PORT}`);
  });
}

startBot();
