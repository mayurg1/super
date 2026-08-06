import {
  ErrorCode,
  isApiErrorEnvelope,
  type ApiEnvelope,
} from '@supercampus/contracts';
import { AppError } from '@supercampus/core';

export interface ApiClientOptions {
  baseUrl: string;
  getAccessToken?: () => string | null;
  fetchFn?: typeof fetch;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getAccessToken?: () => string | null;
  private readonly fetchFn: typeof fetch;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.getAccessToken = options.getAccessToken;
    this.fetchFn = options.fetchFn ?? fetch.bind(globalThis);
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
    };

    const token = this.getAccessToken?.();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let body: string | undefined;
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.body);
    }

    let response: Response;
    try {
      response = await this.fetchFn(url, {
        method: options.method ?? 'GET',
        headers,
        body,
        signal: options.signal,
      });
    } catch (error) {
      throw new AppError(ErrorCode.NETWORK, 'Unable to reach the server', { cause: error });
    }

    const text = await response.text();
    let payload: unknown = null;
    if (text) {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        throw new AppError(ErrorCode.UNKNOWN, 'Invalid JSON response from server');
      }
    }

    if (!response.ok) {
      if (isApiErrorEnvelope(payload)) {
        throw new AppError(payload.error.code, payload.error.message, {
          status: response.status,
          fields: payload.error.fields,
        });
      }
      throw new AppError(ErrorCode.UNKNOWN, `Request failed with status ${response.status}`, {
        status: response.status,
      });
    }

    if (payload && typeof payload === 'object' && 'success' in payload) {
      const envelope = payload as ApiEnvelope<T>;
      if (!envelope.success) {
        throw new AppError(envelope.error.code, envelope.error.message, {
          fields: envelope.error.fields,
        });
      }
      return envelope.data;
    }

    return payload as T;
  }

  get<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}
