import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';
import prayerService from '../../services/prayerService';

const PrayerTimeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { 
    prayerData, 
    prayerTimes, 
    loading, 
    error, 
    nextPrayer, 
    timeUntilNext, 
    refreshPrayerTimes,
    getPrayerTimesForDate,
    clearCache,
    cacheInfo,
    refreshCacheInfo
  } = usePrayerTimes();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      getPrayerTimesForDate(selectedDate);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleRefresh = () => {
    if (isToday(selectedDate)) {
      refreshPrayerTimes();
    } else {
      getPrayerTimesForDate(selectedDate);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached prayer times and fetch fresh data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => clearCache()
        }
      ]
    );
  };

  if (loading && !prayerTimes) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading prayer times...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Card containerStyle={styles.errorCard}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#FF5252" />
            <Text style={styles.errorTitle}>Unable to Load Prayer Times</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
              <Text style={styles.goBackText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
      }
    >
      {/* Header Card */}
      <Card containerStyle={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="moon-outline" size={40} color="#007AFF" />
            </View>
          </View>
          <Text style={styles.title}>Prayer Times</Text>
          <Text style={styles.subtitle}>Bangladesh (Dhaka)</Text>
          
          {prayerData && (
            <Text style={styles.dateText}>
              {prayerData.date.readable}
            </Text>
          )}
          
          {prayerData?.date.hijri && (
            <Text style={styles.hijriDate}>
              {prayerData.date.hijri.date} {prayerData.date.hijri.month.en} {prayerData.date.hijri.year} AH
            </Text>
          )}
        </View>
      </Card>

      {/* Date Selector */}
      <Card containerStyle={styles.dateCard}>
        <TouchableOpacity 
          style={styles.dateSelector}
          onPress={() => Alert.alert('Date Picker', 'Date picker temporarily disabled')}
        >
          <Ionicons name="calendar-outline" size={24} color="#007AFF" />
          <Text style={styles.dateSelectorText}>
            {selectedDate.toDateString()}
          </Text>
          <Ionicons name="chevron-down-outline" size={20} color="#666" />
        </TouchableOpacity>
      </Card>

      {/* Next Prayer Card - Only show for today */}
      {isToday(selectedDate) && nextPrayer && (
        <Card containerStyle={styles.nextPrayerCard}>
          <View style={styles.nextPrayerContent}>
            <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
            <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
            <Text style={styles.nextPrayerTime}>
              {prayerService.formatPrayerTime(nextPrayer.time)}
            </Text>
            {timeUntilNext && (
              <Text style={styles.timeRemaining}>in {timeUntilNext}</Text>
            )}
          </View>
        </Card>
      )}

      {/* Prayer Times Card */}
      {prayerTimes && (
        <Card containerStyle={styles.prayerTimesCard}>
          <Text style={styles.prayerTimesTitle}>Today's Prayer Times</Text>
          
          <View style={styles.prayerTimesList}>
            <PrayerTimeItem 
              name="Fajr" 
              time={prayerService.formatPrayerTime(prayerTimes.Fajr)}
              icon="moon-outline"
              isNext={nextPrayer?.name === 'Fajr'}
            />
            <PrayerTimeItem 
              name="Sunrise" 
              time={prayerService.formatPrayerTime(prayerTimes.Sunrise)}
              icon="sunny-outline"
              isNext={false}
              isDisabled
            />
            <PrayerTimeItem 
              name="Dhuhr" 
              time={prayerService.formatPrayerTime(prayerTimes.Dhuhr)}
              icon="sunny"
              isNext={nextPrayer?.name === 'Dhuhr'}
            />
            <PrayerTimeItem 
              name="Asr" 
              time={prayerService.formatPrayerTime(prayerTimes.Asr)}
              icon="partly-sunny-outline"
              isNext={nextPrayer?.name === 'Asr'}
            />
            <PrayerTimeItem 
              name="Maghrib" 
              time={prayerService.formatPrayerTime(prayerTimes.Maghrib)}
              icon="moon"
              isNext={nextPrayer?.name === 'Maghrib'}
            />
            <PrayerTimeItem 
              name="Isha" 
              time={prayerService.formatPrayerTime(prayerTimes.Isha)}
              icon="moon"
              isNext={nextPrayer?.name === 'Isha'}
            />
          </View>
        </Card>
      )}

      {/* Info Card */}
      {/* <Card containerStyle={styles.infoCard}>
        <Text style={styles.infoTitle}>Data Source & Cache</Text>
        <Text style={styles.infoText}>
          Hybrid API (Backend + External)
        </Text>
        <Text style={styles.infoSubtext}>
          Prayer times are fetched from your backend when available, with automatic fallback to external Aladhan API. Data is cached locally for offline access.
        </Text>
        
        {cacheInfo && (
          <View style={styles.cacheInfoContainer}>
            <Text style={styles.cacheInfoTitle}>📊 Cache Status</Text>
            <Text style={styles.cacheInfoText}>
              Last fetch: {cacheInfo.lastFetchDate || 'Never'}
            </Text>
            <Text style={styles.cacheInfoText}>
              Cached days: {cacheInfo.totalCachedItems}
            </Text>
          </View>
        )}
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.refreshButton]} 
            onPress={handleRefresh}
            disabled={loading}
          >
            <Ionicons 
              name={loading ? "hourglass-outline" : "refresh-outline"} 
              size={16} 
              color="#007AFF" 
            />
            <Text style={styles.refreshButtonText}>
              {loading ? 'Loading...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.clearCacheButton]} 
            onPress={handleClearCache}
            disabled={loading}
          >
            <Ionicons 
              name="trash-outline" 
              size={16} 
              color="#FF5252" 
            />
            <Text style={styles.clearCacheButtonText}>
              Clear Cache
            </Text>
          </TouchableOpacity>
        </View>
      </Card> */}

      {/* Date Picker Modal */}
      {/* {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date(new Date().getFullYear() + 1, 11, 31)}
          minimumDate={new Date(new Date().getFullYear() - 1, 0, 1)}
        />
      )} */}

      {/* Back Button */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Prayer Time Item Component
interface PrayerTimeItemProps {
  name: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  isNext?: boolean;
  isDisabled?: boolean;
}

const PrayerTimeItem: React.FC<PrayerTimeItemProps> = ({ 
  name, 
  time, 
  icon, 
  isNext = false, 
  isDisabled = false 
}) => {
  return (
    <View style={[
      styles.prayerTimeItem,
      isNext && styles.nextPrayerItem,
      isDisabled && styles.disabledPrayerItem
    ]}>
      <View style={styles.prayerTimeLeft}>
        <View style={[
          styles.prayerIcon,
          isNext && styles.nextPrayerIcon,
          isDisabled && styles.disabledPrayerIcon
        ]}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={isNext ? "#007AFF" : isDisabled ? "#ccc" : "#666"} 
          />
        </View>
        <Text style={[
          styles.prayerName,
          isNext && styles.nextPrayerName,
          isDisabled && styles.disabledPrayerName
        ]}>
          {name}
        </Text>
      </View>
      <Text style={[
        styles.prayerTime,
        isNext && styles.nextPrayerTimeText,
        isDisabled && styles.disabledPrayerTime
      ]}>
        {time}
      </Text>
      {isNext && (
        <View style={styles.nextIndicator}>
          <Text style={styles.nextIndicatorText}>NEXT</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerCard: {
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  hijriDate: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  dateCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dateSelectorText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  nextPrayerCard: {
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  nextPrayerContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  nextPrayerLabel: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  nextPrayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  nextPrayerTime: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timeRemaining: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  prayerTimesCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 16,
  },
  prayerTimesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  prayerTimesList: {
    gap: 12,
  },
  prayerTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  nextPrayerItem: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  disabledPrayerItem: {
    opacity: 0.6,
  },
  prayerTimeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  prayerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nextPrayerIcon: {
    backgroundColor: '#007AFF',
  },
  disabledPrayerIcon: {
    backgroundColor: '#f0f0f0',
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nextPrayerName: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  disabledPrayerName: {
    color: '#999',
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  nextPrayerTimeText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  disabledPrayerTime: {
    color: '#ccc',
  },
  nextIndicator: {
    position: 'absolute',
    top: -6,
    right: 12,
    backgroundColor: '#007AFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nextIndicatorText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 16,
  },
  cacheInfoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  cacheInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cacheInfoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  refreshButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#f8f9fa',
  },
  refreshButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  clearCacheButton: {
    borderWidth: 1,
    borderColor: '#FF5252',
    backgroundColor: '#fff5f5',
  },
  clearCacheButtonText: {
    color: '#FF5252',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  backButtonContainer: {
    marginTop: 8,
    marginBottom: 100,
  },
  goBackButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  goBackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Error styles
  errorCard: {
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginTop: 50,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF5252',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#FF5252',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PrayerTimeScreen;
