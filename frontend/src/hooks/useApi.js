import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// Simple cache implementation
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const {
    method = 'GET',
    body = null,
    headers = {},
    cache: useCache = true,
    cacheKey = url,
    dependencies = []
  } = options;

  const fetchData = useCallback(async () => {
    // Check cache first
    if (useCache && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        setData(cached.data);
        return;
      } else {
        cache.delete(cacheKey);
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const config = {
        method,
        url,
        data: body,
        headers,
        signal: abortControllerRef.current.signal
      };

      const response = await axios(config);
      
      // Cache the response
      if (useCache) {
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }

      setData(response.data);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [url, method, body, headers, useCache, cacheKey, ...dependencies]);

  useEffect(() => {
    fetchData();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    if (useCache) {
      cache.delete(cacheKey);
    }
    fetchData();
  }, [fetchData, useCache, cacheKey]);

  return { data, loading, error, refetch };
};

export default useApi;
