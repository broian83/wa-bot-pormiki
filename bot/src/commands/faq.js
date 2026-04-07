const { getActiveKnowledge } = require('../supabase');

async function handleFaq() {
  const knowledgeList = await getActiveKnowledge();

  if (knowledgeList.length === 0) {
    return `📚 *FAQ PORMIKI*\n\nBelum ada FAQ tersedia saat ini. Silakan hubungi admin untuk informasi lebih lanjut.`;
  }

  let response = `📚 *FAQ PORMIKI*\n\nBerikut topik yang tersedia:\n\n`;

  knowledgeList.forEach((k, i) => {
    const topic = k.pertanyaan_kunci[0] || k.jawaban.substring(0, 50);
    response += `${i + 1}. *${topic}*\n`;
  });

  response += `\n💡 Ketik pertanyaan Anda untuk mendapatkan jawaban detail!`;

  return response;
}

module.exports = { handleFaq };
