import { jamaahService } from './jamaah.service.js';
import { asyncHandler } from '../../middleware/async-handler.js';

export const listJamaah = asyncHandler(async (req, res) => {
  const { data, meta } = await jamaahService.listJamaah(req.query);
  res.json({ success: true, data, meta });
});

export const getJamaah = asyncHandler(async (req, res) => {
  const jamaah = await jamaahService.getJamaah(req.params.id);
  res.json({ success: true, data: jamaah });
});

export const createJamaah = asyncHandler(async (req, res) => {
  const jamaah = await jamaahService.createJamaah(req.body);
  res.status(201).json({ success: true, data: jamaah });
});

export const updateJamaah = asyncHandler(async (req, res) => {
  const jamaah = await jamaahService.updateJamaah(req.params.id, req.body);
  res.json({ success: true, data: jamaah });
});