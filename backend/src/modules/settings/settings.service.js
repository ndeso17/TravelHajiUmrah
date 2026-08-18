import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/api-error.js';

const SINGLETON_ID = 'sistem';

export function createSettingsService(db = prisma) {
  async function getQris() {
    const config = await db.sistemConfig.findUnique({ where: { id: SINGLETON_ID } });
    if (!config) throw ApiError.notFound('Konfigurasi QRIS belum diatur', undefined, 'QRIS_BELUM_DIATUR');
    return config;
  }

  async function updateQris(data, adminId) {
    const payload = {
      ...data,
      qrisDefaultProvider: data.qrisDefaultProvider ?? 'DANA',
      updatedBy: adminId,
    };
    return db.sistemConfig.upsert({
      where: { id: SINGLETON_ID },
      update: payload,
      create: { id: SINGLETON_ID, ...payload },
    });
  }

  return { getQris, updateQris };
}

export const settingsService = createSettingsService();