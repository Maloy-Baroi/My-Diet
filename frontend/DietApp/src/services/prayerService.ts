import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrayerTimes, PrayerResponse, PrayerApiResponse } from '../types';

// Backend prayer times interfaces
interface BackendPrayerTimes {
  id?: number;
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  created_at?: string;
  updated_at?: string;
}

interface BackendPrayerResponse {
  id?: number;
  date: string;
  prayer_times: BackendPrayerTimes;
  source: 'cache' | 'api';
  message?: string;
}

class PrayerService {
  private backendUrl = process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8000';
  private cacheKeyPrefix = 'prayer_times_';
  private lastFetchKey = 'last_prayer_fetch_date';
  
  /**
   * Convert backend prayer times to frontend format
   */
  private convertBackendToFrontend(backendData: BackendPrayerTimes): PrayerResponse {
    return {
      timings: {
        Fajr: backendData.fajr,
        Sunrise: backendData.sunrise,
        Dhuhr: backendData.dhuhr,
        Asr: backendData.asr,
        Sunset: backendData.maghrib, // Using maghrib as sunset
        Maghrib: backendData.maghrib,
        Isha: backendData.isha,
      },
      date: {
        readable: new Date(backendData.date).toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        }),
        timestamp: new Date(backendData.date).getTime().toString(),
        hijri: {
          date: '',
          format: '',
          day: '',
          weekday: { en: '', ar: '' },
          month: { number: 0, en: '', ar: '' },
          year: '',
          designation: { abbreviated: 'AH', expanded: 'Anno Hegirae' },
          holidays: [],
        },
        gregorian: {
          date: backendData.date,
          format: 'YYYY-MM-DD',
          day: new Date(backendData.date).getDate().toString(),
          weekday: { en: new Date(backendData.date).toLocaleDateString('en-US', { weekday: 'long' }) },
          month: { 
            number: new Date(backendData.date).getMonth() + 1,
            en: new Date(backendData.date).toLocaleDateString('en-US', { month: 'long' })
          },
          year: new Date(backendData.date).getFullYear().toString(),
          designation: { abbreviated: 'AD', expanded: 'Anno Domini' },
        },
      },
      meta: {
        latitude: 23.8103,
        longitude: 90.4125,
        timezone: 'Asia/Dhaka',
        method: {
          id: 1,
          name: 'University of Islamic Sciences, Karachi',
          params: { Fajr: 18, Isha: 18 },
        },
        latitudeAdjustmentMethod: 'ANGLE_BASED',
        midnightMode: 'STANDARD',
        school: 'STANDARD',
        offset: {
          Imsak: 0, Fajr: 0, Sunrise: 0, Dhuhr: 0,
          Asr: 0, Maghrib: 0, Sunset: 0, Isha: 0, Midnight: 0,
        },
      },
    };
  }

  /**
   * Get cached prayer times from AsyncStorage
   */
  private async getCachedPrayerTimes(date: string): Promise<PrayerResponse | null> {
    try {
      const cacheKey = `${this.cacheKeyPrefix}${date}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (cachedData) {
        const parsedData: BackendPrayerTimes = JSON.parse(cachedData);
        console.log(`📱 Using cached prayer times for ${date}`);
        return this.convertBackendToFrontend(parsedData);
      }
      
      return null;
    } catch (error) {
      console.error('Error reading cached prayer times:', error);
      return null;
    }
  }

  /**
   * Cache prayer times to AsyncStorage
   */
  private async cachePrayerTimes(date: string, data: BackendPrayerTimes): Promise<void> {
    try {
      const cacheKey = `${this.cacheKeyPrefix}${date}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      await AsyncStorage.setItem(this.lastFetchKey, date);
      console.log(`💾 Cached prayer times for ${date}`);
    } catch (error) {
      console.error('Error caching prayer times:', error);
    }
  }

  /**
   * Check if we need to fetch new data (once per day)
   */
  private async shouldFetchNewData(date: string): Promise<boolean> {
    try {
      const lastFetchDate = await AsyncStorage.getItem(this.lastFetchKey);
      
      if (!lastFetchDate) {
        return true; // First time, need to fetch
      }
      
      return lastFetchDate !== date; // Fetch if date is different
    } catch (error) {
      console.error('Error checking last fetch date:', error);
      return true; // If error, fetch anyway
    }
  }

  /**
   * Fallback to external Aladhan API when backend is unavailable
   */
  private async fetchFromExternalAPI(date: Date): Promise<PrayerResponse> {
    console.log(`🌐 Falling back to external Aladhan API for ${date.toISOString().split('T')[0]}`);
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    const response = await axios.get(
      `https://api.aladhan.com/v1/timings/${day}-${month}-${year}`,
      {
        params: {
          latitude: 23.8103, // Dhaka latitude
          longitude: 90.4125, // Dhaka longitude
          method: 1, // University of Islamic Sciences, Karachi
          timezone: 'Asia/Dhaka',
        },
      }
    );

    if (response.data.code !== 200) {
      throw new Error(`External API Error: ${response.data.status}`);
    }

    // Convert external API response to our format and cache it
    const externalData = response.data.data;
    const backendFormat: BackendPrayerTimes = {
      date: date.toISOString().split('T')[0],
      fajr: externalData.timings.Fajr,
      sunrise: externalData.timings.Sunrise,
      dhuhr: externalData.timings.Dhuhr,
      asr: externalData.timings.Asr,
      maghrib: externalData.timings.Maghrib,
      isha: externalData.timings.Isha,
    };

    // Cache the data for future use
    await this.cachePrayerTimes(date.toISOString().split('T')[0], backendFormat);
    
    return externalData;
  }

  /**
   * Check if backend is available
   */
  private async isBackendAvailable(): Promise<boolean> {
    try {
      // Try a simple health check or any existing endpoint
      await axios.get(`${this.backendUrl}/api/`, { timeout: 5000 });
      return true;
    } catch (error) {
      console.log(`🔴 Backend not available: ${error.message}`);
      return false;
    }
  }

  /**
   * Get prayer times for Bangladesh (Dhaka) for today
   */
  async getPrayerTimesForBangladesh(): Promise<PrayerResponse> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return this.getPrayerTimesForDate(new Date());
  }

  /**
   * Get prayer times for a specific date in Bangladesh
   */
  async getPrayerTimesForDate(date: Date): Promise<PrayerResponse> {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
      // First, check if we have cached data for this date
      const cachedData = await this.getCachedPrayerTimes(dateString);
      const shouldFetch = await this.shouldFetchNewData(dateString);
      
      // If we have cached data and don't need to fetch new data, return cached
      if (cachedData && !shouldFetch) {
        return cachedData;
      }
      
      // Check if backend is available
      const backendAvailable = await this.isBackendAvailable();
      
      if (backendAvailable) {
        // Try backend API first
        console.log(`🌅 Attempting to fetch from backend API for ${dateString}...`);
        
        try {
          // If it's today, try the get-or-fetch endpoint first
          const isToday = dateString === new Date().toISOString().split('T')[0];
          
          if (isToday) {
            try {
              const response = await axios.get<BackendPrayerResponse>(
                `${this.backendUrl}/prayer-times/get-or-fetch/`,
                { timeout: 10000 }
              );
              
              if (response.data && response.data.prayer_times) {
                await this.cachePrayerTimes(dateString, response.data.prayer_times);
                return this.convertBackendToFrontend(response.data.prayer_times);
              }
            } catch (getOrFetchError) {
              console.log('🔄 Get-or-fetch failed, trying other backend endpoints...');
              
              // Try manual fetch + get
              try {
                await axios.post(`${this.backendUrl}/prayer-times/fetch/`, {}, { timeout: 10000 });
                const response = await axios.get<BackendPrayerTimes[]>(
                  `${this.backendUrl}/prayer-times/`,
                  { timeout: 10000 }
                );
                
                const todayData = response.data.find(item => item.date === dateString);
                if (todayData) {
                  await this.cachePrayerTimes(dateString, todayData);
                  return this.convertBackendToFrontend(todayData);
                }
              } catch (manualFetchError) {
                console.log('🔄 Manual fetch failed, will try external API');
              }
            }
          }
          
          // Try date-specific endpoint
          try {
            const response = await axios.get<BackendPrayerTimes>(
              `${this.backendUrl}/prayer-times/${dateString}/`,
              { timeout: 10000 }
            );
            
            if (response.data) {
              await this.cachePrayerTimes(dateString, response.data);
              return this.convertBackendToFrontend(response.data);
            }
          } catch (dateSpecificError) {
            console.log(`🔄 Date-specific endpoint failed for ${dateString}`);
          }
          
        } catch (backendError) {
          console.log('🔄 Backend API failed, falling back to external API');
        }
      } else {
        console.log('🔄 Backend not available, using external API');
      }
      
      // If backend failed or is unavailable, use external API
      try {
        const externalData = await this.fetchFromExternalAPI(date);
        return externalData;
      } catch (externalError) {
        console.error('🔴 External API also failed:', externalError);
        
        // Final fallback: use cached data if available
        if (cachedData) {
          console.log('� Using cached data as final fallback');
          return cachedData;
        }
        
        throw new Error('Unable to fetch prayer times from any source. Please check your internet connection.');
      }
      
    } catch (error) {
      console.error('Error in getPrayerTimesForDate:', error);
      
      // Try to return cached data as absolute last resort
      const cachedData = await this.getCachedPrayerTimes(dateString);
      if (cachedData) {
        console.log('📱 Using cached data as absolute last resort');
        return cachedData;
      }
      
      throw new Error(error.message || 'Unable to fetch prayer times. Please try again later.');
    }
  }

  /**
   * Clear cached prayer times (useful for testing or manual refresh)
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const prayerKeys = keys.filter(key => key.startsWith(this.cacheKeyPrefix));
      await AsyncStorage.multiRemove([...prayerKeys, this.lastFetchKey]);
      console.log('🗑️ Cleared all cached prayer times');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get cache status and statistics
   */
  async getCacheInfo(): Promise<{
    lastFetchDate: string | null;
    cachedDates: string[];
    totalCachedItems: number;
  }> {
    try {
      const lastFetchDate = await AsyncStorage.getItem(this.lastFetchKey);
      const keys = await AsyncStorage.getAllKeys();
      const prayerKeys = keys.filter(key => key.startsWith(this.cacheKeyPrefix));
      const cachedDates = prayerKeys.map(key => key.replace(this.cacheKeyPrefix, ''));
      
      return {
        lastFetchDate,
        cachedDates: cachedDates.sort(),
        totalCachedItems: prayerKeys.length,
      };
    } catch (error) {
      console.error('Error getting cache info:', error);
      return {
        lastFetchDate: null,
        cachedDates: [],
        totalCachedItems: 0,
      };
    }
  }

  /**
   * Format prayer time to 12-hour format
   */
  formatPrayerTime(time: string): string {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      return time; // Return original time if formatting fails
    }
  }

  /**
   * Get next prayer time
   */
  getNextPrayer(prayerTimes: PrayerTimes): { name: string; time: string } | null {
    const now = new Date();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: 'Fajr', time: prayerTimes.Fajr },
      { name: 'Dhuhr', time: prayerTimes.Dhuhr },
      { name: 'Asr', time: prayerTimes.Asr },
      { name: 'Maghrib', time: prayerTimes.Maghrib },
      { name: 'Isha', time: prayerTimes.Isha },
    ];

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTimeInMinutes = hours * 60 + minutes;
      
      if (prayerTimeInMinutes > currentTimeInMinutes) {
        return prayer;
      }
    }

    // If no prayer is remaining today, return Fajr of tomorrow
    return { name: 'Fajr (Tomorrow)', time: prayerTimes.Fajr };
  }

  /**
   * Get time remaining until next prayer
   */
  getTimeUntilNextPrayer(nextPrayerTime: string): string {
    try {
      const now = new Date();
      const [hours, minutes] = nextPrayerTime.split(':').map(Number);
      
      const nextPrayer = new Date();
      nextPrayer.setHours(hours, minutes, 0, 0);
      
      // If the prayer time has passed today, set it for tomorrow
      if (nextPrayer <= now) {
        nextPrayer.setDate(nextPrayer.getDate() + 1);
      }
      
      const timeDiff = nextPrayer.getTime() - now.getTime();
      const hoursRemaining = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hoursRemaining > 0) {
        return `${hoursRemaining}h ${minutesRemaining}m`;
      } else {
        return `${minutesRemaining}m`;
      }
    } catch (error) {
      return 'N/A';
    }
  }
}

export default new PrayerService();
