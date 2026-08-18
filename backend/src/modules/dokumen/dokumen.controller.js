import { dokumenService } from './dokumen.service.js';
import { asyncHandler } from '../../middleware/async-handler.js';

export const listDokumen = asyncHandler(async (req, res) => {
  const query = req.scopeJamaahId ? { ...req.query, jamaahId: req.scopeJamaahId } : req.query;
  const result = await dokumenService.listDokumen(query);
  res.json({ success: true, data: result.dokumen, meta: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages } });
});

export const uploadDokumen = asyncHandler(async (req, res) => {
  const jamaahId = req.scopeJamaahId ?? req.body.jamaahId;
  const dokumen = await dokumenService.uploadDokumen({ ...req.body, jamaahId, file: req.file });
  res.status(201).json({ success: true, data: dokumen });
});

export const verifikasiDokumen = asyncHandler(async (req, res) => {
  const dokumen = await dokumenService.verifikasiDokumen(req.params.dokumenId, req.body, req.user.id);
  res.json({ success: true, data: dokumen });
});