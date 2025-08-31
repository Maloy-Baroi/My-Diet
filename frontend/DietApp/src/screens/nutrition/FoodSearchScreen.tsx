import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import { Food } from '../../types';
import { foodService } from '../../services/dietService';
import { formatCalories, formatMacros } from '../../utils/numberUtils';

const FoodSearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'grains', label: 'Grains & Cereals' },
    { value: 'proteins', label: 'Proteins' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fats', label: 'Fats & Oils' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'snacks', label: 'Snacks' },
  ];

  const searchFoods = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const response = await foodService.getFoods(
        searchQuery,
        selectedCategory || undefined
      );
      setFoods(response.results);
    } catch (error) {
      console.error('Food search failed:', error);
      Alert.alert('Error', 'Failed to search foods');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (searchQuery.trim()) {
      searchFoods();
    }
  };

  const addFoodToLog = (food: Food) => {
    Alert.alert(
      'Add to Food Log',
      `Add ${food.name} to your food log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add', onPress: () => {
          // TODO: Navigate to portion selection or add directly
        }}
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchFoods}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => Alert.alert('Barcode Scanner', 'Feature coming soon!')}
        >
          <Ionicons name="qr-code" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Categories */}
        <Card title="Categories" style={styles.card}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categories}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.value && styles.selectedCategory
                  ]}
                  onPress={() => handleCategoryChange(category.value)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.value && styles.selectedCategoryText
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Card>

        {/* Search Results */}
        {isSearching ? (
          <Loading message="Searching foods..." />
        ) : foods.length > 0 ? (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              Search Results ({foods.length})
            </Text>
            {foods.map((food) => (
              <FoodItem
                key={food.id}
                food={food}
                onPress={() => addFoodToLog(food)}
              />
            ))}
          </View>
        ) : searchQuery.trim() ? (
          <Card style={styles.card}>
            <View style={styles.noResults}>
              <Ionicons name="search" size={48} color="#8E8E93" />
              <Text style={styles.noResultsTitle}>No Foods Found</Text>
              <Text style={styles.noResultsMessage}>
                Try searching with different keywords or check the spelling.
              </Text>
            </View>
          </Card>
        ) : (
          <Card style={styles.card}>
            <View style={styles.searchPrompt}>
              <Ionicons name="restaurant-outline" size={48} color="#8E8E93" />
              <Text style={styles.searchPromptTitle}>Search for Foods</Text>
              <Text style={styles.searchPromptMessage}>
                Enter a food name above to search our database of nutritional information.
              </Text>
            </View>
          </Card>
        )}

        {/* Quick Actions */}
        <Card title="Quick Actions" style={styles.card}>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="camera-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Photo Recognition</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="qr-code-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Scan Barcode</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

interface FoodItemProps {
  food: Food;
  onPress: () => void;
}

const FoodItem: React.FC<FoodItemProps> = ({ food, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.foodCard}>
        <View style={styles.foodHeader}>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.foodCategory}>
            {food.category.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.foodNutrition}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Calories</Text>
            <Text style={styles.nutritionValue}>
              {formatCalories(food.calories_per_100g)}/100g
            </Text>
          </View>
          
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionGridItem}>
              <Text style={styles.nutritionLabel}>Protein</Text>
              <Text style={styles.nutritionValue}>
                {formatMacros(food.protein_per_100g)}
              </Text>
            </View>
            <View style={styles.nutritionGridItem}>
              <Text style={styles.nutritionLabel}>Carbs</Text>
              <Text style={styles.nutritionValue}>
                {formatMacros(food.carbs_per_100g)}
              </Text>
            </View>
            <View style={styles.nutritionGridItem}>
              <Text style={styles.nutritionLabel}>Fat</Text>
              <Text style={styles.nutritionValue}>
                {formatMacros(food.fat_per_100g)}
              </Text>
            </View>
            <View style={styles.nutritionGridItem}>
              <Text style={styles.nutritionLabel}>Fiber</Text>
              <Text style={styles.nutritionValue}>
                {formatMacros(food.fiber_per_100g)}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  scanButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  categories: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  resultsSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  foodCard: {
    marginBottom: 12,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  foodCategory: {
    fontSize: 12,
    color: '#8E8E93',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  foodNutrition: {
    // Food nutrition container
  },
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  searchPrompt: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  searchPromptTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  searchPromptMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    padding: 16,
  },
  quickActionText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default FoodSearchScreen;
