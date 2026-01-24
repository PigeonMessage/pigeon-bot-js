export interface ClientConfig {
  /**
   * Bot token, without the `Bot ` prefix.
   */
  token: string;

  /**
   * Base HTTP URL API, withoud `/api/v1`.
   *
   * Example: `https://pigeon.example.com`
   *
   * Default: `http://localhost:8000`
   */
  baseUrl?: string;

  /**
   * Full WebSocket URL or origin without path.
   *
   * If not specified, the URL is built based on `baseUrl`.
   */
  wsUrl?: string;

  /**
   * Enable auto-reconnection
   */
  autoReconnect?: boolean;

  /**
   * Interval between reconnection attempts (ms)
   */
  reconnectIntervalMs?: number;
}

export const DEFAULT_BASE_URL = "http://localhost:8000";
export const DEFAULT_API_PREFIX = "/api/v1";
export const DEFAULT_WS_PATH = "/ws";

export function resolveBaseUrl(config: ClientConfig): string {
  return (config.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

export function resolveApiUrl(config: ClientConfig, path: string): string {
  const base = resolveBaseUrl(config);
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;
  return `${base}${DEFAULT_API_PREFIX}${normalizedPath}`;
}

export function resolveWsUrl(config: ClientConfig): string {
  if (config.wsUrl) {
    if (config.wsUrl.startsWith("ws://") || config.wsUrl.startsWith("wss://")) {
      return config.wsUrl;
    }
    const origin = config.wsUrl.replace(/\/+$/, "");
    return `${origin}${DEFAULT_WS_PATH}`;
  }

  const httpBase = resolveBaseUrl(config);
  const url = new URL(httpBase);
  const protocol = url.protocol === "https:" ? "wss:" : "ws:";
  const origin = `${protocol}//${url.host}`;
  return `${origin}${DEFAULT_WS_PATH}`;
}


