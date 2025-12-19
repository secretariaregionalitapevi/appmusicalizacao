/**
 * Componente Input com ícone
 */
import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export interface InputWithIconProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
  testID?: string;
  rightIcon?: React.ReactNode;
}

export const InputWithIcon: React.FC<InputWithIconProps> = ({
  label,
  icon,
  rightIcon,
  error,
  helperText,
  required = false,
  containerStyle,
  style,
  testID,
  ...textInputProps
}) => {
  const hasError = Boolean(error);

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={[styles.inputContainer, hasError && styles.inputContainerError]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon, rightIcon && styles.inputWithRightIcon, style]}
          placeholderTextColor={colors.text.hint}
          {...textInputProps}
        />
        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </View>
      {(error || helperText) && (
        <Text style={[styles.helperText, hasError && styles.helperTextError]}>
          {error || helperText}
        </Text>
      )}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background.paper,
    minHeight: 44,
  },
  inputContainerError: {
    borderColor: colors.error.main,
  },
  iconContainer: {
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    paddingRight: spacing.md,
    paddingLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    ...typography.body1,
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    color: colors.text.primary,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  helperText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  helperTextError: {
    color: colors.error.main,
  },
});

