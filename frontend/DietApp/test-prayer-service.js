// Test script to verify prayer times API functionality
import prayerService from '../src/services/prayerService';

async function testPrayerService() {
  console.log('Testing Prayer Service...');
  
  try {
    // Test 1: Get today's prayer times for Bangladesh
    console.log('\n1. Testing Bangladesh prayer times for today:');
    const todayPrayerTimes = await prayerService.getPrayerTimesForBangladesh();
    console.log('✅ Success! Prayer times received:');
    console.log(`Date: ${todayPrayerTimes.date.readable}`);
    console.log(`Fajr: ${prayerService.formatPrayerTime(todayPrayerTimes.timings.Fajr)}`);
    console.log(`Dhuhr: ${prayerService.formatPrayerTime(todayPrayerTimes.timings.Dhuhr)}`);
    console.log(`Asr: ${prayerService.formatPrayerTime(todayPrayerTimes.timings.Asr)}`);
    console.log(`Maghrib: ${prayerService.formatPrayerTime(todayPrayerTimes.timings.Maghrib)}`);
    console.log(`Isha: ${prayerService.formatPrayerTime(todayPrayerTimes.timings.Isha)}`);
    
    // Test 2: Get next prayer
    console.log('\n2. Testing next prayer calculation:');
    const nextPrayer = prayerService.getNextPrayer(todayPrayerTimes.timings);
    if (nextPrayer) {
      console.log(`✅ Next prayer: ${nextPrayer.name} at ${prayerService.formatPrayerTime(nextPrayer.time)}`);
      
      // Test 3: Get time until next prayer
      const timeUntilNext = prayerService.getTimeUntilNextPrayer(nextPrayer.time);
      console.log(`✅ Time until next prayer: ${timeUntilNext}`);
    }
    
    // Test 4: Get prayer times for a specific city
    console.log('\n3. Testing prayer times for Chittagong:');
    const cityPrayerTimes = await prayerService.getPrayerTimesForCity('Chittagong');
    console.log('✅ Success! Chittagong prayer times received:');
    console.log(`Fajr: ${prayerService.formatPrayerTime(cityPrayerTimes.timings.Fajr)}`);
    console.log(`Dhuhr: ${prayerService.formatPrayerTime(cityPrayerTimes.timings.Dhuhr)}`);
    
  } catch (error) {
    console.error('❌ Error testing prayer service:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testPrayerService();
}

export default testPrayerService;
