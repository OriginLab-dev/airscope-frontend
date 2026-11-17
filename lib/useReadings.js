'use client';

import { useCallback, useEffect, useState } from 'react';
import { CITIES, getReadings } from './api';

export function useReadings(city) {
  const [state, setState] = useState({ readings: {}, failures: [], loading: true });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt(value => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    const cities = city ? [city] : CITIES;
    let pending = false;
    async function refresh() {
      if (pending || controller.signal.aborted) return;
      pending = true;
      setState(previous => ({ ...previous, loading: true }));
      const failures = [];
      await Promise.all(cities.map(async name => {
        try {
          const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(18000)]);
          const readings = await getReadings(name, 24, signal);
          if (!controller.signal.aborted) {
            setState(previous => ({ ...previous, readings: { ...previous.readings, [name]: readings } }));
          }
        } catch {
          failures.push(name);
        }
      }));
      pending = false;
      if (!controller.signal.aborted) setState(previous => ({ ...previous, failures, loading: false }));
    }
    function refreshWhenVisible() {
      if (document.visibilityState === 'visible') void refresh();
    }
    void refresh();
    const timer = window.setInterval(refreshWhenVisible, 60000);
    window.addEventListener('focus', refreshWhenVisible);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshWhenVisible);
    };
  }, [city, attempt]);

  return {
    data: city ? state.readings[city] ?? [] : Object.values(state.readings).flat(),
    loading: state.loading,
    failures: state.failures,
    retry,
  };
}
