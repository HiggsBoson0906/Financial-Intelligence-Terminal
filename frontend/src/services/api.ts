import type { QueryRequest, QueryResponse } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  status: number;
  payload: any;
  
  constructor(status: number, payload: any) {
    super(`API Error: ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export const queryApi = {
  async runQuery(request: QueryRequest): Promise<QueryResponse> {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/v1/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
    } catch (e: any) {
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
        throw new Error('Network error: backend unreachable');
      }
      throw e;
    }

    if (!response.ok) {
      let payload;
      try {
        payload = await response.json();
      } catch (e) {
        payload = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      let errorMsg = `HTTP ${response.status}: `;
      if (response.status === 500) errorMsg += 'backend returned an internal error';
      else if (response.status === 422) errorMsg += 'invalid request';
      else errorMsg += response.statusText;
      
      throw new ApiError(response.status, { ...payload, message: payload.message || errorMsg });
    }

    try {
      return await response.json() as QueryResponse;
    } catch (e) {
      throw new Error('Invalid JSON: malformed backend response');
    }
  }
};
