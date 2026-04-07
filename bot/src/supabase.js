const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function getKnowledgeByCategory(category, limit = 10) {
  const { data, error } = await supabase
    .from('knowledge')
    .select('*, categories(nama)')
    .eq('aktif', true)
    .eq('categories.nama', category)
    .limit(limit);

  if (error) {
    console.error('Error fetching knowledge:', error);
    return [];
  }
  return data || [];
}

async function getActiveKnowledge() {
  const { data, error } = await supabase
    .from('knowledge')
    .select('*, categories(nama)')
    .eq('aktif', true);

  if (error) {
    console.error('Error fetching knowledge:', error);
    return [];
  }
  return data || [];
}

async function searchKnowledge(query) {
  const queryLower = query.toLowerCase();
  const { data, error } = await supabase
    .from('knowledge')
    .select('*, categories(nama)')
    .eq('aktif', true);

  if (error) {
    console.error('Error searching knowledge:', error);
    return [];
  }

  const results = (data || []).filter(k => {
    return k.pertanyaan_kunci.some(pk => 
      queryLower.includes(pk.toLowerCase()) || 
      pk.toLowerCase().includes(queryLower)
    );
  });

  return results;
}

async function getActiveEvents() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('aktif', true)
    .gte('tanggal_selesai', now)
    .order('tanggal_mulai', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  return data || [];
}

async function getEventById(id) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

async function addKnowledge(categoryId, pertanyaanKunci, jawaban, tanggalMulai = null, tanggalSelesai = null) {
  const { data, error } = await supabase
    .from('knowledge')
    .insert([{
      category_id: categoryId,
      pertanyaan_kunci: pertanyaanKunci,
      jawaban,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      aktif: true
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding knowledge:', error);
    return null;
  }
  return data;
}

async function updateKnowledge(id, updates) {
  const { data, error } = await supabase
    .from('knowledge')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating knowledge:', error);
    return null;
  }
  return data;
}

async function deleteKnowledge(id) {
  const { error } = await supabase
    .from('knowledge')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting knowledge:', error);
    return false;
  }
  return true;
}

async function addEvent(eventData) {
  const { data, error } = await supabase
    .from('events')
    .insert([{
      nama: eventData.nama,
      deskripsi: eventData.deskripsi,
      tanggal_mulai: eventData.tanggalMulai,
      tanggal_selesai: eventData.tanggalSelesai,
      lokasi: eventData.lokasi || null,
      tipe: eventData.tipe || 'offline',
      harga: eventData.harga || 0,
      kontak: eventData.kontak || null,
      aktif: true
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding event:', error);
    return null;
  }
  return data;
}

async function deleteEvent(id) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    return false;
  }
  return true;
}

async function logChat(phoneNumber, userName, userMessage, aiResponse, knowledgeUsed = null, modelAi = null, category = null, sessionMode = 'ai') {
  const { data, error } = await supabase
    .from('chat_history')
    .insert([{
      phone_number: phoneNumber,
      user_name: userName,
      user_message: userMessage,
      ai_response: aiResponse,
      knowledge_used: knowledgeUsed,
      model_ai: modelAi,
      category,
      session_mode: sessionMode
    }])
    .select()
    .single();

  if (error) {
    console.error('Error logging chat:', error);
    return null;
  }
  return data;
}

async function getUserSession(phoneNumber) {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('phone_number', phoneNumber)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user session:', error);
  }
  return data;
}

async function createUserSession(phoneNumber, mode = 'ai') {
  const { data, error } = await supabase
    .from('user_sessions')
    .insert([{
      phone_number: phoneNumber,
      mode
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating user session:', error);
    return null;
  }
  return data;
}

async function updateUserSession(phoneNumber, updates) {
  const { data, error } = await supabase
    .from('user_sessions')
    .update(updates)
    .eq('phone_number', phoneNumber)
    .select()
    .single();

  if (error) {
    console.error('Error updating user session:', error);
    return null;
  }
  return data;
}

async function getChatHistory(page = 1, limit = 20, filters = {}) {
  let query = supabase
    .from('chat_history')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters.phoneNumber) {
    query = query.eq('phone_number', filters.phoneNumber);
  }
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.sessionMode) {
    query = query.eq('session_mode', filters.sessionMode);
  }
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching chat history:', error);
    return { data: [], count: 0 };
  }
  return { data: data || [], count: count || 0 };
}

async function getStats() {
  const today = new Date().toISOString().split('T')[0];

  const { count: totalChat } = await supabase
    .from('chat_history')
    .select('*', { count: 'exact', head: true });

  const { count: todayChat } = await supabase
    .from('chat_history')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today);

  const { data: uniqueUsers } = await supabase
    .from('chat_history')
    .select('phone_number')
    .order('created_at', { ascending: false });

  const uniqueUserCount = new Set(uniqueUsers?.map(u => u.phone_number)).size;

  const { count: aiModeCount } = await supabase
    .from('chat_history')
    .select('*', { count: 'exact', head: true })
    .eq('session_mode', 'ai');

  const { count: adminModeCount } = await supabase
    .from('chat_history')
    .select('*', { count: 'exact', head: true })
    .eq('session_mode', 'admin');

  const { count: activeEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('aktif', true)
    .gte('tanggal_selesai', new Date().toISOString());

  const { count: totalKnowledge } = await supabase
    .from('knowledge')
    .select('*', { count: 'exact', head: true })
    .eq('aktif', true);

  return {
    totalChat: totalChat || 0,
    todayChat: todayChat || 0,
    uniqueUsers: uniqueUserCount,
    aiModeChat: aiModeCount || 0,
    adminModeChat: adminModeCount || 0,
    activeEvents: activeEvents || 0,
    totalKnowledge: totalKnowledge || 0
  };
}

async function getDailyStats(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('chat_history')
    .select('created_at, category, session_mode')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching daily stats:', error);
    return [];
  }

  const dailyMap = {};
  const categoryMap = {};
  const modelMap = {};

  data.forEach(chat => {
    const date = new Date(chat.created_at).toISOString().split('T')[0];
    dailyMap[date] = (dailyMap[date] || 0) + 1;

    if (chat.category) {
      categoryMap[chat.category] = (categoryMap[chat.category] || 0) + 1;
    }
    if (chat.session_mode) {
      modelMap[chat.session_mode] = (modelMap[chat.session_mode] || 0) + 1;
    }
  });

  const dailyData = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  const modelData = Object.entries(modelMap).map(([name, value]) => ({ name, value }));

  return { dailyData, categoryData, modelData };
}

async function updateBotSession(status, qrCode = null) {
  const { data: existing } = await supabase
    .from('bot_session')
    .select('*')
    .limit(1)
    .single();

  const updates = {
    status,
    updated_at: new Date().toISOString()
  };

  if (qrCode) updates.qr_code = qrCode;
  if (status === 'connected') updates.connected_at = new Date().toISOString();
  if (status === 'disconnected') updates.disconnected_at = new Date().toISOString();

  if (existing) {
    await supabase.from('bot_session').update(updates).eq('id', existing.id);
  } else {
    await supabase.from('bot_session').insert([updates]);
  }
}

async function getBotSession() {
  const { data } = await supabase
    .from('bot_session')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  return data;
}

module.exports = {
  supabase,
  supabaseAnon,
  getKnowledgeByCategory,
  getActiveKnowledge,
  searchKnowledge,
  getActiveEvents,
  getEventById,
  addKnowledge,
  updateKnowledge,
  deleteKnowledge,
  addEvent,
  deleteEvent,
  logChat,
  getUserSession,
  createUserSession,
  updateUserSession,
  getChatHistory,
  getStats,
  getDailyStats,
  updateBotSession,
  getBotSession
};
