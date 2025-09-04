import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NumericInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  min?: number;
  max?: number;
  unit?: string;
  disabled?: boolean;
  decimalPlaces?: number;
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
  disabled = false,
  decimalPlaces = 0,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const handleValueChange = (text: string) => {
    // Filter out non-numeric characters except decimal point
    let filteredText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = filteredText.split('.');
    if (parts.length > 2) {
      filteredText = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit decimal places
    if (parts.length > 1 && parts[1].length > decimalPlaces) {
      filteredText = parts[0] + '.' + parts[1].substring(0, decimalPlaces);
    }
    
    setTempValue(filteredText);
  };

  const handleSave = () => {
    let finalValue = tempValue;
    
    // Check if value is within range
    if (min !== undefined && parseFloat(tempValue) < min) {
      finalValue = min.toString();
    } else if (max !== undefined && parseFloat(tempValue) > max) {
      finalValue = max.toString();
    }
    
    onChangeText(finalValue);
    setShowModal(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setShowModal(false);
  };

  const openModal = () => {
    setTempValue(value);
    setShowModal(true);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInputContainer,
          error && styles.errorInputContainer,
          disabled && styles.disabledInputContainer,
        ]}
        onPress={disabled ? undefined : openModal}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="calculator-outline" 
          size={20} 
          color="#8E8E93" 
          style={styles.leftIcon}
        />
        
        <Text 
          style={[
            styles.valueText,
            !value && styles.placeholderText
          ]}
        >
          {value ? `${value}${unit ? ` ${unit}` : ''}` : placeholder}
        </Text>
        
        <Ionicons 
          name="chevron-down-outline" 
          size={16} 
          color="#8E8E93" 
          style={styles.rightIcon}
        />
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.modalInput}
                value={tempValue}
                onChangeText={handleValueChange}
                keyboardType="numeric"
                autoFocus
                selectTextOnFocus
                placeholder={placeholder}
                placeholderTextColor="#C7C7CC"
              />
              {unit && <Text style={styles.unitText}>{unit}</Text>}
            </View>
            
            {min !== undefined && max !== undefined && (
              <Text style={styles.rangeText}>
                Valid range: {min} - {max} {unit}
              </Text>
            )}
          </View>
        </View>
      </Modal>
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
  focusedInputContainer: {
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorInputContainer: {
    borderColor: '#FF3B30',
  },
  disabledInputContainer: {
    backgroundColor: '#F2F2F7',
    opacity: 0.6,
  },
  valueText: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  placeholderText: {
    color: '#C7C7CC',
  },
  leftIcon: {
    marginRight: 12,
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
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  cancelText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalInput: {
    fontSize: 24,
    fontWeight: '500',
    color: '#1C1C1E',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    width: 150,
  },
  unitText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 8,
  },
  rangeText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
});

export default NumericInput;
