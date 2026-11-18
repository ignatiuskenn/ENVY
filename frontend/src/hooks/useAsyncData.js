import { useEffect, useState } from 'react';

export function useAsyncData(fetcher, deps = []) {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: '',
    status: null,
  });

  useEffect(() => {
    let cancelled = false;

    Promise.resolve()
      .then(() => {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: true, error: '', status: null }));
        }
        return fetcher();
      })
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false, error: '', status: 200 });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err?.message || 'Failed to load data.',
            status: err?.status || null,
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return {
    ...state,
    retry: () => setReloadKey((k) => k + 1),
  };
}
