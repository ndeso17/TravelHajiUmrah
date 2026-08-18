import { tagihanService } from './tagihan.service.js';
import { asyncHandler } from '../../middleware/async-handler.js';

export const generateTagihan = asyncHandler(async (req, res) => {
  const result = await tagihanService.generateTagihan(req.body);
  res.status(201).json({ success: true, data: result });
});

export const listTagihan = asyncHandler(async (req, res) => {
  const jamaahId = req.scopeJamaahId ?? req.params.jamaahId;
  const result = await tagihanService.listTagihan(jamaahId);
  res.json({ success: true, data: result });
});