import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma.js';

const SELECT_SAFE_USER = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
};

export function createUsersService(db = prisma) {
  async function listUsers({ page = 1, limit = 10, q, role } = {}) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
    const where = {};
    if (role) where.role = role;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      db.user.findMany({
        where,
        select: SELECT_SAFE_USER,
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      db.user.count({ where }),
    ]);

    return { data, meta: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } };
  }

  async function createUser({ name, email, password, role }) {
    const hashed = await bcrypt.hash(password, 10);
    return db.user.create({
      data: { name, email, password: hashed, role },
      select: SELECT_SAFE_USER,
    });
  }

  async function updateUser(id, payload) {
    const data = { ...payload };
    if (payload.password) {
      data.password = await bcrypt.hash(payload.password, 10);
    }
    return db.user.update({
      where: { id },
      data,
      select: SELECT_SAFE_USER,
    });
  }

  return { listUsers, createUser, updateUser };
}

export const usersService = createUsersService();
