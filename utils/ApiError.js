import { makeLog } from "./logentries.js";

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.stack = new Error().stack;
    if (process.env.errorLogs) {
      makeLog(message, "ApiError", process.env.errorLogs);
    }
  }

  static badRequest(message) {
    return new ApiError(400, message);
  }

  static unauthorized(message) {
    return new ApiError(401, message);
  }

  static notFound(message) {
    return new ApiError(404, message);
  }
}

export default ApiError;
