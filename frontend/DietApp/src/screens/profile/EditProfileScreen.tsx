import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { User } from '../../types';

interface Props {
  navigation: any;
}

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateProfile, uploadProfilePhoto } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    date_of_birth: '',
    gender: 'M' as 'M' | 'F' | 'O',
    height: '',
    weight: '',
    target_weight: '',
    activity_level: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'extra_active',
    goal: 'maintain_weight' as 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'muscle_gain' | 'health_improvement',
    allergies: '',
    medical_conditions: '',
    dietary_restrictions: '',
    preferred_cuisines: '',
    disliked_foods: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || 'M',
        height: user.height?.toString() || '',
        weight: user.weight?.toString() || '',
        target_weight: user.target_weight?.toString() || '',
        activity_level: user.activity_level || 'moderate',
        goal: user.goal || 'maintain_weight',
        allergies: user.allergies || '',
        medical_conditions: user.medical_conditions || '',
        dietary_restrictions: user.dietary_restrictions || '',
        preferred_cuisines: user.preferred_cuisines || '',
        disliked_foods: user.disliked_foods || '',
      });
      setProfileImage(user.profile_photo || null);
    }
  }, [user]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to change your profile picture!');
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      Alert.alert('Validation Error', 'First name is required');
      return false;
    }
    if (!formData.last_name.trim()) {
      Alert.alert('Validation Error', 'Last name is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Prepare update data
      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender,
        height: formData.height ? parseInt(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        target_weight: formData.target_weight ? parseFloat(formData.target_weight) : null,
        activity_level: formData.activity_level,
        goal: formData.goal,
        allergies: formData.allergies || null,
        medical_conditions: formData.medical_conditions || null,
        dietary_restrictions: formData.dietary_restrictions || null,
        preferred_cuisines: formData.preferred_cuisines || null,
        disliked_foods: formData.disliked_foods || null,
      };

      // Handle profile image upload
      if (profileImage && profileImage !== user?.profile_photo) {
        // Create FormData for photo upload only
        const photoFormData = new FormData();
        
        // Add image file
        photoFormData.append('profile_photo', {
          uri: profileImage,
          type: 'image/jpeg',
          name: 'profile.jpg',
        } as any);

        // Upload photo separately
        await uploadProfilePhoto(photoFormData);
      }

      // Update other profile data (without photo)
      await updateProfile(updateData);

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getActivityLevelOptions = () => [
    { label: 'Sedentary (little/no exercise)', value: 'sedentary' },
    { label: 'Lightly Active (light exercise 1-3 days/week)', value: 'light' },
    { label: 'Moderately Active (moderate exercise 3-5 days/week)', value: 'moderate' },
    { label: 'Very Active (hard exercise 6-7 days/week)', value: 'active' },
    { label: 'Extremely Active (very hard exercise, physical job)', value: 'extra_active' },
  ];

  const getGoalOptions = () => [
    { label: 'Lose Weight', value: 'lose_weight' },
    { label: 'Maintain Weight', value: 'maintain_weight' },
    { label: 'Gain Weight', value: 'gain_weight' },
    { label: 'Build Muscle', value: 'muscle_gain' },
    { label: 'Improve Health', value: 'health_improvement' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Profile Image Section */}
      <Card style={styles.imageCard}>
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
            <Image
              source={{
                uri: profileImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face'
              }}
              style={styles.profileImage}
            />
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.imageHint}>Tap to change photo</Text>
        </View>
      </Card>

      {/* Personal Information */}
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.formRow}>
          <View style={styles.halfInput}>
            <InputField
              label="First Name *"
              value={formData.first_name}
              onChangeText={(text) => handleInputChange('first_name', text)}
              placeholder="Enter first name"
            />
          </View>
          <View style={styles.halfInput}>
            <InputField
              label="Last Name *"
              value={formData.last_name}
              onChangeText={(text) => handleInputChange('last_name', text)}
              placeholder="Enter last name"
            />
          </View>
        </View>

        <InputField
          label="Phone Number"
          value={formData.phone_number}
          onChangeText={(text) => handleInputChange('phone_number', text)}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />

        <InputField
          label="Date of Birth"
          value={formData.date_of_birth}
          onChangeText={(text) => handleInputChange('date_of_birth', text)}
          placeholder="YYYY-MM-DD"
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Gender</Text>
          <View style={styles.genderButtons}>
            {[
              { label: 'Male', value: 'M' },
              { label: 'Female', value: 'F' },
              { label: 'Other', value: 'O' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.genderButton,
                  formData.gender === option.value && styles.genderButtonActive,
                ]}
                onPress={() => handleInputChange('gender', option.value)}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    formData.gender === option.value && styles.genderButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Card>

      {/* Physical Information */}
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>Physical Information</Text>
        <View style={styles.formRow}>
          <View style={styles.halfInput}>
            <InputField
              label="Height (cm)"
              value={formData.height}
              onChangeText={(text) => handleInputChange('height', text)}
              placeholder="170"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <InputField
              label="Current Weight (kg)"
              value={formData.weight}
              onChangeText={(text) => handleInputChange('weight', text)}
              placeholder="70"
              keyboardType="numeric"
            />
          </View>
        </View>

        <InputField
          label="Target Weight (kg)"
          value={formData.target_weight}
          onChangeText={(text) => handleInputChange('target_weight', text)}
          placeholder="65"
          keyboardType="numeric"
        />
      </Card>

      {/* Goals & Activity */}
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>Goals & Activity Level</Text>
        
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Goal</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.goalScroll}>
            {getGoalOptions().map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.goalButton,
                  formData.goal === option.value && styles.goalButtonActive,
                ]}
                onPress={() => handleInputChange('goal', option.value)}
              >
                <Text
                  style={[
                    styles.goalButtonText,
                    formData.goal === option.value && styles.goalButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Activity Level</Text>
          {getActivityLevelOptions().map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.activityButton,
                formData.activity_level === option.value && styles.activityButtonActive,
              ]}
              onPress={() => handleInputChange('activity_level', option.value)}
            >
              <View style={styles.activityButtonContent}>
                <View
                  style={[
                    styles.radioButton,
                    formData.activity_level === option.value && styles.radioButtonActive,
                  ]}
                />
                <Text
                  style={[
                    styles.activityButtonText,
                    formData.activity_level === option.value && styles.activityButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Dietary Preferences */}
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>Dietary Preferences</Text>
        
        <InputField
          label="Allergies"
          value={formData.allergies}
          onChangeText={(text) => handleInputChange('allergies', text)}
          placeholder="e.g., Nuts, Shellfish"
        />

        <InputField
          label="Medical Conditions"
          value={formData.medical_conditions}
          onChangeText={(text) => handleInputChange('medical_conditions', text)}
          placeholder="e.g., Diabetes, Hypertension"
        />

        <InputField
          label="Dietary Restrictions"
          value={formData.dietary_restrictions}
          onChangeText={(text) => handleInputChange('dietary_restrictions', text)}
          placeholder="e.g., Vegetarian, Vegan, Keto"
        />

        <InputField
          label="Preferred Cuisines"
          value={formData.preferred_cuisines}
          onChangeText={(text) => handleInputChange('preferred_cuisines', text)}
          placeholder="e.g., Italian, Indian, Mexican"
        />

        <InputField
          label="Disliked Foods"
          value={formData.disliked_foods}
          onChangeText={(text) => handleInputChange('disliked_foods', text)}
          placeholder="e.g., Brussels sprouts, Liver"
        />
      </Card>

      {/* Save Button */}
      <View style={styles.saveSection}>
        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  placeholder: {
    width: 40,
  },
  imageCard: {
    margin: 16,
    alignItems: 'center',
  },
  imageSection: {
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  imageHint: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  formCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  genderButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  genderButtonTextActive: {
    color: '#007AFF',
  },
  goalScroll: {
    flexGrow: 0,
  },
  goalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  goalButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  goalButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  goalButtonTextActive: {
    color: '#007AFF',
  },
  activityButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  activityButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  activityButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    marginRight: 12,
  },
  radioButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  activityButtonText: {
    fontSize: 14,
    color: '#1C1C1E',
    flex: 1,
  },
  activityButtonTextActive: {
    color: '#007AFF',
    fontWeight: '500',
  },
  saveSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default EditProfileScreen;
