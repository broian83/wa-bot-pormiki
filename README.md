# WA Bot PORMIKI

WhatsApp Bot AI-powered untuk anggota PORMIKI (Perekam Medis dan Informasi Kesehatan Indonesia).

## Fitur

- 🤖 **AI Chatbot** — Menjawab pertanyaan seputar PORMIKI via OpenRouter (multi-model)
- 📚 **Knowledge Base** — FAQ organisasi + Event (dinamis, auto-expire)
- 💬 **Human Takeover** — Admin bisa ambil alih chat dari AI
- 📊 **Dashboard** — Monitoring chat, kelola knowledge, statistik
- 📱 **Mobile Friendly** — Dashboard responsive seperti aplikasi mobile
- 🔄 **Real-time** — Chat history dan notifikasi real-time

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| WhatsApp Bot | Node.js + Baileys |
| AI/LLM | OpenRouter (GPT-4, Claude, Gemini, Llama) |
| Database | Supabase (PostgreSQL) |
| Dashboard | Next.js 14 + Tailwind CSS |
| Real-time | Socket.IO + Supabase Realtime |
| Deployment | VPS (bot) + Netlify (dashboard) |

## Struktur Project

```
wa-bot-pormiki/
├── bot/                    # WhatsApp Bot
│   ├── src/
│   │   ├── index.js        # Entry point + Express API
│   │   ├── whatsapp.js     # Baileys connection
│   │   ├── ai.js           # OpenRouter AI
│   │   ├── supabase.js     # Database functions
│   │   └── commands/       # Command handlers
│   ├── database/
│   │   └── schema.sql      # Supabase schema
│   └── package.json
│
├── dashboard/              # Next.js Dashboard
│   ├── app/
│   │   ├── page.js         # Home + stats
│   │   ├── chat/           # Chat history
│   │   ├── knowledge/      # Kelola FAQ + Event
│   │   ├── stats/          # Statistik lengkap
│   │   ├── qr/             # QR Scanner
│   │   └── takeover/       # Human Takeover
│   └── package.json
│
├── scripts/
│   ├── setup-supabase.js   # Auto-setup database
│   ├── deploy.sh           # Deploy script (Linux/Mac)
│   └── deploy.ps1          # Deploy script (Windows)
│
└── netlify.toml            # Netlify config
```

## Setup

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/wa-bot-pormiki.git
cd wa-bot-pormiki
```

### 2. Setup Supabase

1. Buat project di https://supabase.com
2. Copy Project URL dan Service Role Key
3. Buat file `.env` di root project:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

4. Jalankan setup database:

```bash
cd bot
npm install
npm run setup-supabase
```

### 3. Setup Bot

```bash
cd bot
cp .env.example .env
# Edit .env dengan credentials Anda
npm install
npm start
```

### 4. Setup Dashboard

```bash
cd dashboard
cp .env.example .env.local
# Edit .env.local dengan credentials Anda
npm install
npm run dev
```

Dashboard akan berjalan di http://localhost:3000

## Environment Variables

### Bot (bot/.env)

| Variable | Keterangan |
|----------|------------|
| `SUPABASE_URL` | URL project Supabase |
| `SUPABASE_SERVICE_KEY` | Service Role Key |
| `OPENROUTER_API_KEY` | API key OpenRouter |
| `OPENROUTER_MODEL` | Model AI (default: meta-llama/llama-3.3-70b-instruct) |
| `BOT_ADMIN_NUMBER` | Nomor WA admin |
| `DASHBOARD_PORT` | Port API server (default: 3001) |

### Dashboard (dashboard/.env.local)

| Variable | Keterangan |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon Key Supabase |
| `NEXT_PUBLIC_BOT_API_URL` | URL bot API server |

## Deployment

### Bot (VPS)

```bash
# Install dependencies
npm install

# Run with PM2
pm2 start src/index.js --name wa-bot-pormiki
pm2 save
pm2 startup
```

### Dashboard (Netlify)

1. Push code ke GitHub
2. Connect ke Netlify
3. Set build settings:
   - Base directory: `dashboard`
   - Build command: `npm install && npm run build`
   - Publish directory: `.next`
4. Add environment variables

Atau jalankan script deploy:

```bash
# Windows
.\scripts\deploy.ps1

# Linux/Mac
bash scripts/deploy.sh
```

## Cara Penggunaan

### Bot Commands (via WhatsApp)

| Command | Fungsi |
|---------|--------|
| `menu` | Tampilkan menu utama |
| `faq` | Lihat daftar FAQ |
| `event` | Lihat event aktif |
| `daftar` | Info pendaftaran anggota |
| `/admin takeover` | Ambil alih chat (admin) |
| `/admin release` | Serahkan ke AI |

### Dashboard Pages

| Halaman | Fungsi |
|---------|--------|
| `/` | Home + statistik ringkas |
| `/chat` | Riwayat chat + filter |
| `/knowledge` | Kelola FAQ + Event |
| `/stats` | Statistik lengkap + export |
| `/qr` | QR Code untuk connect WA |
| `/takeover` | Human Takeover interface |

## License

MIT
