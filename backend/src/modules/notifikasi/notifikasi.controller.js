import { notifikasiService } from './notifikasi.service.js';
import { asyncHandler } from '../../middleware/async-handler.js';

export const broadcast = asyncHandler(async (req, res) => {
  const hasil = await notifikasiService.broadcast(req.body);
  res.json({ success: true, data: hasil });
});