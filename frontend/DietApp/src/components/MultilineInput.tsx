import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MultilineInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  maxLength?: number;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

const MultilineInput: React.FC<MultilineInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  maxLength,
  disabled = false,
  icon = 'document-text-outline',
}) => {
  const [showModal, setShowModal] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  
  const handleSave = () => {
    onChangeText(tempValue);
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
          error && styles.errorInputContainer,
          disabled && styles.disabledInputContainer,
        ]}
        onPress={disabled ? undefined : openModal}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={icon} 
          size={20} 
          color="#8E8E93" 
          style={styles.leftIcon}
        />
        
        {value ? (
          <Text 
            style={styles.valueText}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {value}
          </Text>
        ) : (
          <Text style={styles.placeholderText}>
            {placeholder}
          </Text>
        )}
        
        <Ionicons 
          name="create-outline" 
          size={20} 
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
            
            <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent}>
              <TextInput
                style={styles.modalInput}
                value={tempValue}
                onChangeText={setTempValue}
                placeholder={placeholder}
                placeholderTextColor="#C7C7CC"
                multiline
                autoFocus
                maxLength={maxLength}
              />
              
              {maxLength && (
                <Text style={styles.charCountText}>
                  {tempValue.length}/{maxLength}
                </Text>
              )}
            </ScrollView>
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
    minHeight: 50,
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
    flex: 1,
    fontSize: 16,
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
    height: '80%',
    maxHeight: 500,
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
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
  },
  modalInput: {
    fontSize: 16,
    color: '#1C1C1E',
    textAlignVertical: 'top',
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
  },
  charCountText: {
    fontSize: 12,
    color: '#8E8E93',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
});

export default MultilineInput;
