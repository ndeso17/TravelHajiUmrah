import { PrismaClient } from '@prisma/client';

// Singleton PrismaClient — hindari koneksi ganda saat hot-reload dev
const prisma = new PrismaClient();

export default prisma;