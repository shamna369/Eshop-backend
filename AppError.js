class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.statusCode = statusCode === 200 ? 500 : statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
