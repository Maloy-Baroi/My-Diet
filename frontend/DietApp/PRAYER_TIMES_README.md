# Prayer Times Feature

## Overview
The Prayer Times feature provides accurate Islamic prayer times for Bangladesh using the free Aladhan API. It displays daily prayer schedules, highlights the next upcoming prayer, and allows users to view prayer times for different dates.

## Features Implemented

### ✅ Core Functionality
- **Real-time Prayer Times**: Fetches accurate prayer times for Bangladesh (Dhaka) using Islamic calculation methods
- **Next Prayer Indicator**: Shows which prayer is coming next and time remaining
- **Date Selection**: Users can view prayer times for any date (past or future)
- **Multiple Cities**: Support for different cities in Bangladesh
- **Hijri Calendar**: Displays both Gregorian and Islamic (Hijri) dates
- **Auto-refresh**: Prayer times update automatically
- **Error Handling**: Graceful error handling with retry options
- **Loading States**: Proper loading indicators during API calls
- **Pull-to-refresh**: Users can refresh prayer times by pulling down

### 🎨 User Interface
- **Clean Design**: Modern, card-based layout with proper spacing and typography
- **Visual Hierarchy**: Clear distinction between different prayer times and next prayer
- **Accessibility**: Proper color contrast and readable fonts
- **Responsive Layout**: Works well on different screen sizes
- **Icons**: Meaningful icons for different prayers and times of day
- **Status Indicators**: Visual feedback for active/next prayers

## API Integration

### Aladhan API
- **Provider**: [Al Adhan API](https://aladhan.com/prayer-times-api)
- **Free to Use**: No API key required
- **Calculation Method**: University of Islamic Sciences, Karachi (Method ID: 1)
- **Location**: Dhaka, Bangladesh (23.8103°N, 90.4125°E)
- **Timezone**: Asia/Dhaka

### Endpoints Used
1. **Daily Timings**: `GET /v1/timings/{date}`
2. **City-based Timings**: `GET /v1/timingsByCity/{date}`

## File Structure

```
src/
├── services/
│   └── prayerService.ts          # API service for prayer times
├── hooks/
│   └── usePrayerTimes.ts         # React hook for managing prayer state
├── screens/
│   └── prayer/
│       └── PrayerTimeScreen.tsx  # Main prayer times screen
└── types/
    └── index.ts                  # TypeScript interfaces for prayer data
```

## Technical Implementation

### PrayerService (`src/services/prayerService.ts`)
```typescript
class PrayerService {
  // Get prayer times for Bangladesh (Dhaka)
  async getPrayerTimesForBangladesh(): Promise<PrayerResponse>
  
  // Get prayer times for specific date
  async getPrayerTimesForDate(date: Date): Promise<PrayerResponse>
  
  // Get prayer times for different cities
  async getPrayerTimesForCity(city: string): Promise<PrayerResponse>
  
  // Format time to 12-hour format
  formatPrayerTime(time: string): string
  
  // Calculate next prayer
  getNextPrayer(prayerTimes: PrayerTimes): { name: string; time: string }
  
  // Calculate time remaining until next prayer
  getTimeUntilNextPrayer(nextPrayerTime: string): string
}
```

### usePrayerTimes Hook (`src/hooks/usePrayerTimes.ts`)
```typescript
export const usePrayerTimes = (): UsePrayerTimesReturn => {
  // State management for prayer data
  // Auto-refresh functionality
  // Error handling
  // Loading states
}
```

### Prayer Times Screen (`src/screens/prayer/PrayerTimeScreen.tsx`)
- Header with date and location information
- Next prayer countdown (for current day only)
- Complete prayer times list with visual indicators
- Date picker for viewing historical/future times
- Refresh and navigation controls

## Prayer Times Included

1. **Fajr** - Dawn prayer (before sunrise)
2. **Sunrise** - Sunrise time (not a prayer, but important for timing)
3. **Dhuhr** - Noon prayer
4. **Asr** - Afternoon prayer
5. **Maghrib** - Evening prayer (just after sunset)
6. **Isha** - Night prayer

## Calculation Method Details

**University of Islamic Sciences, Karachi**
- Fajr Angle: 18°
- Isha Angle: 18°
- Widely used in Bangladesh and South Asian countries
- Considered accurate for the region's geographical location

## Usage Example

```typescript
import { usePrayerTimes } from '../hooks/usePrayerTimes';

function PrayerComponent() {
  const { 
    prayerTimes, 
    nextPrayer, 
    timeUntilNext, 
    loading, 
    error,
    refreshPrayerTimes 
  } = usePrayerTimes();

  if (loading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <View>
      <Text>Next: {nextPrayer?.name}</Text>
      <Text>In: {timeUntilNext}</Text>
      {/* Display prayer times */}
    </View>
  );
}
```

## Error Handling

The implementation includes comprehensive error handling for:
- Network connectivity issues
- API rate limiting
- Invalid responses
- Date formatting errors
- Timezone conversion issues

## Future Enhancements

### 🔮 Planned Features
- **Notifications**: Prayer time reminders with customizable alerts
- **Qibla Direction**: Compass showing direction to Mecca
- **Audio Adhan**: Play call to prayer at prayer times
- **Prayer Tracker**: Track completed prayers
- **Offline Support**: Cache prayer times for offline viewing
- **Widget Support**: Home screen widget with next prayer time
- **Location Services**: Auto-detect user's location for accurate times
- **Multiple Calculation Methods**: Support for different Islamic schools

### 🏢 Advanced Features
- **Multiple Cities**: Support for all major Bangladesh cities
- **Prayer Variations**: Different madhabs (schools of thought) support
- **Custom Locations**: Manual latitude/longitude input
- **Prayer History**: View prayer completion statistics
- **Ramadan Schedule**: Special schedules for Ramadan (Sehri/Iftar)
- **Islamic Calendar**: Full Islamic calendar integration

## Dependencies

```json
{
  "axios": "^1.11.0",
  "@react-native-community/datetimepicker": "8.4.1",
  "moment": "^2.30.1"
}
```

## Testing

Run the prayer service test:
```bash
node test-prayer-service.js
```

## API Response Example

```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "timings": {
      "Fajr": "04:45",
      "Sunrise": "06:07",
      "Dhuhr": "12:12",
      "Asr": "15:36",
      "Sunset": "18:17",
      "Maghrib": "18:17",
      "Isha": "19:39"
    },
    "date": {
      "readable": "13 Sep 2025",
      "hijri": {
        "date": "19-03-1447",
        "month": {
          "en": "Rabī' al-awwal",
          "ar": "رَبِيع ٱلْأَوَّل"
        }
      }
    }
  }
}
```

## License & Attribution

- **Aladhan API**: Free to use, provided by [Al Adhan](https://aladhan.com/)
- **Calculation Methods**: Based on established Islamic astronomical calculations
- **Icons**: Expo vector icons
- **UI Components**: React Native Elements

## Support

For issues related to:
- **Prayer Times Accuracy**: Check with local Islamic authorities
- **API Availability**: Monitor [Aladhan API status](https://aladhan.com/prayer-times-api)
- **App Issues**: Check app logs and network connectivity
