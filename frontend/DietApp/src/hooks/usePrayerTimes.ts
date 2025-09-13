import { useState, useEffect, useCallback } from 'react';
import prayerService from '../services/prayerService';
import { PrayerResponse, PrayerTimes } from '../types';

export interface UsePrayerTimesReturn {
  prayerData: PrayerResponse | null;
  prayerTimes: PrayerTimes | null;
  loading: boolean;
  error: string | null;
  nextPrayer: { name: string; time: string } | null;
  timeUntilNext: string;
  refreshPrayerTimes: () => Promise<void>;
  getPrayerTimesForDate: (date: Date) => Promise<void>;
  clearCache: () => Promise<void>;
  cacheInfo: {
    lastFetchDate: string | null;
    cachedDates: string[];
    totalCachedItems: number;
  } | null;
  refreshCacheInfo: () => Promise<void>;
}

export const usePrayerTimes = (): UsePrayerTimesReturn => {
  const [prayerData, setPrayerData] = useState<PrayerResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');
  const [cacheInfo, setCacheInfo] = useState<{
    lastFetchDate: string | null;
    cachedDates: string[];
    totalCachedItems: number;
  } | null>(null);

  const refreshCacheInfo = useCallback(async () => {
    try {
      const info = await prayerService.getCacheInfo();
      setCacheInfo(info);
    } catch (err) {
      console.error('Error refreshing cache info:', err);
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await prayerService.clearCache();
      setPrayerData(null);
      setNextPrayer(null);
      setTimeUntilNext('');
      await refreshCacheInfo();
      // Re-fetch current data
      await fetchPrayerTimes();
    } catch (err) {
      console.error('Error clearing cache:', err);
    }
  }, []);

  const fetchPrayerTimes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await prayerService.getPrayerTimesForBangladesh();
      setPrayerData(data);
      
      // Calculate next prayer
      const next = prayerService.getNextPrayer(data.timings);
      setNextPrayer(next);
      
      // Calculate time until next prayer
      if (next) {
        const timeUntil = prayerService.getTimeUntilNextPrayer(next.time);
        setTimeUntilNext(timeUntil);
      }
      
      // Update cache info
      await refreshCacheInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prayer times');
      console.error('Prayer times fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshCacheInfo]);

  const getPrayerTimesForDate = useCallback(async (date: Date) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await prayerService.getPrayerTimesForDate(date);
      setPrayerData(data);
      
      // For past/future dates, don't calculate next prayer as it's not relevant
      setNextPrayer(null);
      setTimeUntilNext('');
      
      // Update cache info
      await refreshCacheInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prayer times for selected date');
      console.error('Prayer times fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshCacheInfo]);

  const refreshPrayerTimes = useCallback(async () => {
    await fetchPrayerTimes();
  }, [fetchPrayerTimes]);

  // Update time until next prayer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (nextPrayer) {
        const timeUntil = prayerService.getTimeUntilNextPrayer(nextPrayer.time);
        setTimeUntilNext(timeUntil);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [nextPrayer]);

  // Initial fetch and cache info
  useEffect(() => {
    fetchPrayerTimes();
    refreshCacheInfo();
  }, [fetchPrayerTimes, refreshCacheInfo]);

  return {
    prayerData,
    prayerTimes: prayerData?.timings || null,
    loading,
    error,
    nextPrayer,
    timeUntilNext,
    refreshPrayerTimes,
    getPrayerTimesForDate,
    clearCache,
    cacheInfo,
    refreshCacheInfo,
  };
};
