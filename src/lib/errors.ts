export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "INSUFFICIENT_INVENTORY"
  | "INVALID_COUPON"
  | "INVALID_PAYMENT_SIGNATURE";

export interface AppError {
  code: AppErrorCode;
  message: string;
  details?: Record<string, string[]>;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: AppErrorCode,
    message: string,
    public readonly details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export function notFound(message = "Resource not found"): ApiError {
  return new ApiError(404, "NOT_FOUND", message);
}

export function unauthorized(message = "Unauthorized"): ApiError {
  return new ApiError(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "Forbidden"): ApiError {
  return new ApiError(403, "FORBIDDEN", message);
}

export function conflict(message = "Conflict"): ApiError {
  return new ApiError(409, "CONFLICT", message);
}

export function validationError(
  message: string,
  details?: Record<string, string[]>
): ApiError {
  return new ApiError(400, "VALIDATION_ERROR", message, details);
}

export function internalError(message = "Internal server error"): ApiError {
  return new ApiError(500, "INTERNAL_ERROR", message);
}

export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(error.toJSON(), { status: error.statusCode });
  }

  console.error("[API Error]", error);
  return Response.json(
    { code: "INTERNAL_ERROR", message: "Internal server error" },
    { status: 500 }
  );
}
