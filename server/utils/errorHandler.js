// /server/utils/errorHandler.js
// Centralized error handling for consistency across the app

class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ErrorHandler;
