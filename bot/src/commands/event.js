const { getActiveEvents } = require('../supabase');

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

async function handleEvent(msg) {
  const events = await getActiveEvents();

  if (events.length === 0) {
    return `📅 *Event PORMIKI*\n\nSaat ini belum ada event yang dijadwalkan. Nantikan info event terbaru dari kami!`;
  }

  let response = `📅 *Event PORMIKI Terbaru*\n\n`;

  events.forEach((event, i) => {
    const tipeEmoji = event.tipe === 'online' ? '💻' : '📍';
    response += `*${i + 1}. ${event.nama}*\n`;
    response += `${tipeEmoji} ${event.tipe.toUpperCase()}\n`;
    response += `📆 ${formatDate(event.tanggal_mulai)}`;
    if (event.tanggal_selesai && event.tanggal_selesai !== event.tanggal_mulai) {
      response += ` - ${formatDate(event.tanggal_selesai)}`;
    }
    response += `\n`;
    if (event.lokasi) {
      response += `📍 ${event.lokasi}\n`;
    }
    if (event.harga > 0) {
      response += `💰 Rp ${event.harga.toLocaleString('id-ID')}\n`;
    } else {
      response += `💰 GRATIS\n`;
    }
    response += `\n${event.deskripsi.substring(0, 150)}${event.deskripsi.length > 150 ? '...' : ''}\n`;
    response += `━━━━━━━━━━━━━━━━━━\n\n`;
  });

  response += `💡 Untuk info detail, ketik nama event atau hubungi admin.`;

  return response;
}

module.exports = { handleEvent };
