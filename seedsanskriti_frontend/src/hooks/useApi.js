import { useCallback, useState } from 'react';

export default function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, setError, run };
}
