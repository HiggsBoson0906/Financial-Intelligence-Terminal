import { useState, useCallback } from 'react';
import type { QueryRequest, QueryResponse } from '../types';
import { queryApi, ApiError } from '../services/api';

export type QueryStatus = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'ERROR';

export function useAnalysisQuery() {
  const [data, setData] = useState<QueryResponse | null>(null);
  const [status, setStatus] = useState<QueryStatus>('IDLE');
  const [error, setError] = useState<string | null>(null);

  const runQuery = useCallback(async (queryText: string) => {
    setStatus('RUNNING');
    setError(null);
    setData(null);
    
    const request: QueryRequest = {
      query: queryText,
      include_risk_metrics: true,
      conversation_id: null,
      parent_run_id: null,
    };

    try {
      const response = await queryApi.runQuery(request);
      setData(response);
      setStatus('COMPLETED');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.payload?.message || err.message || 'API Error occurred');
      } else {
        setError(err.message || 'An unknown error occurred');
      }
      setStatus('ERROR');
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setStatus('IDLE');
    setError(null);
  }, []);

  return {
    data,
    status,
    error,
    runQuery,
    reset
  };
}
