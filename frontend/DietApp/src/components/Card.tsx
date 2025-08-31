import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  contentStyle?: ViewStyle;
  elevation?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  style,
  titleStyle,
  contentStyle,
  elevation = 2,
  borderRadius = 12,
  padding = 16,
  margin = 8,
}) => {
  const cardStyle = [
    styles.card,
    {
      elevation,
      borderRadius,
      padding,
      margin,
      shadowRadius: elevation * 2,
      shadowOpacity: elevation * 0.05,
    },
    style,
  ];

  return (
    <View style={cardStyle}>
      {(title || subtitle || icon) && (
        <View style={styles.header}>
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={24} color="#007AFF" />
            </View>
          )}
          <View style={styles.headerText}>
            {title && (
              <Text style={[styles.title, titleStyle]}>{title}</Text>
            )}
            {subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>
        </View>
      )}
      
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  change,
  changeLabel,
  icon,
  color = '#007AFF',
  style,
}) => {
  const isPositiveChange = change && change > 0;
  const isNegativeChange = change && change < 0;

  return (
    <Card style={StyleSheet.flatten([styles.statCard, style])}>
      <View style={styles.statHeader}>
        {icon && (
          <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
        )}
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      
      <View style={styles.statValue}>
        <Text style={[styles.statNumber, { color }]}>
          {value}
          {unit && <Text style={styles.statUnit}> {unit}</Text>}
        </Text>
      </View>
      
      {change !== undefined && (
        <View style={styles.statChange}>
          <Ionicons
            name={isPositiveChange ? 'arrow-up' : isNegativeChange ? 'arrow-down' : 'remove'}
            size={14}
            color={isPositiveChange ? '#34C759' : isNegativeChange ? '#FF3B30' : '#8E8E93'}
          />
          <Text
            style={[
              styles.changeText,
              {
                color: isPositiveChange ? '#34C759' : isNegativeChange ? '#FF3B30' : '#8E8E93'
              }
            ]}
          >
            {Math.abs(change)}{changeLabel || ''}
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  content: {
    // No default styles, let children define their own layout
  },
  
  // Stat Card Styles
  statCard: {
    flex: 1,
    minHeight: 120,
    margin: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    flex: 1,
  },
  statValue: {
    flex: 1,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statUnit: {
    fontSize: 16,
    fontWeight: '400',
    color: '#8E8E93',
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default Card;
