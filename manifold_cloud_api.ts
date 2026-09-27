//
// manifold_cloud_api.ts

import { request as httpRequest, RequestOptions as HttpRequestOptions } from 'http';
import { request as httpsRequest, RequestOptions as HttpsRequestOptions } from 'https';
import { URL } from 'url';
import WebSocket, { MessageEvent } from 'ws';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

const DEFAULT_JOBS_WEBSOCKET_URL = 'ws://127.0.0.1:3000/jobs/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtb2RlIjoicncifQ.QKGnMJe41OFZcjz_qQSplmWAmVd_hmVjijKUNoJYpis';

interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number; // milliseconds
}

interface LoginResponse {
  token: string;
  expires_in?: number;
  user?: any;
}


interface JobMessage {
  event: string;
  channel: string;
  payload: string;
}

/**
 * Connects to a WebSocket, waits for a message matching `targetJobId`,
 * closes the connection, and resolves with the message payload.
 */
function waitForJobMessage(
  response : any,
  webSocketURL: string,
  timeoutMs: number = 30000
): Promise<JobMessage> {
  return new Promise((resolve, reject) => {

    //const response_parsed = JSON.parse(response.toString('utf-8'));
    //console.log('response', response);
    let target_job_id = response.job_id;
    //console.log('target_job_id', target_job_id);

    //const decoder = new TextDecoder('utf-8');
    //const jsonString = decoder.decode(response);
    //const response_parsed = JSON.parse(jsonString);
    //console.log('response_parsed ', response_parsed);

    const ws = new WebSocket(webSocketURL);
    let timeoutId: NodeJS.Timeout;
    let settled = false;

    // Helper to clear timers and close the connection cleanly
    const cleanup = () => {
      clearTimeout(timeoutId);
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;

      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };

    // Timeout guard so the client doesn't wait indefinitely
    timeoutId = setTimeout(() => {
      settled = true;
      cleanup();
      reject(new Error(`Timed out waiting for job ${target_job_id} after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    ws.onopen = () => {
      // Optional: Tell the server which job channel/room we care about
      //ws.send(JSON.stringify({ action: 'subscribe', jobId: targetJobId }));
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const message: JobMessage = JSON.parse(event.data.toString());
        const message_event   = message.event;
        const message_channel = message.channel;
        const message_payload = JSON.parse(message.payload);

        //console.log('message', message);
        //console.log('message_event', message_event);
        //console.log('message_channel', message_event);
        //console.log('message_payload', message_payload);

        if((message_event === 'completion') && (message_payload.job_id === target_job_id))
        {
          //console.log('completion', message_payload);
          settled = true;
          cleanup();
          resolve(message_payload);
        }

        // Filter for the exact job ID we are waiting for
        //if (message.jobId === target_job_id) {
           // Close socket and clear timeout

          /*if (message.status === 'failed') {
            reject(new Error(message.error || `Job ${targetJobId} failed`));
          } else {
            resolve(message_payload);
          }*/
        //}

      } catch (err) {
        // Ignore messages that aren't valid JSON or don't match structure
      }
    };

    ws.onerror = (error) => {
      if(settled) return;
      settled = true;
      cleanup();
      reject(new Error('WebSocket connection encountered an error'));
    };

    ws.onclose = () => {
      if(settled) return;
      settled = true;
      clearTimeout(timeoutId);
      reject(new Error(`WebSocket closed before job ${target_job_id} completed`));
    };
  });
}






export class ManifoldCloudAPI {
  private baseURL: string;
  private token: string | null = null;           // JWT token (set after login)
  private apiKey?: string;                       // Optional static API key fallback
  private jobsWebSocketURL: string;
  private defaultTimeout = 300_000;               // 300 seconds


  constructor(baseURL: string, apiKey?: string, jobsWebSocketURL: string = process.env.MANIFOLD_JOBS_WS_URL ?? DEFAULT_JOBS_WEBSOCKET_URL) {
    if (!baseURL) throw new Error('baseURL is required');
    this.baseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    this.apiKey = apiKey;
    this.jobsWebSocketURL = jobsWebSocketURL;
    new URL(this.baseURL); // validates URL format
  }

  /** Get current Authorization header value */
  private getAuthHeader(): Record<string, string> {
    if (this.token) {
      return { Authorization: `Bearer ${this.token}` };
    }
    if (this.apiKey) {
      return { Authorization: `Bearer ${this.apiKey}` };
    }
    throw new Error('Not authenticated: call login() or provide apiKey in constructor');
  }

  private getDefaultHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'manifold-cloud-api-client',
    };
  }

  /** Login with username + password → stores JWT */
  async login(username: string, password: string): Promise<LoginResponse> {




    const loginPayload = {
      username: username.trim(),
      password,
    };

    const result = await this.rawRequest<LoginResponse>(
      'POST',
      '/authentication/login',          // adjust path if your API uses /login, /auth/token, etc.
      loginPayload,
      { noAuth: true }         // bypass auth header for login request
    );

    this.token = result.token;
    return result;


  }

  /** Logout - clears stored token */
  logout(): void {
    this.token = null;
  }

  /** Check if currently authenticated with JWT */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /** Raw HTTP request - internal method */
  private async rawRequest<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    opts: RequestOptions & { noAuth?: boolean } = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseURL}${endpoint}`);
      const isHttps = url.protocol === 'https:';

      const headers: Record<string, string> = {
        ...this.getDefaultHeaders(),
        ...(opts.noAuth ? {} : this.getAuthHeader()),
        ...opts.headers,
      };

      let bodyData: string | undefined;
      if (data !== undefined) {
        const payload = JSON.stringify(data);
        headers['Content-Length'] = String(Buffer.byteLength(payload));
        bodyData = payload;
      }

      const reqOptions: HttpRequestOptions | HttpsRequestOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method,
        headers,
        timeout: opts.timeout ?? this.defaultTimeout,
      };

      const client = isHttps ? httpsRequest : httpRequest;

      const req = client(reqOptions, (res) => {
        let raw = '';

        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          const status = res.statusCode || 0;

          // Success
          if (status >= 200 && status < 300) {
            if (!raw) return resolve({} as T);
            try {
              resolve(JSON.parse(raw));
            } catch {
              resolve(raw as any);
            }
            return;
          }

          // Error response
          let errorMsg = raw;
          try {
            const parsed = JSON.parse(raw);
            errorMsg = parsed.message || parsed.error || raw;
          } catch {}
          reject(new Error(`HTTP ${status}: ${errorMsg}`));
        });
      });

      req.on('error', (err) => reject(new Error(`Request failed: ${err.message}`)));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });

      if (bodyData) req.write(bodyData);
      req.end();
    });
  }

  // ==================== Public HTTP methods ====================

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.rawRequest<T>('GET', endpoint, undefined, options);
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.rawRequest<T>('POST', endpoint, data, options);
  }
  async post_and_wait<T>(endpoint: string, data?: any, timeoutMs: number = 30000) {
    const result = await this.post(endpoint,data,{timeout: timeoutMs});
    let wait_result = null;
    try {
      wait_result = await waitForJobMessage(result,this.jobsWebSocketURL,timeoutMs);
    } catch (error) {
      console.error('Failed to get job result:', error);
    }
    return wait_result;
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.rawRequest<T>('PATCH', endpoint, data, options);
  }
  async patch_and_wait<T>(endpoint: string, data?: any, timeoutMs: number = 30000) {
    const result = await this.patch(endpoint,data,{timeout: timeoutMs});
    let wait_result = null;
    try {
      wait_result = await waitForJobMessage(result,this.jobsWebSocketURL,timeoutMs);
    } catch (error) {
      console.error('Failed to get job result:', error);
    }
    return wait_result;
  }

  async delete<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.rawRequest<T>('DELETE', endpoint, data, options);
  }
  async delete_and_wait<T>(endpoint: string, data?: any, timeoutMs: number = 30000) {
    const result = await this.delete(endpoint,data,{timeout: timeoutMs});
    let wait_result = null;
    try {
      wait_result = await waitForJobMessage(result,this.jobsWebSocketURL,timeoutMs);
    } catch (error) {
      console.error('Failed to get job result:', error);
    }
    return wait_result;
  }

  // Optional: expose token for debugging / refresh logic
  getToken(): string | null {
    return this.token;
  }

  // Optional: manually set token (e.g. from refresh or cache)
  setToken(token: string): void {
    this.token = token;
  }
}

export default ManifoldCloudAPI;
