import { paketService } from './paket.service.js';
import { asyncHandler } from '../../middleware/async-handler.js';

export const listPaket = asyncHandler(async (req, res) => {
  const { data, meta } = await paketService.listPaket(req.query);
  res.json({ success: true, data, meta });
});

export const getPaket = asyncHandler(async (req, res) => {
  const paket = await paketService.getPaket(req.params.id);
  res.json({ success: true, data: paket });
});

export const createPaket = asyncHandler(async (req, res) => {
  const paket = await paketService.createPaket(req.body);
  res.status(201).json({ success: true, data: paket });
});

export const updatePaket = asyncHandler(async (req, res) => {
  const paket = await paketService.updatePaket(req.params.id, req.body);
  res.json({ success: true, data: paket });
});

export const deletePaket = asyncHandler(async (req, res) => {
  const paket = await paketService.deletePaket(req.params.id);
  res.json({ success: true, data: { id: paket.id, message: 'Paket dihapus' } });
});