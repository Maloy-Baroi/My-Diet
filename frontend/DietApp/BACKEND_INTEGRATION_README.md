# Prayer Times Backend Integration

## Overview
The Prayer Times feature has been updated to integrate with your local backend API and implement smart caching for optimal performance.

## Key Features

### 🔄 Smart API Integration
- **Primary Endpoint**: `GET /prayer-times/get-or-fetch/` - Smart endpoint that returns cached data or fetches fresh data as needed
- **Fallback Endpoints**: 
  - `POST /prayer-times/fetch/` - Manual fetch trigger
  - `GET /prayer-times/` - Get all cached prayer times
  - `GET /prayer-times/{date}/` - Get prayer times for specific date

### 💾 Local Caching System
- **Once-per-day fetch**: Data is fetched only once daily and cached locally
- **Offline support**: Cached data is available even without internet connection
- **Smart cache management**: Automatic cache validation and fallback mechanisms

### 📱 User Features
- **Cache status display**: Shows last fetch date and number of cached days
- **Manual refresh**: Force refresh button for immediate updates
- **Cache clearing**: Clear all cached data and fetch fresh data
- **Error handling**: Graceful fallback to cached data when API is unavailable

## API Endpoints Usage

### 1. Get Today's Prayer Times
```javascript
// The service automatically tries these endpoints in order:
// 1. GET /prayer-times/get-or-fetch/ (smart endpoint)
// 2. POST /prayer-times/fetch/ + GET /prayer-times/ (fallback)
// 3. Uses cached data if all API calls fail

const prayerTimes = await prayerService.getPrayerTimesForBangladesh();
```

### 2. Get Prayer Times for Specific Date
```javascript
// Uses: GET /prayer-times/{date}/
const specificDate = new Date('2025-09-15');
const prayerTimes = await prayerService.getPrayerTimesForDate(specificDate);
```

### 3. Cache Management
```javascript
// Clear all cached data
await prayerService.clearCache();

// Get cache information
const cacheInfo = await prayerService.getCacheInfo();
console.log(`Last fetch: ${cacheInfo.lastFetchDate}`);
console.log(`Cached days: ${cacheInfo.totalCachedItems}`);
```

## Backend Data Format Expected

```typescript
interface BackendPrayerTimes {
  id?: number;
  date: string;        // "2025-09-13" (YYYY-MM-DD)
  fajr: string;        // "04:28"
  sunrise: string;     // "05:44"
  dhuhr: string;       // "11:54"
  asr: string;         // "15:23"
  maghrib: string;     // "18:04"
  isha: string;        // "19:20"
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
```

## Caching Strategy

### Cache Keys
- Prayer times: `prayer_times_{date}` (e.g., `prayer_times_2025-09-13`)
- Last fetch: `last_prayer_fetch_date`

### Cache Logic
1. **First load**: Always fetches from backend API
2. **Same day**: Uses cached data if available
3. **New day**: Automatically fetches fresh data
4. **API failure**: Falls back to cached data with appropriate error handling
5. **Manual refresh**: Forces fresh API call regardless of cache status

### Cache Persistence
- Uses React Native AsyncStorage for persistent local storage
- Data survives app restarts and device reboots
- Automatic cleanup and management

## Error Handling

### Network Errors
- Primary API fails → Try fallback endpoints
- All APIs fail → Use cached data
- No cached data → Show user-friendly error message

### Data Validation
- Validates API response format
- Ensures time format consistency
- Handles missing or malformed data gracefully

## UI Components

### Cache Status Display
```typescript
{cacheInfo && (
  <View style={styles.cacheInfoContainer}>
    <Text>📊 Cache Status</Text>
    <Text>Last fetch: {cacheInfo.lastFetchDate || 'Never'}</Text>
    <Text>Cached days: {cacheInfo.totalCachedItems}</Text>
  </View>
)}
```

### Action Buttons
- **Refresh**: Fetches fresh data from backend
- **Clear Cache**: Removes all cached data and forces fresh fetch

## Performance Benefits

1. **Reduced API calls**: Only one request per day instead of every app launch
2. **Faster loading**: Cached data loads instantly
3. **Offline functionality**: Works without internet connection
4. **Bandwidth savings**: Minimal data usage after initial fetch
5. **Better UX**: No loading delays for cached data

## Testing the Integration

### Test Commands
```bash
# Test your backend endpoints
curl -X GET http://localhost:8000/prayer-times/
curl -X GET http://localhost:8000/prayer-times/2025-09-13/
curl -X POST http://localhost:8000/prayer-times/fetch/
curl -X GET http://localhost:8000/prayer-times/get-or-fetch/
```

### App Testing
1. Launch app → Should fetch data from backend
2. Close and reopen app → Should use cached data
3. Clear cache → Should fetch fresh data
4. Test with backend offline → Should use cached data
5. Test manual refresh → Should attempt API call

## Configuration

### Environment Variables
```javascript
EXPO_PUBLIC_BASE_URL=http://localhost:8000
```

### Service Configuration
The service automatically detects your backend URL and falls back to localhost:8000 if not configured.

## Monitoring and Debugging

### Console Logs
- `📱 Using cached prayer times for {date}`
- `🌅 Fetching today's prayer times from backend...`
- `💾 Cached prayer times for {date}`
- `🔄 All API calls failed, using cached data as fallback`
- `⚡ Using cached data as last resort`

### Cache Information
Access real-time cache status through the UI or programmatically:
```javascript
const { cacheInfo } = usePrayerTimes();
console.log('Cache info:', cacheInfo);
```

This implementation provides a robust, efficient, and user-friendly prayer times system that works seamlessly with your backend while providing excellent offline capabilities.
