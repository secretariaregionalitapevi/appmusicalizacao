/**
 * Componente Select/Dropdown
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: string;
  icon?: React.ReactNode;
  options: SelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
  compact?: boolean; // Para campos compactos
  testID?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  icon,
  options,
  value,
  onValueChange,
  placeholder = 'Selecione...',
  error,
  helperText,
  required = false,
  containerStyle,
  compact = false,
  testID,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasError = Boolean(error);
  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        style={[
          styles.selectContainer,
          compact && styles.selectContainerCompact,
          hasError && styles.selectContainerError
        ]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.selectText, !selectedOption && styles.placeholderText]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>▼</Text>
        </View>
      </TouchableOpacity>
      {(error || helperText) && (
        <Text style={[styles.helperText, hasError && styles.helperTextError]}>
          {error || helperText}
        </Text>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    value === item.value && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === item.value && styles.selectedOptionText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  required: {
    color: colors.error.main,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background.paper,
    minHeight: 44,
  },
  selectContainerCompact: {
    minHeight: 40,
  },
  selectContainerError: {
    borderColor: colors.error.main,
  },
  iconContainer: {
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectText: {
    ...typography.body1,
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    color: colors.text.primary,
  },
  placeholderText: {
    color: colors.text.hint,
  },
  arrowContainer: {
    paddingRight: spacing.md,
    paddingLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  helperText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  helperTextError: {
    color: colors.error.main,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.paper,
    borderRadius: 8,
    width: '80%',
    maxHeight: '60%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    ...typography.body1,
    color: colors.text.primary,
  },
  selectedOptionText: {
    color: colors.primary.main,
    fontWeight: '600',
  },
});

