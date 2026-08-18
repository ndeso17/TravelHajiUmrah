import { laporanService } from './laporan.service.js';
import { asyncHandler } from '../../middleware/async-handler.js';

export const pendapatan = asyncHandler(async (req, res) => {
  const data = await laporanService.pendapatan(req.query);
  res.json({ success: true, data });
});

export const keberangkatan = asyncHandler(async (req, res) => {
  const data = await laporanService.keberangkatan(req.query);
  res.json({ success: true, data });
});