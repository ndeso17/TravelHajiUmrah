import { settingsService } from './settings.service.js';
import { asyncHandler } from '../../middleware/async-handler.js';

export const getQris = asyncHandler(async (req, res) => {
  const config = await settingsService.getQris();
  res.json({ success: true, data: config });
});

export const updateQris = asyncHandler(async (req, res) => {
  const config = await settingsService.updateQris(req.body, req.user.id);
  res.json({ success: true, data: config });
});