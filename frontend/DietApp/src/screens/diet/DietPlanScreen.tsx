import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    RefreshControl,
} from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import {formatDateDisplay, addDays} from '../../utils/dateUtils';
import {dietPlanService} from '../../services/dietService';
import aiDietService, { UserDietProfile } from '../../services/aiDietService';
import authService from '../../services/authService';
import { User } from '../../types';

interface DietDay {
    id: string;
    date: Date;
    dayNumber: number;
    meals: {
        breakfast: string;
        lunch: string;
        dinner: string;
        snacks: string;
    };
    generated: boolean;
}

const DietPlanScreen: React.FC = () => {
    const [dietDays, setDietDays] = useState<DietDay[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Helper function to convert User to UserDietProfile
    const convertUserToUserDietProfile = (user: User): UserDietProfile => {
        // Calculate age from date_of_birth
        const calculateAge = (dateOfBirth: string): number => {
            if (!dateOfBirth) return 25; // Default age
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age || 25; // Default to 25 if calculation fails
        };

        // Map activity levels
        const mapActivityLevel = (activityLevel: string): 'sedentary' | 'lightly active' | 'moderately active' | 'very active' => {
            switch (activityLevel) {
                case 'sedentary': return 'sedentary';
                case 'light': return 'lightly active';
                case 'moderate': return 'moderately active';
                case 'active': return 'very active';
                case 'extra_active': return 'very active';
                default: return 'moderately active';
            }
        };

        // Map goal
        const mapGoal = (goal: string): 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintain_weight' => {
            switch (goal) {
                case 'lose_weight': return 'weight_loss';
                case 'gain_weight': return 'weight_gain';
                case 'muscle_gain': return 'muscle_gain';
                case 'maintain_weight': return 'maintain_weight';
                case 'health_improvement': return 'maintain_weight';
                default: return 'maintain_weight';
            }
        };

        // Parse comma-separated strings to arrays
        const parseToArray = (str: string): string[] => {
            if (!str) return [];
            return str.split(',').map(item => item.trim()).filter(item => item.length > 0);
        };

        return {
            age: user.date_of_birth ? calculateAge(user.date_of_birth) : 25,
            gender: user.gender || 'M',
            height_cm: user.height || 170,
            weight_kg: user.weight || 70,
            activity_level: mapActivityLevel(user.activity_level),
            goal: mapGoal(user.goal),
            medical_conditions: parseToArray(user.medical_conditions || ''),
            food_restrictions: parseToArray(user.dietary_restrictions || ''),
            food_preferences: parseToArray(user.preferred_cuisines || ''),
        };
    };

    // Check for existing meal plan on component mount
    React.useEffect(() => {
        checkExistingMealPlan();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await checkExistingMealPlan();
        setRefreshing(false);
    };

    const checkExistingMealPlan = async () => {
        try {
            setIsLoading(true);
            console.log('Checking for existing meal plan...');
            
            const existingPlan = await dietPlanService.getCurrentRunningMealPlan();
            
            if (existingPlan && existingPlan.daily_plans) {
                console.log('Found existing meal plan:', existingPlan);
                
                // Convert the existing plan to frontend format
                const newDietDays: DietDay[] = existingPlan.daily_plans.map((dayPlan) => ({
                    id: `day-${dayPlan.day}`,
                    date: new Date(dayPlan.date),
                    dayNumber: dayPlan.day,
                    meals: {
                        breakfast: dayPlan.breakfast,
                        lunch: dayPlan.lunch,
                        dinner: dayPlan.dinner,
                        snacks: dayPlan.snacks || 'No snacks planned',
                    },
                    generated: true,
                }));
                
                setDietDays(newDietDays);
            } else {
                console.log('No existing meal plan found');
                setDietDays([]);
            }
        } catch (error) {
            console.error('Error checking existing meal plan:', error);
            setDietDays([]);
        } finally {
            setIsLoading(false);
        }
    };

    const generateDietPlan = async () => {
        setIsGenerating(true);

        try {
            Alert.alert(
                'Generating Diet Plan',
                'Creating your personalized 30-day meal plan using AI. This may take a few moments...'
            );

            // Get user profile from API
            const user = await authService.getCurrentUser();
            const userProfile: UserDietProfile = convertUserToUserDietProfile(user);

            console.log('User profile for AI diet generation:', userProfile);

            // Generate and save the AI diet plan
            const response = await dietPlanService.generateAndSaveAIDietPlan(userProfile);

            // Convert the response to frontend format
            const startDate = new Date(response.start_date);
            const newDietDays: DietDay[] = [];

            // Fetch the detailed meal plan to display
            const mealPlanData = await dietPlanService.getGeneratedMealPlan(response.meal_plan_id);

            // Convert backend data to frontend format
            mealPlanData.daily_plans.forEach((dayPlan, index) => {
                const date = new Date(dayPlan.date);
                newDietDays.push({
                    id: `day-${dayPlan.day}`,
                    date,
                    dayNumber: dayPlan.day,
                    meals: {
                        breakfast: dayPlan.breakfast,
                        lunch: dayPlan.lunch,
                        dinner: dayPlan.dinner,
                        snacks: dayPlan.snacks || 'No snacks planned',
                    },
                    generated: true,
                });
            });

            setDietDays(newDietDays);

            Alert.alert(
                'Success!',
                `Your personalized 30-day diet plan has been generated and saved! ${response.message}`
            );

            // Refresh the meal plan to show the newly generated plan
            await checkExistingMealPlan();

        } catch (error) {
            console.error('Error generating diet plan:', error);
            
            // More detailed error logging
            if (error?.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                console.error('Response headers:', error.response.headers);
            } else if (error?.request) {
                console.error('Request was made but no response received:', error.request);
            } else {
                console.error('Error setting up request:', error.message);
            }
            
            Alert.alert(
                'Error',
                error?.response?.data?.message || 
                error?.message || 
                'Failed to generate diet plan. Please ensure your profile is complete and check your internet connection.'
            );
        } finally {
            setIsGenerating(false);
        }
    };

    const renderDietDay = ({ item }: { item: DietDay }) => (
        <Card style={styles.dayCard}>
            <View style={styles.dayHeader}>
                <View style={styles.dayInfo}>
                    <Text style={styles.dayNumber}>Day {item.dayNumber}</Text>
                    <Text style={styles.dayDate}>{formatDateDisplay(item.date)}</Text>
                </View>
                <Ionicons
                    name={item.generated ? 'checkmark-circle' : 'time-outline'}
                    size={24}
                    color={item.generated ? '#34C759' : '#8E8E93'}
                />
            </View>

            <View style={styles.mealsContainer}>
                <View style={styles.mealRow}>
                    <View style={styles.mealIcon}>
                        <Ionicons name="sunny-outline" size={20} color="#FF9500"/>
                    </View>
                    <View style={styles.mealInfo}>
                        <Text style={styles.mealType}>Breakfast</Text>
                        <Text style={styles.mealDetails}>{item.meals.breakfast}</Text>
                    </View>
                </View>

                <View style={styles.mealRow}>
                    <View style={styles.mealIcon}>
                        <Ionicons name="partly-sunny-outline" size={20} color="#007AFF"/>
                    </View>
                    <View style={styles.mealInfo}>
                        <Text style={styles.mealType}>Lunch</Text>
                        <Text style={styles.mealDetails}>{item.meals.lunch}</Text>
                    </View>
                </View>

                <View style={styles.mealRow}>
                    <View style={styles.mealIcon}>
                        <Ionicons name="moon-outline" size={20} color="#5856D6"/>
                    </View>
                    <View style={styles.mealInfo}>
                        <Text style={styles.mealType}>Dinner</Text>
                        <Text style={styles.mealDetails}>{item.meals.dinner}</Text>
                    </View>
                </View>

                <View style={styles.mealRow}>
                    <View style={styles.mealIcon}>
                        <Ionicons name="restaurant-outline" size={20} color="#FFCC00"/>
                    </View>
                    <View style={styles.mealInfo}>
                        <Text style={styles.mealType}>Snacks</Text>
                        <Text style={styles.mealDetails}>{item.meals.snacks}</Text>
                    </View>
                </View>
            </View>
        </Card>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Diet Plan</Text>
                <Text style={styles.subtitle}>
                    {dietDays.length > 0 ? '30-Day Meal Plan' : 'Generate your personalized diet plan'}
                </Text>
            </View>

            {dietDays.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="restaurant-outline" size={80} color="#8E8E93"/>
                    <Text style={styles.emptyTitle}>No Diet Plan Yet</Text>
                    <Text style={styles.emptyDescription}>
                        Generate a personalized 30-day diet plan with 3 meals per day
                    </Text>
                    <Button
                        title="Generate Diet Plan"
                        onPress={generateDietPlan}
                        loading={isGenerating}
                        style={styles.generateButton}
                    />
                </View>
            ) : (
                <>
                    <View style={styles.summaryCard}>
                        <Card style={styles.summary}>
                            <View style={styles.summaryContent}>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryNumber}>30</Text>
                                    <Text style={styles.summaryLabel}>Days</Text>
                                </View>
                                <View style={styles.summaryDivider}/>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryNumber}>90</Text>
                                    <Text style={styles.summaryLabel}>Meals</Text>
                                </View>
                                <View style={styles.summaryDivider}/>
                                <View style={styles.summaryItem}>
                                    <TouchableOpacity onPress={generateDietPlan} disabled={isGenerating}>
                                        <Ionicons name="refresh-outline" size={24} color="#007AFF"/>
                                    </TouchableOpacity>
                                    <Text style={styles.summaryLabel}>Regenerate</Text>
                                </View>
                            </View>
                        </Card>
                    </View>

                    <FlatList
                        data={dietDays}
                        renderItem={renderDietDay}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContainer}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
        fontWeight: '500',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    loadingState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    loadingText: {
        fontSize: 16,
        color: '#8E8E93',
        marginTop: 16,
        textAlign: 'center',
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1C1C1E',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    generateButton: {
        width: '100%',
        maxWidth: 300,
    },
    summaryCard: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    summary: {
        marginBottom: 0,
    },
    summaryContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#007AFF',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
    },
    summaryDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E5E5EA',
        marginHorizontal: 16,
    },
    listContainer: {
        padding: 16,
        paddingTop: 8,
    },
    dayCard: {
        marginBottom: 12,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    dayInfo: {
        flex: 1,
    },
    dayNumber: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 2,
    },
    dayDate: {
        fontSize: 14,
        color: '#8E8E93',
    },
    mealsContainer: {
        marginTop: 8,
    },
    mealRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    mealIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    mealInfo: {
        flex: 1,
    },
    mealType: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 2,
    },
    mealDetails: {
        fontSize: 13,
        color: '#8E8E93',
        lineHeight: 16,
    },
});

export default DietPlanScreen;