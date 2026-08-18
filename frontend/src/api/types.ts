export const ROLES = ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'JAMAAH'] as const;
export type Role = (typeof ROLES)[number];

export const TIPE_PAKET = ['HAJI', 'UMROH'] as const;
export type TipePaket = (typeof TIPE_PAKET)[number];

export const JENIS_KELAMIN = ['LAKI_LAKI', 'PEREMPUAN'] as const;
export type JenisKelamin = (typeof JENIS_KELAMIN)[number];

export const STATUS_DOKUMEN = ['BELUM', 'UPLOAD', 'VERIFIED', 'REJECTED'] as const;
export type StatusDokumen = (typeof STATUS_DOKUMEN)[number];

export const STATUS_PENDAFTARAN = ['MENUNGGU', 'AKTIF', 'LUNAS', 'BATAL'] as const;
export type StatusPendaftaran = (typeof STATUS_PENDAFTARAN)[number];

export const SKEMA_BAYAR = ['NORMAL', 'UMROH_DULU_BAYAR_NANTI'] as const;
export type SkemaBayar = (typeof SKEMA_BAYAR)[number];

export const STATUS_TAGIHAN = ['BELUM', 'MENUNGGU_VERIFIKASI', 'LUNAS', 'TERLAMBAT'] as const;
export type StatusTagihan = (typeof STATUS_TAGIHAN)[number];

export const METODE_BAYAR = ['QRIS', 'TRANSFER', 'CASH'] as const;
export type MetodeBayar = (typeof METODE_BAYAR)[number];

export const STATUS_VERIFIKASI = ['MENUNGGU', 'DITERIMA', 'DITOLAK'] as const;
export type StatusVerifikasi = (typeof STATUS_VERIFIKASI)[number];

export const TIPE_DOKUMEN = ['PASPOR', 'VISA', 'FOTO', 'KTP', 'SERTIFIKAT', 'LAINNYA'] as const;
export type TipeDokumen = (typeof TIPE_DOKUMEN)[number];

export const QRIS_PROVIDER = ['DANA', 'GOPAY'] as const;
export type QrisProvider = (typeof QRIS_PROVIDER)[number];

export type PaginationMeta = {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
};

export type ListResponse<T> = {
  readonly success: true;
  readonly data: readonly T[];
  readonly meta: PaginationMeta;
};

export type SingleResponse<T> = {
  readonly success: true;
  readonly data: T;
};

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'
  | string;

export type ErrorResponse = {
  readonly success: false;
  readonly error: {
    readonly code: ApiErrorCode;
    readonly message: string;
    readonly details?: readonly unknown[];
  };
};

export type AuthUser = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
};

export type User = AuthUser & {
  readonly isActive: boolean;
  readonly createdAt: string;
};

export type LoginCredentials = {
  readonly email: string;
  readonly password: string;
};

export type Paket = {
  readonly id: string;
  readonly nama: string;
  readonly tipe: TipePaket;
  readonly harga: string;
  readonly kuota: number;
  readonly tanggalBuka: string;
  readonly tanggalTutup: string;
  readonly itinerary: string | null;
  readonly fasilitas: readonly string[];
  readonly isAktif: boolean;
  readonly createdAt: string;
};

export type Jamaah = {
  readonly id: string;
  readonly nomorRegistrasi: string;
  readonly userId: string | null;
  readonly paketId: string;
  readonly kloter: string | null;
  readonly namaLengkap: string;
  readonly namaAyah: string | null;
  readonly tempatLahir: string;
  readonly tanggalLahir: string;
  readonly jenisKelamin: JenisKelamin;
  readonly statusPerkawinan: string | null;
  readonly alamat: string;
  readonly noTelp: string;
  readonly email: string | null;
  readonly statusPaspor: StatusDokumen;
  readonly statusVisa: StatusDokumen;
  readonly statusFoto: StatusDokumen;
  readonly statusPendaftaran: StatusPendaftaran;
  readonly tipeSkema: SkemaBayar;
  readonly depositMinimal: string | null;
  readonly sudahBerangkat: boolean;
  readonly deadlinePelunasan: string | null;
  readonly createdAt: string;
  readonly paket?: Pick<Paket, 'id' | 'nama' | 'tipe' | 'harga'>;
};

export type TagihanCicilan = {
  readonly id: string;
  readonly jamaahId: string;
  readonly urutan: number;
  readonly jumlah: string;
  readonly deadline: string | null;
  readonly status: StatusTagihan;
  readonly createdAt: string;
};

export type Pembayaran = {
  readonly id: string;
  readonly jamaahId: string;
  readonly tagihanId: string | null;
  readonly jumlah: string;
  readonly metodeBayar: MetodeBayar;
  readonly qrisProvider: QrisProvider | null;
  readonly buktiBayar: string | null;
  readonly statusVerifikasi: StatusVerifikasi;
  readonly catatanRejeksi: string | null;
  readonly verifiedBy: string | null;
  readonly verifiedAt: string | null;
  readonly tanggal: string;
  readonly createdBy: string;
  readonly jamaah?: Pick<Jamaah, 'id' | 'namaLengkap' | 'nomorRegistrasi'>;
  readonly tagihan?: Pick<TagihanCicilan, 'urutan' | 'status'> | null;
};

export type Dokumen = {
  readonly id: string;
  readonly jamaahId: string;
  readonly tipe: TipeDokumen;
  readonly fileUrl: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly status: StatusDokumen;
  readonly catatan: string | null;
  readonly uploadedAt: string;
  readonly verifiedBy: string | null;
  readonly verifiedAt: string | null;
  readonly jamaah?: Pick<Jamaah, 'id' | 'namaLengkap' | 'nomorRegistrasi'>;
};

export type Invoice = {
  readonly nomorInvoice: string;
  readonly pembayaran: Pembayaran & {
    readonly jamaah: Jamaah & { readonly paket: Paket };
    readonly tagihan: TagihanCicilan | null;
  };
};

export type HeroSlide = {
  readonly id: string;
  readonly judul: string;
  readonly quote: string | null;
  readonly gambarUrl: string | null;
  readonly videoUrl: string | null;
  readonly ctaLabel: string | null;
  readonly ctaHref: string | null;
  readonly urutan: number;
  readonly isActive: boolean;
};

export type Artikel = {
  readonly id: string;
  readonly judul: string;
  readonly slug: string;
  readonly kategori: string;
  readonly excerpt: string | null;
  readonly konten: string;
  readonly coverUrl: string | null;
  readonly isPublished: boolean;
  readonly createdAt: string;
};

export type Ustadz = {
  readonly id: string;
  readonly nama: string;
  readonly gelar: string | null;
  readonly bio: string | null;
  readonly fotoUrl: string | null;
  readonly keahlian: readonly string[];
  readonly urutan: number;
};

export type Testimoni = {
  readonly id: string;
  readonly namaJamaah: string;
  readonly kota: string | null;
  readonly paketId: string | null;
  readonly quote: string;
  readonly rating: number | null;
  readonly fotoUrl: string | null;
  readonly paket?: Pick<Paket, 'id' | 'nama' | 'tipe'> | null;
};

export type LokasiKantor = {
  readonly id: string;
  readonly nama: string;
  readonly kota: string;
  readonly alamat: string;
  readonly noTelp: string | null;
  readonly isKantorPusat: boolean;
  readonly urutan: number;
};

export type PartnerLogo = {
  readonly id: string;
  readonly nama: string;
  readonly logoUrl: string;
  readonly urutan: number;
};

export type LandingPayload = {
  readonly paketAktif: readonly Paket[];
  readonly heroSlides: readonly HeroSlide[];
  readonly artikel: readonly Artikel[];
  readonly ustadz: readonly Ustadz[];
  readonly testimoni: readonly Testimoni[];
  readonly partner: readonly PartnerLogo[];
  readonly lokasi: readonly LokasiKantor[];
};
