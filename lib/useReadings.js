'use client';

import { useEffect, useState } from 'react';
import { CITIES, getReadings } from './api';

// Keep an open dashboard up to date after imports complete in the background.
export function useReadings(city) {
  const [state, setState] = useState({ data:null, error:'' });
  useEffect(() => {
    let disposed = false;
    let pending = false;
    const controller = new AbortController();
    setState({ data:null, error:'' });
    async function refresh() {
      if (pending || disposed) return;
      pending = true;
      try {
        // A limit shared by all cities can otherwise omit a slower-reporting city.
        const data = city
          ? await getReadings(city, 24, controller.signal)
          : (await Promise.all(CITIES.map(name => getReadings(name, 24, controller.signal)))).flat();
        if (!disposed) setState({ data, error:'' });
      } catch (error) {
        if (!disposed) setState(previous => ({
          ...previous, error:previous.data ? '' : error.message,
        }));
      } finally {
        pending = false;
      }
    }
    function refreshWhenVisible() {
      if (document.visibilityState === 'visible') void refresh();
    }
    void refresh();
    const timer = window.setInterval(refreshWhenVisible, 60000);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      disposed = true;
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [city]);
  return state;
}
