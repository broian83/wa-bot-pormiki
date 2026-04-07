const { getUserSession, updateUserSession } = require('../supabase');

async function handleAdmin(msg, phoneNumber, pushName) {
  const parts = msg.split(' ');
  const command = parts[1]?.toLowerCase();

  if (!command) {
    return null;
  }

  if (command === 'takeover' || command === 'ambil') {
    const session = await updateUserSession(phoneNumber, {
      mode: 'admin',
      admin_name: pushName,
      updated_at: new Date().toISOString()
    });

    return `✅ *Mode Admin Diaktifkan*\n\nChat ini sekarang dilayani oleh ADMIN.\nAI tidak akan merespons pesan Anda.\n\nKetik "/admin release" untuk kembali ke AI.`;
  }

  if (command === 'release' || command === 'lepas' || command === 'ai') {
    const session = await updateUserSession(phoneNumber, {
      mode: 'ai',
      admin_name: null,
      updated_at: new Date().toISOString()
    });

    return `🤖 *Kembali ke AI*\n\nChat ini sekarang kembali dilayani oleh AI Bot.\nSilakan ajukan pertanyaan Anda!`;
  }

  return null;
}

module.exports = { handleAdmin };
