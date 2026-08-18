# Samira Travel Sistem Haji & Umroh (Demo Project)

> **Slogan: Umroh dulu bayar lunas nanti.**

Platform manajemen perjalanan **haji & umroh** digital untuk **travel umroh**: landing page publik (B2C), portal jamaah, dan portal admin travel (B2B) dalam satu aplikasi.

> ⚠️ **Demo Project** Repositori ini adalah proyek demo / aplikasi contoh, **bukan** sistem resmi milik biro perjalanan atau instansi tertentu. Seluruh data di dalamnya (testimoni, lokasi kantor, kontak, paket) adalah data contoh untuk keperluan pengembangan.

## Fitur

- 🕌 **Landing page publik (12 section)** hero, layanan, tentang, testimoni, ustadz, partner, artikel, lokasi kantor, CTA
- 📦 **Katalog paket haji & umroh** + pendaftaran jamaah mandiri multi-step
- 💳 **Pembayaran QRIS & cicilan** program "umroh dulu, bayar lunas nanti"
- 👨‍💼 **Portal admin travel (B2B)** dashboard, jamaah, paket, pembayaran, dokumen, manifest, laporan, notifikasi, manajemen user
- 🧕 **Portal jamaah (B2C)** dashboard, upload dokumen, pembayaran, profil

## Tech Stack

| Layer | Teknologi |
|---|---|
| **Backend** | Express 5 · Prisma ORM · PostgreSQL · Zod `backend/` |
| **Frontend** | React 19 · TypeScript strict · Tailwind CSS v4 · TanStack Query · Zustand `frontend/` |

## Cara Menjalankan

### Backend

```bash
cd backend
cp .env.example .env   # isi DATABASE_URL + JWT secrets
npm install
npx prisma migrate dev
npm run dev            # http://localhost:3000
```

Smoke: `curl http://localhost:3000/health` → `{ "success": true, "data": { "status": "ok" } }`

### Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev            # http://localhost:5173
```

### Seed Data (opsional)

```bash
cd backend
npm run db:seed        # users demo, paket, jamaah, cicilan, pembayaran, CMS landing
```

## Dokumentasi

Dokumen internal proyek (PRD, Architecture, Design, Schema, Rules, PLAN, TODO) sengaja **tidak disertakan** di repositori publik ini proyek demo, konten aplikasi ada di `backend/` dan `frontend/`.

## Lisensi

Demo project bebas digunakan untuk pembelajaran dan pengembangan.
