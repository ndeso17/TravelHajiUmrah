// Seed data development — idempotent (aman dijalankan berulang).
// Jalankan: npm run db:seed (dari backend/)
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma.js';

const SALT_ROUNDS = 10;

// ============ Helper upsert ============

async function upsertUser({ email, name, role, password }) {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  return prisma.user.upsert({
    where: { email },
    update: { name, role, password: hashed, isActive: true },
    create: { email, name, role, password: hashed, isActive: true },
  });
}

// Paket tidak punya kolom unique selain id → upsert via findFirst(nama)+update/create
// agar aman dipakai ulang tanpa duplikat.
async function upsertPaket(data) {
  const existing = await prisma.paket.findFirst({ where: { nama: data.nama } });
  if (existing) return prisma.paket.update({ where: { id: existing.id }, data });
  return prisma.paket.create({ data });
}

// ============ Main ============

async function main() {
  // --- 1. Users: SUPER_ADMIN, ADMIN, STAFF, JAMAAH ---
  const [admin, manajer, staff, jamaahUser] = await Promise.all([
    upsertUser({ email: 'admin@hajiumroh.test', name: 'Super Admin Dev', role: 'SUPER_ADMIN', password: 'Admin123!' }),
    upsertUser({ email: 'manajer@test.id', name: 'Manajer Operasional', role: 'ADMIN', password: 'Manajer123!' }),
    upsertUser({ email: 'staff@test.id', name: 'Staff Uji', role: 'STAFF', password: 'Staff123!' }),
    upsertUser({ email: 'jamaah@test.id', name: 'Siti Rahmawati', role: 'JAMAAH', password: 'Jamaah123!' }),
  ]);

  // --- 2. Paket: 1 haji + 1 umroh ---
  const paketUmroh = await upsertPaket({
    nama: 'Umroh Rajab 2026',
    tipe: 'UMROH',
    harga: 30000000,
    kuota: 100,
    tanggalBuka: new Date('2026-01-01T00:00:00+07:00'),
    tanggalTutup: new Date('2026-12-31T23:59:59+07:00'),
    itinerary: 'Jakarta - Jeddah - Madinah - Makkah - Jeddah - Jakarta (12 hari)',
    fasilitas: ['Tiket PP', 'Hotel bintang 5 dekat Masjid', 'Visa + Asuransi', 'Bimbingan ibadah', 'Konsumsi 3x sehari', 'Transportasi bus premium'],
    isAktif: true,
  });
  const paketHaji = await upsertPaket({
    nama: 'Haji Reguler 2027',
    tipe: 'HAJI',
    harga: 45000000,
    kuota: 50,
    tanggalBuka: new Date('2026-01-01T00:00:00+07:00'),
    tanggalTutup: new Date('2027-03-31T23:59:59+07:00'),
    itinerary: 'Jakarta - Jeddah - Madinah - Arafah - Mina - Makkah - Jeddah - Jakarta (42 hari)',
    fasilitas: ['Tiket PP', 'Hotel dekat Masjid Nabawi & Haram', 'Visa Haji + Asuransi', 'Bimbingan manasik lengkap', 'Konsumsi 3x sehari', 'Armada bus shalawat'],
    isAktif: true,
  });

  // --- 3. Jamaah lengkap + akun JAMAAH (portal) ---
  const jamaah = await prisma.jamaah.upsert({
    where: { nomorRegistrasi: 'HU-2026-0004' },
    update: {
      userId: jamaahUser.id,
      paketId: paketUmroh.id,
      kloter: 'JKT-01',
      namaLengkap: 'Siti Rahmawati',
      namaAyah: 'Ahmad Subur',
      tempatLahir: 'Yogyakarta',
      tanggalLahir: new Date('1990-05-15T00:00:00+07:00'),
      jenisKelamin: 'PEREMPUAN',
      statusPerkawinan: 'Menikah',
      alamat: 'Jl. Kaliurang KM 5 No. 12, Sleman, Yogyakarta',
      noTelp: '081234567891',
      email: 'jamaah@test.id',
      statusPaspor: 'VERIFIED',
      statusVisa: 'BELUM',
      statusFoto: 'UPLOAD',
      statusPendaftaran: 'AKTIF',
      tipeSkema: 'NORMAL',
    },
    create: {
      id: 'seed-jamaah-0004',
      nomorRegistrasi: 'HU-2026-0004',
      userId: jamaahUser.id,
      paketId: paketUmroh.id,
      kloter: 'JKT-01',
      namaLengkap: 'Siti Rahmawati',
      namaAyah: 'Ahmad Subur',
      tempatLahir: 'Yogyakarta',
      tanggalLahir: new Date('1990-05-15T00:00:00+07:00'),
      jenisKelamin: 'PEREMPUAN',
      statusPerkawinan: 'Menikah',
      alamat: 'Jl. Kaliurang KM 5 No. 12, Sleman, Yogyakarta',
      noTelp: '081234567891',
      email: 'jamaah@test.id',
      statusPaspor: 'VERIFIED',
      statusVisa: 'BELUM',
      statusFoto: 'UPLOAD',
      statusPendaftaran: 'AKTIF',
      tipeSkema: 'NORMAL',
    },
  });
  const jamaahId = jamaah.id;

  // --- 4. Tagihan cicilan 4x (30jt / 4 = 7.5jt) ---
  const cicilan = [7500000, 7500000, 7500000, 7500000];
  for (let i = 0; i < cicilan.length; i += 1) {
    await prisma.tagihanCicilan.upsert({
      where: { id: `seed-tagihan-${i + 1}` },
      update: { jumlah: cicilan[i], deadline: new Date(`2026-0${i + 3}-01T00:00:00+07:00`), status: i === 0 ? 'LUNAS' : 'BELUM' },
      create: {
        id: `seed-tagihan-${i + 1}`,
        jamaahId,
        urutan: i + 1,
        jumlah: cicilan[i],
        deadline: new Date(`2026-0${i + 3}-01T00:00:00+07:00`),
        status: i === 0 ? 'LUNAS' : 'BELUM',
      },
    });
  }

  // --- 5. Pembayaran pertama DITERIMA (QRIS DANA) ---
  await prisma.pembayaran.upsert({
    where: { id: 'seed-pembayaran-1' },
    update: {
      jamaahId,
      tagihanId: 'seed-tagihan-1',
      jumlah: 7500000,
      metodeBayar: 'QRIS',
      qrisProvider: 'DANA',
      buktiBayar: '/uploads/seed/bukti-dana.jpg',
      statusVerifikasi: 'DITERIMA',
      verifiedBy: admin.id,
      verifiedAt: new Date(),
      createdBy: admin.id,
    },
    create: {
      id: 'seed-pembayaran-1',
      jamaahId,
      tagihanId: 'seed-tagihan-1',
      jumlah: 7500000,
      metodeBayar: 'QRIS',
      qrisProvider: 'DANA',
      buktiBayar: '/uploads/seed/bukti-dana.jpg',
      statusVerifikasi: 'DITERIMA',
      verifiedBy: admin.id,
      verifiedAt: new Date(),
      createdBy: admin.id,
    },
  });

  // --- 6. Dokumen jamaah ---
  await prisma.dokumen.upsert({
    where: { id: 'seed-dokumen-1' },
    update: { status: 'VERIFIED', catatan: 'Paspor valid', verifiedBy: admin.id, verifiedAt: new Date() },
    create: {
      id: 'seed-dokumen-1',
      jamaahId,
      tipe: 'PASPOR',
      fileUrl: '/uploads/seed/paspor.jpg',
      fileName: 'paspor.jpg',
      fileSize: 204800,
      status: 'VERIFIED',
      catatan: 'Paspor valid',
      verifiedBy: admin.id,
      verifiedAt: new Date(),
    },
  });
  await prisma.dokumen.upsert({
    where: { id: 'seed-dokumen-2' },
    update: {},
    create: {
      id: 'seed-dokumen-2',
      jamaahId,
      tipe: 'FOTO',
      fileUrl: '/uploads/seed/foto-3x4.jpg',
      fileName: 'foto-3x4.jpg',
      fileSize: 102400,
      status: 'UPLOAD',
    },
  });

  // --- 7. CMS Landing: 3 artikel, 2 ustadz, 2 testimoni, 5 lokasi, 8 partner, 1 hero ---
  const artikel = [
    { judul: 'Panduan Umroh Pertama Kali untuk Pemula', slug: 'panduan-umroh-pertama', kategori: 'Panduan', excerpt: 'Langkah demi langkah mempersiapkan ibadah umroh pertama Anda bersama keluarga.', konten: 'Umroh adalah ibadah yang bisa dilakukan kapan saja...', coverUrl: '/images/artikel/umroh-pertama.jpg' },
    { judul: 'Tips Menjaga Kesehatan Selama di Tanah Suci', slug: 'tips-kesehatan-tanah-suci', kategori: 'Tips', excerpt: 'Cuaca panas Makkah dan Madinah menuntut persiapan fisik yang matang.', konten: 'Minum air zam-zam secara rutin, istirahat cukup...', coverUrl: '/images/artikel/kesehatan.jpg' },
    { judul: 'Perbedaan Haji Reguler dan Haji Plus', slug: 'perbedaan-haji-reguler-plus', kategori: 'Info', excerpt: 'Kenali perbedaan kuota, fasilitas, dan masa tunggu antara haji reguler dan plus.', konten: 'Haji reguler memiliki masa tunggu lebih lama...', coverUrl: '/images/artikel/haji.jpg' },
  ];
  for (const a of artikel) {
    await prisma.artikel.upsert({
      where: { slug: a.slug },
      update: { ...a },
      create: { ...a, isPublished: true },
    });
  }

  const ustadz = [
    { id: 'seed-ustadz-1', nama: 'Ustadz Ahmad Fauzan, Lc.', gelar: 'Lulusan Universitas Islam Madinah', bio: 'Pembimbing ibadah umroh & haji sejak 2015, hafidz Al-Quran.', keahlian: ['Manasik', 'Fiqih Ibadah'], urutan: 1 },
    { id: 'seed-ustadz-2', nama: 'Ustadzah Nurul Hidayah, M.Pd.', gelar: 'Pengajar Fiqih Wanita', bio: 'Spesialis bimbingan manasik untuk jamaah perempuan.', keahlian: ['Manasik Wanita', 'Tahsin'], urutan: 2 },
  ];
  for (const u of ustadz) {
    await prisma.ustadz.upsert({ where: { id: u.id }, update: u, create: u });
  }

  const testimoni = [
    { id: 'seed-testimoni-1', namaJamaah: 'H. Bambang Sutrisno', kota: 'Surabaya', paketId: paketUmroh.id, quote: 'Pelayanan sangat profesional, bimbingan ibadahnya detail. Insya Allah daftar lagi tahun depan.', rating: 5 },
    { id: 'seed-testimoni-2', namaJamaah: 'Ibu Ratna Dewi', kota: 'Bandung', paketId: paketUmroh.id, quote: 'Hotel dekat masjid, transportasi nyaman, tim pendamping ramah. Terima kasih Samira Travel!', rating: 5 },
  ];
  for (const t of testimoni) {
    await prisma.testimoni.upsert({ where: { id: t.id }, update: t, create: t });
  }

  const lokasi = [
    { id: 'seed-lokasi-1', nama: 'Kantor Pusat Brebes', kota: 'Brebes', alamat: 'Grinting, Bulakamba, Brebes, Jawa Tengah', noTelp: '(0283) 555-0001', isKantorPusat: true, urutan: 1 },
    { id: 'seed-lokasi-2', nama: 'Kantor Cabang Surabaya', kota: 'Surabaya', alamat: 'Jl. Ahmad Yani No. 77, Surabaya', noTelp: '(031) 555-0002', isKantorPusat: false, urutan: 2 },
    { id: 'seed-lokasi-3', nama: 'Kantor Cabang Bandung', kota: 'Bandung', alamat: 'Jl. Asia Afrika No. 55, Bandung', noTelp: '(022) 555-0003', isKantorPusat: false, urutan: 3 },
    { id: 'seed-lokasi-4', nama: 'Kantor Cabang Medan', kota: 'Medan', alamat: 'Jl. Gatot Subroto No. 91, Medan', noTelp: '(061) 555-0004', isKantorPusat: false, urutan: 4 },
    { id: 'seed-lokasi-5', nama: 'Kantor Cabang Makassar', kota: 'Makassar', alamat: 'Jl. Jend. Sudirman No. 44, Makassar', noTelp: '(0411) 555-0005', isKantorPusat: false, urutan: 5 },
  ];
  for (const l of lokasi) {
    await prisma.lokasiKantor.upsert({ where: { id: l.id }, update: l, create: l });
  }

  const partner = [
    { id: 'seed-partner-1', nama: 'Garuda Indonesia', logoUrl: '/images/partner/garuda.svg', urutan: 1 },
    { id: 'seed-partner-2', nama: 'Saudi Airlines', logoUrl: '/images/partner/saudia.svg', urutan: 2 },
    { id: 'seed-partner-3', nama: 'Flynas', logoUrl: '/images/partner/flynas.svg', urutan: 3 },
    { id: 'seed-partner-4', nama: 'Hotel Fairmont Makkah', logoUrl: '/images/partner/fairmont.svg', urutan: 4 },
    { id: 'seed-partner-5', nama: 'Anwar Al Madinah Mövenpick', logoUrl: '/images/partner/movenpick.svg', urutan: 5 },
    { id: 'seed-partner-6', nama: 'Asuransi Sinar Mas', logoUrl: '/images/partner/sinarmas.svg', urutan: 6 },
    { id: 'seed-partner-7', nama: 'Taspen', logoUrl: '/images/partner/taspen.svg', urutan: 7 },
    { id: 'seed-partner-8', nama: 'Kementerian Agama RI', logoUrl: '/images/partner/kemenag.svg', urutan: 8 },
  ];
  for (const p of partner) {
    await prisma.partnerLogo.upsert({ where: { id: p.id }, update: p, create: p });
  }

  await prisma.heroSlide.upsert({
    where: { id: 'seed-hero-1' },
    update: {
      judul: 'Wujudkan Panggilan Suci Anda',
      quote: 'Kami mendampingi ibadah haji & umroh Anda dengan layanan terbaik dan bimbingan ustadz berpengalaman.',
      gambarUrl: '/images/hero/kaaba.jpg',
      ctaLabel: 'Daftar Sekarang',
      ctaHref: '/daftar',
      urutan: 1,
      isActive: true,
    },
    create: {
      id: 'seed-hero-1',
      judul: 'Wujudkan Panggilan Suci Anda',
      quote: 'Kami mendampingi ibadah haji & umroh Anda dengan layanan terbaik dan bimbingan ustadz berpengalaman.',
      gambarUrl: '/images/hero/kaaba.jpg',
      ctaLabel: 'Daftar Sekarang',
      ctaHref: '/daftar',
      urutan: 1,
      isActive: true,
    },
  });

  // --- 8. SistemConfig singleton (QRIS + rekening) ---
  await prisma.sistemConfig.upsert({
    where: { id: 'sistem' },
    update: {
      rekeningBank: '7001234567',
      namaRekening: 'HAJI UMROH CENTER',
      namaBank: 'BSI',
    },
    create: {
      id: 'sistem',
      qrisDanaString: '00020101021126630014ID.CO.QRIS.WWW0118936009153030305140000015204531530358032ID52045315530336054061000005802ID5916MORAT MARIT CLUB6010KAB BREBES610552211',
      qrisGopayString: '00020101021126630014ID.CO.QRIS.WWW0118936009153030305140000015204531530358032ID52045315530336054061000005802ID5916MORAT MARIT CLUB6010KAB BREBES610552211',
      qrisDefaultProvider: 'DANA',
      rekeningBank: '7001234567',
      namaRekening: 'HAJI UMROH CENTER',
      namaBank: 'BSI',
      updatedBy: admin.id,
    },
  });

  console.log('[seed] selesai:');
  console.log(`  users   : ${[admin.email, manajer.email, staff.email, jamaahUser.email].join(', ')}`);
  console.log(`  paket   : ${paketUmroh.nama} (${paketUmroh.id}), ${paketHaji.nama} (${paketHaji.id})`);
  console.log(`  jamaah  : ${jamaah.nomorRegistrasi} ${jamaah.namaLengkap} (${jamaah.id})`);
  console.log('  tagihan : 4x cicilan, pembayaran #1 DITERIMA');
  console.log('  dokumen : PASPOR VERIFIED, FOTO UPLOAD');
  console.log('  CMS     : 3 artikel, 2 ustadz, 2 testimoni, 5 lokasi, 8 partner, 1 hero');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error('[seed] GAGAL:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
