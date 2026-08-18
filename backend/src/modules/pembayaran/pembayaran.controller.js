import { pembayaranService } from './pembayaran.service.js';
import { qrisService } from './qris.service.js';
import { asyncHandler } from '../../middleware/async-handler.js';
import { ApiError } from '../../lib/api-error.js';

export const listPembayaran = asyncHandler(async (req, res) => {
  const query = req.scopeJamaahId ? { ...req.query, jamaahId: req.scopeJamaahId } : req.query;
  const { data, meta } = await pembayaranService.listPembayaran(query);
  res.json({ success: true, data, meta });
});

export const createPembayaran = asyncHandler(async (req, res) => {
  const jamaahId = req.scopeJamaahId ?? req.body.jamaahId;
  if (!jamaahId) throw ApiError.badRequest('Jamaah wajib diisi', undefined, 'JAMAAH_REQUIRED');
  const pembayaran = await pembayaranService.createPembayaran({ ...req.body, jamaahId, createdBy: req.user.id });
  res.status(201).json({ success: true, data: pembayaran });
});

export const uploadBukti = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('File bukti wajib diunggah', undefined, 'FILE_REQUIRED');
  const jamaahId = req.scopeJamaahId ?? req.body.jamaahId;
  if (!jamaahId) throw ApiError.badRequest('Jamaah wajib diisi', undefined, 'JAMAAH_REQUIRED');
  const pembayaran = await pembayaranService.createPembayaran({
    ...req.body,
    jamaahId,
    buktiBayar: req.file.path,
    createdBy: req.user.id,
  });
  res.status(201).json({ success: true, data: pembayaran });
});

export const verifikasiPembayaran = asyncHandler(async (req, res) => {
  const result = await pembayaranService.verifikasiPembayaran(req.params.pembayaranId, req.body, req.user.id);
  res.json({ success: true, data: result });
});

export const cashPembayaran = asyncHandler(async (req, res) => {
  const pembayaran = await pembayaranService.cashPembayaran({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ success: true, data: pembayaran });
});

export const getQris = asyncHandler(async (req, res) => {
  const qris = await qrisService.getQrisForTagihan(req.params.tagihanId, req.query.provider, req.scopeJamaahId);
  res.json({ success: true, data: qris });
});

export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await pembayaranService.getInvoice(req.params.id, req.scopeJamaahId);
  res.json({ success: true, data: invoice });
});