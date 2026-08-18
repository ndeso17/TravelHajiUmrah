-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF', 'JAMAAH');

-- CreateEnum
CREATE TYPE "QrisProvider" AS ENUM ('DANA', 'GOPAY');

-- CreateEnum
CREATE TYPE "TipePaket" AS ENUM ('HAJI', 'UMROH');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "StatusDokumen" AS ENUM ('BELUM', 'UPLOAD', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StatusPendaftaran" AS ENUM ('MENUNGGU', 'AKTIF', 'LUNAS', 'BATAL');

-- CreateEnum
CREATE TYPE "SkemaBayar" AS ENUM ('NORMAL', 'UMROH_DULU_BAYAR_NANTI');

-- CreateEnum
CREATE TYPE "StatusTagihan" AS ENUM ('BELUM', 'MENUNGGU_VERIFIKASI', 'LUNAS', 'TERLAMBAT');

-- CreateEnum
CREATE TYPE "MetodeBayar" AS ENUM ('QRIS', 'TRANSFER', 'CASH');

-- CreateEnum
CREATE TYPE "StatusVerifikasi" AS ENUM ('MENUNGGU', 'DITERIMA', 'DITOLAK');

-- CreateEnum
CREATE TYPE "TipeDokumen" AS ENUM ('PASPOR', 'VISA', 'FOTO', 'KTP', 'SERTIFIKAT', 'LAINNYA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SistemConfig" (
    "id" TEXT NOT NULL,
    "qrisDanaString" TEXT NOT NULL,
    "qrisGopayString" TEXT NOT NULL,
    "qrisDefaultProvider" "QrisProvider" NOT NULL DEFAULT 'DANA',
    "rekeningBank" TEXT,
    "namaRekening" TEXT,
    "namaBank" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "SistemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paket" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" "TipePaket" NOT NULL,
    "harga" DECIMAL(65,30) NOT NULL,
    "kuota" INTEGER NOT NULL,
    "tanggalBuka" TIMESTAMP(3) NOT NULL,
    "tanggalTutup" TIMESTAMP(3) NOT NULL,
    "itinerary" TEXT,
    "fasilitas" TEXT[],
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Paket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jamaah" (
    "id" TEXT NOT NULL,
    "nomorRegistrasi" TEXT NOT NULL,
    "userId" TEXT,
    "paketId" TEXT NOT NULL,
    "kloter" TEXT,
    "namaLengkap" TEXT NOT NULL,
    "namaAyah" TEXT,
    "tempatLahir" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "jenisKelamin" "JenisKelamin" NOT NULL,
    "statusPerkawinan" TEXT,
    "alamat" TEXT NOT NULL,
    "noTelp" TEXT NOT NULL,
    "email" TEXT,
    "statusPaspor" "StatusDokumen" NOT NULL DEFAULT 'BELUM',
    "statusVisa" "StatusDokumen" NOT NULL DEFAULT 'BELUM',
    "statusFoto" "StatusDokumen" NOT NULL DEFAULT 'BELUM',
    "statusPendaftaran" "StatusPendaftaran" NOT NULL DEFAULT 'MENUNGGU',
    "tipeSkema" "SkemaBayar" NOT NULL DEFAULT 'NORMAL',
    "depositMinimal" DECIMAL(65,30),
    "sudahBerangkat" BOOLEAN NOT NULL DEFAULT false,
    "deadlinePelunasan" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Jamaah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagihanCicilan" (
    "id" TEXT NOT NULL,
    "jamaahId" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "jumlah" DECIMAL(65,30) NOT NULL,
    "deadline" TIMESTAMP(3),
    "status" "StatusTagihan" NOT NULL DEFAULT 'BELUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TagihanCicilan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pembayaran" (
    "id" TEXT NOT NULL,
    "jamaahId" TEXT NOT NULL,
    "tagihanId" TEXT,
    "jumlah" DECIMAL(65,30) NOT NULL,
    "metodeBayar" "MetodeBayar" NOT NULL,
    "qrisProvider" "QrisProvider",
    "buktiBayar" TEXT,
    "statusVerifikasi" "StatusVerifikasi" NOT NULL DEFAULT 'MENUNGGU',
    "catatanRejeksi" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dokumen" (
    "id" TEXT NOT NULL,
    "jamaahId" TEXT NOT NULL,
    "tipe" "TipeDokumen" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" "StatusDokumen" NOT NULL DEFAULT 'UPLOAD',
    "catatan" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "Dokumen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artikel" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "excerpt" TEXT,
    "konten" TEXT NOT NULL,
    "coverUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artikel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ustadz" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "gelar" TEXT,
    "bio" TEXT,
    "fotoUrl" TEXT,
    "keahlian" TEXT[],
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Ustadz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimoni" (
    "id" TEXT NOT NULL,
    "namaJamaah" TEXT NOT NULL,
    "kota" TEXT,
    "paketId" TEXT,
    "quote" TEXT NOT NULL,
    "rating" INTEGER,
    "fotoUrl" TEXT,

    CONSTRAINT "Testimoni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LokasiKantor" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kota" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "noTelp" TEXT,
    "isKantorPusat" BOOLEAN NOT NULL DEFAULT false,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LokasiKantor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerLogo" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PartnerLogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "quote" TEXT,
    "gambarUrl" TEXT,
    "videoUrl" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Jamaah_nomorRegistrasi_key" ON "Jamaah"("nomorRegistrasi");

-- CreateIndex
CREATE UNIQUE INDEX "Jamaah_userId_key" ON "Jamaah"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Pembayaran_tagihanId_key" ON "Pembayaran"("tagihanId");

-- CreateIndex
CREATE UNIQUE INDEX "Artikel_slug_key" ON "Artikel"("slug");

-- AddForeignKey
ALTER TABLE "Jamaah" ADD CONSTRAINT "Jamaah_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jamaah" ADD CONSTRAINT "Jamaah_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "Paket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagihanCicilan" ADD CONSTRAINT "TagihanCicilan_jamaahId_fkey" FOREIGN KEY ("jamaahId") REFERENCES "Jamaah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_jamaahId_fkey" FOREIGN KEY ("jamaahId") REFERENCES "Jamaah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_tagihanId_fkey" FOREIGN KEY ("tagihanId") REFERENCES "TagihanCicilan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dokumen" ADD CONSTRAINT "Dokumen_jamaahId_fkey" FOREIGN KEY ("jamaahId") REFERENCES "Jamaah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimoni" ADD CONSTRAINT "Testimoni_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "Paket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
