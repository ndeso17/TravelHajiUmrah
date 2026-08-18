// Wrap async route handler → error diteruskan ke error handler Express
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}