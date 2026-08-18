import { asyncHandler } from '../../middleware/async-handler.js';
import { usersService } from './users.service.js';

export const listUsers = asyncHandler(async (req, res) => {
  const { data, meta } = await usersService.listUsers(req.query);
  res.json({ success: true, data, meta });
});

export const createUser = asyncHandler(async (req, res) => {
  const user = await usersService.createUser(req.body);
  res.status(201).json({ success: true, data: user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await usersService.updateUser(req.params.id, req.body);
  res.json({ success: true, data: user });
});
