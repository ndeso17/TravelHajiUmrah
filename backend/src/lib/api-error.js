export class ApiError extends Error {
  constructor({ code = 'INTERNAL_ERROR', message, statusCode = 500, details }) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message = 'Bad Request', details, code = 'BAD_REQUEST') {
    return new ApiError({ code, message, statusCode: 400, details });
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError({ code: 'UNAUTHORIZED', message, statusCode: 401 });
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError({ code: 'FORBIDDEN', message, statusCode: 403 });
  }

  static notFound(message = 'Not Found') {
    return new ApiError({ code: 'NOT_FOUND', message, statusCode: 404 });
  }
}