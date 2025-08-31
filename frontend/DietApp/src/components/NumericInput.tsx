import React, { useState } from 'react';
import { View, Text } from 'react-native';
import InputField from './InputField';

interface NumericInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  min?: number;
  max?: number;
  unit?: string;
  decimalPlaces?: number;
  containerStyle?: any;
}

const NumericInput: React.FC<NumericInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  min,
  max,
  unit,
  decimalPlaces = 0,
  containerStyle,
}) => {
  const [localError, setLocalError] = useState<string>('');

  const handleTextChange = (text: string) => {
    // Remove non-numeric characters except decimal point
    let cleanText = text.replace(/[^0-9.]/g, '');
    
    // Handle decimal places
    if (decimalPlaces === 0) {
      cleanText = cleanText.replace(/\./g, '');
    } else {
      // Allow only one decimal point
      const parts = cleanText.split('.');
      if (parts.length > 2) {
        cleanText = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // Limit decimal places
      if (parts[1] && parts[1].length > decimalPlaces) {
        cleanText = parts[0] + '.' + parts[1].substring(0, decimalPlaces);
      }
    }

    // Validate range
    const numValue = parseFloat(cleanText);
    let validationError = '';
    
    if (!isNaN(numValue)) {
      if (min !== undefined && numValue < min) {
        validationError = `Minimum value is ${min}`;
      } else if (max !== undefined && numValue > max) {
        validationError = `Maximum value is ${max}`;
      }
    }
    
    setLocalError(validationError);
    onChangeText(cleanText);
  };

  const displayError = error || localError;

  return (
    <View style={containerStyle}>
      <InputField
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={handleTextChange}
        keyboardType="numeric"
        leftIcon="calculator-outline"
        error={displayError}
      />
      {unit && value && (
        <Text style={{ 
          position: 'absolute', 
          right: 16, 
          top: label ? 44 : 22, 
          color: '#8E8E93', 
          fontSize: 16 
        }}>
          {unit}
        </Text>
      )}
    </View>
  );
};

export default NumericInput;
