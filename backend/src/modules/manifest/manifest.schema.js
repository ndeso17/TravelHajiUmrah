import { z } from 'zod';

export const listManifestQuerySchema = z.object({
  kloter: z.string().min(1),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const exportManifestQuerySchema = z.object({
  kloter: z.string().min(1),
});