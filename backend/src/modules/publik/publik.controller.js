import { publikService } from './publik.service.js';
import { asyncHandler } from '../../middleware/async-handler.js';

export const getLanding = asyncHandler(async (req, res) => {
  const payload = await publikService.getLanding();
  res.json({ success: true, data: payload });
});

export const createPublicJamaah = asyncHandler(async (req, res) => {
  const jamaah = await publikService.createPublicJamaah(req.body);
  res.status(201).json({ success: true, data: jamaah });
});

export const getMe = asyncHandler(async (req, res) => {
  const jamaah = await publikService.getMe(req.user.id);
  res.json({ success: true, data: jamaah });
});

export const updateMe = asyncHandler(async (req, res) => {
  const jamaah = await publikService.updateMe(req.user.id, req.body);
  res.json({ success: true, data: jamaah });
});