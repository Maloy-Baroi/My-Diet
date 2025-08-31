import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InputField from './InputField';

interface MultilineInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: any;
}

const MultilineInput: React.FC<MultilineInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  icon,
  containerStyle,
}) => {
  return (
    <View style={containerStyle}>
      <InputField
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={true}
        leftIcon={icon}
        error={error}
        inputStyle={{ minHeight: 80, textAlignVertical: 'top' }}
      />
    </View>
  );
};

export default MultilineInput;
