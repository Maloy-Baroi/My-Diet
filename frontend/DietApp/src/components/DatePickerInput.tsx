import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import InputField from './InputField';

interface DatePickerInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  containerStyle?: any;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  containerStyle,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(value ? new Date(value) : new Date());

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios');
    setDate(currentDate);
    
    // Format date as YYYY-MM-DD
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    onChangeText(formattedDate);
  };

  const showDatePicker = () => {
    setShowPicker(true);
  };

  return (
    <View style={containerStyle}>
      <TouchableOpacity onPress={showDatePicker}>
        <InputField
          label={label}
          placeholder={placeholder}
          value={value}
          onChangeText={() => {}} // Disabled direct text input
          leftIcon="calendar-outline"
          editable={false}
          error={error}
        />
      </TouchableOpacity>
      
      {showPicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()} // Can't select future dates
        />
      )}
    </View>
  );
};

export default DatePickerInput;
