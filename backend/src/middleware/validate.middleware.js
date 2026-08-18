import { ApiError } from '../lib/api-error.js';

export function validate(schema, location = 'body') {
  return (req, res, next) => {
    const source =
      location === 'query' ? req.query : location === 'params' ? req.params : req.body;
    const result = schema.safeParse(source);
    if (!result.success) {
      throw ApiError.badRequest('Validasi gagal', result.error.errors, 'VALIDATION_ERROR');
    }
    if (location === 'query') {
      Object.defineProperty(req, 'query', {
        value: result.data,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else if (location === 'params') {
      req.params = result.data;
    } else {
      req.body = result.data;
    }
    next();
  };
}