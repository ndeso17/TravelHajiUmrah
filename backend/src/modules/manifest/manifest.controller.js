import { manifestService } from './manifest.service.js';
import { asyncHandler } from '../../middleware/async-handler.js';

export const listManifest = asyncHandler(async (req, res) => {
  const result = await manifestService.listManifest(req.query);
  res.json({
    success: true,
    data: result.manifest,
    meta: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages },
  });
});

export const exportManifest = asyncHandler(async (req, res) => {
  const buffer = await manifestService.exportManifest(req.query.kloter);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="manifest-${req.query.kloter}.xlsx"`);
  res.send(buffer);
});