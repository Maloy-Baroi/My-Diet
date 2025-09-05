import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

interface DatePickerInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  maxDate?: Date;
  minDate?: Date;
  disabled?: boolean;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  maxDate = new Date(),
  minDate = new Date(1900, 0, 1),
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(() => {
    if (value) {
      try {
        return new Date(value);
      } catch (e) {
        return new Date();
      }
    }
    return new Date();
  });

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
      onChangeText(formattedDate);
    }
  };

  const showDatepicker = () => {
    setShowPicker(true);
  };

  const hideDatePicker = () => {
    setShowPicker(false);
  };

  const renderDatePicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showPicker}
          onRequestClose={hideDatePicker}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={hideDatePicker}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleChange}
                maximumDate={maxDate}
                minimumDate={minDate}
              />
            </View>
          </View>
        </Modal>
      );
    }

    return showPicker && (
      <DateTimePicker
        value={date}
        mode="date"
        display="default"
        onChange={handleChange}
        maximumDate={maxDate}
        minimumDate={minDate}
      />
    );
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.inputContainer,
          error && styles.errorInputContainer,
          disabled && styles.disabledInputContainer,
        ]}
        onPress={disabled ? undefined : showDatepicker}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="calendar-outline" 
          size={20} 
          color="#8E8E93" 
          style={styles.leftIcon}
        />
        
        <Text 
          style={[
            styles.dateText,
            !value && styles.placeholderText
          ]}
        >
          {value || placeholder || 'YYYY-MM-DD'}
        </Text>
        
        <Ionicons 
          name="chevron-down-outline" 
          size={16} 
          color="#8E8E93" 
          style={styles.rightIcon}
        />
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {renderDatePicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  errorInputContainer: {
    borderColor: '#FF3B30',
  },
  disabledInputContainer: {
    backgroundColor: '#F2F2F7',
    opacity: 0.6,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  placeholderText: {
    color: '#C7C7CC',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    alignItems: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default DatePickerInput;
