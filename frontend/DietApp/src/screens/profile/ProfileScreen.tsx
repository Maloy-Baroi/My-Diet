import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Card, { StatCard } from '../../components/Card';

const { width } = Dimensions.get('window');
const PROFILE_IMAGE_SIZE = 120;

interface ProfileMetrics {
  bmi: number;
  bmr: number;
  age: number;
}

interface Props {
  navigation: any;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { logout, user, uploadProfilePhoto } = useAuth();
  const [profileMetrics, setProfileMetrics] = useState<ProfileMetrics | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    // Calculate metrics from user data
    if (user && user.height && user.weight && user.date_of_birth) {
      const today = new Date();
      const birthDate = new Date(user.date_of_birth);
      const age = today.getFullYear() - birthDate.getFullYear();
      
      // Calculate BMI
      const heightInMeters = user.height / 100;
      const bmi = user.weight / (heightInMeters * heightInMeters);
      
      // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
      let bmr;
      if (user.gender === 'M') {
        bmr = 10 * user.weight + 6.25 * user.height - 5 * age + 5;
      } else {
        bmr = 10 * user.weight + 6.25 * user.height - 5 * age - 161;
      }
      
      setProfileMetrics({ bmi: Math.round(bmi * 100) / 100, bmr: Math.round(bmr), age });
    }
  }, [user]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const requestPermissions = async () => {
    try {
      console.log('Requesting media library permissions...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Media library permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to change your profile picture!');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert('Permission Error', `Failed to request permissions: ${error.message}`);
      return false;
    }
  };

  const handleChangeProfilePicture = async () => {
    try {
      console.log('Requesting media library permissions...');
      const hasPermission = await requestPermissions();
      console.log('Media library permission granted:', hasPermission);
      
      if (!hasPermission) return;

      console.log('Showing image picker options...');
      Alert.alert(
        'Change Profile Picture',
        'Choose an option',
        [
          { text: 'Camera', onPress: () => {
            console.log('User selected Camera');
            openCamera();
          }},
          { text: 'Gallery', onPress: () => {
            console.log('User selected Gallery');
            openGallery();
          }},
          { text: 'Cancel', style: 'cancel', onPress: () => {
            console.log('User cancelled');
          }},
        ]
      );
    } catch (error) {
      console.error('Profile picture handler error:', error);
      Alert.alert('Error', `Failed to change profile picture: ${error.message}`);
    }
  };

  const openCamera = async () => {
    try {
      console.log('Platform:', Platform.OS);
      console.log('Requesting camera permissions...');
      
      // Check if camera is available
      const cameraAvailable = await ImagePicker.getCameraPermissionsAsync();
      console.log('Camera availability check:', cameraAvailable);

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('Camera permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos!');
        return;
      }

      console.log('Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      console.log('Camera result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleUploadProfilePhoto(result.assets[0].uri);
      } else {
        console.log('Camera was cancelled or no assets returned');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Camera Error', `Failed to open camera: ${error.message}\n\nNote: Camera may not work on simulators/emulators. Try on a physical device.`);
    }
  };

  const openGallery = async () => {
    try {
      console.log('Launching gallery...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      console.log('Gallery result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleUploadProfilePhoto(result.assets[0].uri);
      } else {
        console.log('Gallery was cancelled or no assets returned');
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Gallery Error', `Failed to open gallery: ${error.message}`);
    }
  };

  const handleUploadProfilePhoto = async (imageUri: string) => {
    try {
      setImageLoading(true);
      
      const formData = new FormData();
      formData.append('profile_photo', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      await uploadProfilePhoto(formData);
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Profile photo upload error:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    } finally {
      setImageLoading(false);
    }
  };

  const getActivityLevelDisplay = (level: string) => {
    const levels = {
      sedentary: 'Sedentary',
      light: 'Lightly Active',
      moderate: 'Moderately Active',
      active: 'Very Active',
      extra_active: 'Extremely Active'
    };
    return levels[level] || level;
  };

  const getGoalDisplay = (goal: string) => {
    const goals = {
      lose_weight: 'Lose Weight',
      maintain_weight: 'Maintain Weight',
      gain_weight: 'Gain Weight',
      muscle_gain: 'Build Muscle',
      health_improvement: 'Improve Health'
    };
    return goals[goal] || goal;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#FF9500' };
    if (bmi < 25) return { category: 'Normal', color: '#34C759' };
    if (bmi < 30) return { category: 'Overweight', color: '#FF9500' };
    return { category: 'Obese', color: '#FF3B30' };
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user data available</Text>
      </View>
    );
  }

  const bmiCategory = profileMetrics ? getBMICategory(profileMetrics.bmi) : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={handleChangeProfilePicture} disabled={imageLoading}>
            <Image
              source={{
                uri: user.profile_photo || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face'
              }}
              style={styles.profileImage}
            />
            <View style={styles.cameraIconContainer}>
              {imageLoading ? (
                <ActivityIndicator size={16} color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user.first_name} {user.last_name}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.username && (
            <Text style={styles.username}>@{user.username}</Text>
          )}
        </View>
        
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={20} color="#007AFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Health Metrics */}
      {profileMetrics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          <View style={styles.statsRow}>
            <StatCard
              title="BMI"
              value={profileMetrics.bmi}
              icon="fitness-outline"
              color={bmiCategory?.color}
              style={styles.statCard}
            />
            <StatCard
              title="BMR"
              value={profileMetrics.bmr}
              unit="cal/day"
              icon="flame-outline"
              color="#FF6B35"
              style={styles.statCard}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Age"
              value={profileMetrics.age}
              unit="years"
              icon="calendar-outline"
              color="#007AFF"
              style={styles.statCard}
            />
            <StatCard
              title="Weight"
              value={user.weight}
              unit="kg"
              icon="barbell-outline"
              color="#34C759"
              style={styles.statCard}
            />
          </View>
          {bmiCategory && (
            <Card style={styles.bmiCard}>
              <View style={styles.bmiInfo}>
                <Ionicons name="information-circle" size={24} color={bmiCategory.color} />
                <Text style={styles.bmiText}>
                  Your BMI indicates you are in the <Text style={[styles.bmiCategory, { color: bmiCategory.color }]}>
                    {bmiCategory.category}
                  </Text> range
                </Text>
              </View>
            </Card>
          )}
        </View>
      )}

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Card>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="person-outline" size={20} color="#8E8E93" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Gender</Text>
                  <Text style={styles.infoValue}>
                    {user.gender === 'M' ? 'Male' : user.gender === 'F' ? 'Female' : 'Other'}
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Date of Birth</Text>
                  <Text style={styles.infoValue}>
                    {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not set'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="call-outline" size={20} color="#8E8E93" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{user.phone_number || 'Not set'}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="resize-outline" size={20} color="#8E8E93" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Height</Text>
                  <Text style={styles.infoValue}>{user.height ? `${user.height} cm` : 'Not set'}</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>
      </View>

      {/* Goals & Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Goals & Activity</Text>
        <Card>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="target-outline" size={20} color="#8E8E93" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Goal</Text>
                  <Text style={styles.infoValue}>{getGoalDisplay(user.goal)}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="trending-up-outline" size={20} color="#8E8E93" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Target Weight</Text>
                  <Text style={styles.infoValue}>
                    {user.target_weight ? `${user.target_weight} kg` : 'Not set'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.fullWidthInfo}>
              <Ionicons name="walk-outline" size={20} color="#8E8E93" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Activity Level</Text>
                <Text style={styles.infoValue}>{getActivityLevelDisplay(user.activity_level)}</Text>
              </View>
            </View>
          </View>
        </Card>
      </View>

      {/* Dietary Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Preferences</Text>
        <Card>
          <View style={styles.dietaryInfo}>
            <View style={styles.dietaryItem}>
              <Ionicons name="warning-outline" size={20} color="#FF9500" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Allergies</Text>
                <Text style={styles.infoValue}>{user.allergies || 'None'}</Text>
              </View>
            </View>
            
            <View style={styles.dietaryItem}>
              <Ionicons name="medical-outline" size={20} color="#FF3B30" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Medical Conditions</Text>
                <Text style={styles.infoValue}>{user.medical_conditions || 'None'}</Text>
              </View>
            </View>
            
            <View style={styles.dietaryItem}>
              <Ionicons name="restaurant-outline" size={20} color="#34C759" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Dietary Restrictions</Text>
                <Text style={styles.infoValue}>{user.dietary_restrictions || 'None'}</Text>
              </View>
            </View>
            
            <View style={styles.dietaryItem}>
              <Ionicons name="heart-outline" size={20} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Preferred Cuisines</Text>
                <Text style={styles.infoValue}>{user.preferred_cuisines || 'Not specified'}</Text>
              </View>
            </View>
            
            <View style={styles.dietaryItem}>
              <Ionicons name="close-circle-outline" size={20} color="#8E8E93" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Disliked Foods</Text>
                <Text style={styles.infoValue}>{user.disliked_foods || 'None'}</Text>
              </View>
            </View>
          </View>
        </Card>
      </View>

      {/* Account Actions */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Card>
          <View style={styles.accountActions}>
            <TouchableOpacity style={styles.actionRow}>
              <Ionicons name="settings-outline" size={24} color="#007AFF" />
              <Text style={styles.actionText}>Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionRow}>
              <Ionicons name="notifications-outline" size={24} color="#007AFF" />
              <Text style={styles.actionText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionRow}>
              <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.actionText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionRow}>
              <Ionicons name="shield-outline" size={24} color="#007AFF" />
              <Text style={styles.actionText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        </Card>
      </View> */}

      {/* Account Info */}
      <View style={styles.section}>
        <Card>
          <View style={styles.accountInfo}>
            <Text style={styles.accountInfoTitle}>Account Information</Text>
            <Text style={styles.accountInfoText}>
              Member since {new Date(user.created_at).toLocaleDateString()}
            </Text>
            <Text style={styles.accountInfoText}>
              Last updated {new Date(user.updated_at).toLocaleDateString()}
            </Text>
          </View>
        </Card>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          size="large"
        />
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 16,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statCard: {
    marginHorizontal: 4,
  },
  bmiCard: {
    marginTop: 8,
    backgroundColor: '#F8F9FA',
  },
  bmiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bmiText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginLeft: 12,
    flex: 1,
  },
  bmiCategory: {
    fontWeight: '600',
  },
  infoGrid: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  fullWidthInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  dietaryInfo: {
    gap: 16,
  },
  dietaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  accountActions: {
    gap: 0,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
    marginLeft: 12,
  },
  accountInfo: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  accountInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  accountInfoText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  logoutSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  bottomSpacer: {
    height: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default ProfileScreen;
