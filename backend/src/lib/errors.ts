export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function fail(statusCode: number, message: string): never {
  throw new ApiError(statusCode, message);
}
