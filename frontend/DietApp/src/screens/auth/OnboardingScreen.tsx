import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import DatePickerInput from '../../components/DatePickerInput';
import NumericInput from '../../components/NumericInput';
import MultilineInput from '../../components/MultilineInput';
import { validateWeight, validateHeight, validateAge } from '../../utils/validationUtils';

interface OnboardingStep {
  title: string;
  subtitle: string;
  component: React.ReactNode;
}

const OnboardingScreen: React.FC = () => {
  const { user, updateProfile, clearAllTokens } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    goal: '',
    targetWeight: '',
    allergies: '',
    medicalConditions: '',
    dietaryRestrictions: '',
    preferredCuisines: '',
    dislikedFoods: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (currentStep) {
      case 0: // Basic Info
        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = 'Date of birth is required';
        } else if (!validateAge(formData.dateOfBirth)) {
          newErrors.dateOfBirth = 'You must be between 13 and 120 years old';
        }
        
        if (!formData.gender) {
          newErrors.gender = 'Please select your gender';
        }
        break;

      case 1: // Physical Info
        if (!formData.height) {
          newErrors.height = 'Height is required';
        } else if (!validateHeight(Number(formData.height))) {
          newErrors.height = 'Height must be between 50 and 300 cm';
        }
        
        if (!formData.weight) {
          newErrors.weight = 'Weight is required';
        } else if (!validateWeight(Number(formData.weight))) {
          newErrors.weight = 'Weight must be between 20 and 500 kg';
        }
        break;

      case 2: // Goals & Activity
        if (!formData.activityLevel) {
          newErrors.activityLevel = 'Please select your activity level';
        }
        
        if (!formData.goal) {
          newErrors.goal = 'Please select your goal';
        }
        
        if (formData.goal === 'lose_weight' || formData.goal === 'gain_weight') {
          if (!formData.targetWeight) {
            newErrors.targetWeight = 'Target weight is required for this goal';
          } else if (!validateWeight(Number(formData.targetWeight))) {
            newErrors.targetWeight = 'Target weight must be between 20 and 500 kg';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      
      const updateData = {
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender as 'M' | 'F' | 'O',
        height: Number(formData.height),
        weight: Number(formData.weight),
        activity_level: formData.activityLevel as any,
        goal: formData.goal as any,
        target_weight: formData.targetWeight ? Number(formData.targetWeight) : undefined,
        allergies: formData.allergies || '',
        medical_conditions: formData.medicalConditions || '',
        dietary_restrictions: formData.dietaryRestrictions || '',
        preferred_cuisines: formData.preferredCuisines || '',
        disliked_foods: formData.dislikedFoods || '',
      };

      console.log('Sending profile update data:', JSON.stringify(updateData));
      
      const updatedUser = await updateProfile(updateData);
      console.log('Profile updated successfully:', updatedUser);
      
      Alert.alert(
        'Welcome!', 
        'Your profile has been set up successfully.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Profile update error:', error);
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        // Extract specific error message if available
        if (typeof error.response.data === 'object') {
          const firstError = Object.entries(error.response.data)[0];
          if (firstError && firstError.length > 1) {
            errorMessage = `${firstError[0]}: ${firstError[1]}`;
          }
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Debug function to manually clear all tokens
  const handleClearTokens = async () => {
    Alert.alert(
      'Clear All Tokens',
      'This will remove all stored authentication data. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllTokens();
              Alert.alert('Success', 'All tokens have been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear tokens');
            }
          },
        },
      ]
    );
  };

  const BasicInfoStep = () => (
    <View style={styles.stepContent}>
      <DatePickerInput
        label="Date of Birth"
        placeholder="YYYY-MM-DD"
        value={formData.dateOfBirth}
        onChangeText={(value) => handleInputChange('dateOfBirth', value)}
        error={errors.dateOfBirth}
      />

      <Text style={styles.sectionLabel}>Gender</Text>
      <View style={styles.optionGrid}>
        {[
          { value: 'M', label: 'Male' },
          { value: 'F', label: 'Female' },
          { value: 'O', label: 'Other' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              formData.gender === option.value && styles.selectedOption
            ]}
            onPress={() => handleInputChange('gender', option.value)}
          >
            <Text style={[
              styles.optionText,
              formData.gender === option.value && styles.selectedOptionText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
    </View>
  );

  const PhysicalInfoStep = () => (
    <View style={styles.stepContent}>
      <NumericInput
        label="Height (cm)"
        placeholder="Enter your height in centimeters"
        value={formData.height}
        onChangeText={(value) => handleInputChange('height', value)}
        error={errors.height}
        min={50}
        max={300}
        unit="cm"
      />

      <NumericInput
        label="Current Weight (kg)"
        placeholder="Enter your current weight in kilograms"
        value={formData.weight}
        onChangeText={(value) => handleInputChange('weight', value)}
        error={errors.weight}
        min={20}
        max={500}
        unit="kg"
        decimalPlaces={1}
      />
    </View>
  );

  const GoalsActivityStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionLabel}>Activity Level</Text>
      <View style={styles.optionList}>
        {[
          { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
          { value: 'light', label: 'Light Exercise', desc: '1-3 days per week' },
          { value: 'moderate', label: 'Moderate Exercise', desc: '3-5 days per week' },
          { value: 'active', label: 'Very Active', desc: '6-7 days per week' },
          { value: 'extra_active', label: 'Extra Active', desc: 'Very intense exercise' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.listOption,
              formData.activityLevel === option.value && styles.selectedListOption
            ]}
            onPress={() => handleInputChange('activityLevel', option.value)}
          >
            <View>
              <Text style={[
                styles.listOptionTitle,
                formData.activityLevel === option.value && styles.selectedListOptionText
              ]}>
                {option.label}
              </Text>
              <Text style={styles.listOptionDesc}>{option.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {errors.activityLevel && <Text style={styles.errorText}>{errors.activityLevel}</Text>}

      <Text style={styles.sectionLabel}>Primary Goal</Text>
      <View style={styles.optionList}>
        {[
          { value: 'lose_weight', label: 'Lose Weight' },
          { value: 'maintain_weight', label: 'Maintain Weight' },
          { value: 'gain_weight', label: 'Gain Weight' },
          { value: 'muscle_gain', label: 'Build Muscle' },
          { value: 'health_improvement', label: 'Improve Health' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.listOption,
              formData.goal === option.value && styles.selectedListOption
            ]}
            onPress={() => handleInputChange('goal', option.value)}
          >
            <Text style={[
              styles.listOptionTitle,
              formData.goal === option.value && styles.selectedListOptionText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.goal && <Text style={styles.errorText}>{errors.goal}</Text>}

      {(formData.goal === 'lose_weight' || formData.goal === 'gain_weight') && (
        <NumericInput
          label="Target Weight (kg)"
          placeholder="Enter your target weight"
          value={formData.targetWeight}
          onChangeText={(value) => handleInputChange('targetWeight', value)}
          error={errors.targetWeight}
          min={20}
          max={500}
          unit="kg"
          decimalPlaces={1}
        />
      )}
    </View>
  );

  const PreferencesStep = () => (
    <View style={styles.stepContent}>
      <MultilineInput
        label="Allergies (Optional)"
        placeholder="List any food allergies, separated by commas"
        value={formData.allergies}
        onChangeText={(value) => handleInputChange('allergies', value)}
        icon="medkit-outline"
      />

      <MultilineInput
        label="Medical Conditions (Optional)"
        placeholder="Any relevant medical conditions"
        value={formData.medicalConditions}
        onChangeText={(value) => handleInputChange('medicalConditions', value)}
        icon="fitness-outline"
      />

      <MultilineInput
        label="Dietary Restrictions (Optional)"
        placeholder="e.g., Vegetarian, Vegan, Halal, Kosher"
        value={formData.dietaryRestrictions}
        onChangeText={(value) => handleInputChange('dietaryRestrictions', value)}
        icon="restaurant-outline"
      />

      <MultilineInput
        label="Preferred Cuisines (Optional)"
        placeholder="e.g., Italian, Asian, Mediterranean"
        value={formData.preferredCuisines}
        onChangeText={(value) => handleInputChange('preferredCuisines', value)}
        icon="globe-outline"
      />

      <MultilineInput
        label="Disliked Foods (Optional)"
        placeholder="Foods you don't like, separated by commas"
        value={formData.dislikedFoods}
        onChangeText={(value) => handleInputChange('dislikedFoods', value)}
        icon="close-circle-outline"
      />
    </View>
  );

  const steps: OnboardingStep[] = [
    {
      title: 'Basic Information',
      subtitle: 'Tell us about yourself',
      component: <BasicInfoStep />,
    },
    {
      title: 'Physical Information',
      subtitle: 'Your current measurements',
      component: <PhysicalInfoStep />,
    },
    {
      title: 'Goals & Activity',
      subtitle: 'What do you want to achieve?',
      component: <GoalsActivityStep />,
    },
    {
      title: 'Preferences',
      subtitle: 'Help us personalize your experience',
      component: <PreferencesStep />,
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
        
        <View style={styles.progressBar}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.activeProgressDot
              ]}
            />
          ))}
        </View>
        
        {/* Debug button - remove in production */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.debugButton}
            onPress={handleClearTokens}
          >
            <Text style={styles.debugButtonText}>🗑️ Clear All Tokens (Debug)</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {currentStepData.component}
      </ScrollView>

      <View style={styles.navigation}>
        {currentStep > 0 && (
          <Button
            title="Back"
            onPress={handleBack}
            variant="outline"
            style={styles.backButton}
          />
        )}
        
        <Button
          title={currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
          onPress={handleNext}
          loading={isLoading}
          disabled={isLoading}
          style={styles.nextButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 4,
  },
  activeProgressDot: {
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContent: {
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  optionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  optionList: {
    marginBottom: 24,
  },
  listOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedListOption: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  listOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  selectedListOptionText: {
    color: '#007AFF',
  },
  listOptionDesc: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 8,
  },
  navigation: {
    flexDirection: 'row',
    padding: 24,
    paddingBottom: 40,
  },
  backButton: {
    flex: 1,
    marginRight: 12,
  },
  nextButton: {
    flex: 2,
  },
  debugButton: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default OnboardingScreen;
