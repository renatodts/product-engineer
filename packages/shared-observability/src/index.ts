// TODO: Replace with real logging/tracing (OpenTelemetry) as projects require it.
export const PACKAGE_NAME = '@product-engineer/shared-observability';

export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export const consoleLogger: Logger = {
  info: (message, meta) => console.info(message, meta ?? {}),
  error: (message, meta) => console.error(message, meta ?? {}),
};
