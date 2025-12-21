/**
 * Componente de Seleção de País com Bandeiras e Códigos
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, ViewStyle, Platform } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string; // Emoji da bandeira
}

// Lista de países principais (pode ser expandida)
const COUNTRIES: Country[] = [
  { code: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colômbia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', dialCode: '+51', flag: '🇵🇪' },
  { code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
  { code: 'ES', name: 'Espanha', dialCode: '+34', flag: '🇪🇸' },
  { code: 'AF', name: 'Afeganistão', dialCode: '+93', flag: '🇦🇫' },
  { code: 'AL', name: 'Albânia', dialCode: '+355', flag: '🇦🇱' },
  { code: 'DZ', name: 'Argélia', dialCode: '+213', flag: '🇩🇿' },
  { code: 'AD', name: 'Andorra', dialCode: '+376', flag: '🇦🇩' },
  { code: 'AO', name: 'Angola', dialCode: '+244', flag: '🇦🇴' },
  { code: 'AG', name: 'Antígua e Barbuda', dialCode: '+1268', flag: '🇦🇬' },
  // Adicione mais países conforme necessário
];

export interface CountrySelectorProps {
  value?: string; // Código do país (ex: 'BR')
  onSelect: (country: Country) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  compact?: boolean; // Para usar em campos compactos
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onSelect,
  placeholder = 'Selecione o país',
  containerStyle,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCountry = COUNTRIES.find(c => c.code === value) || COUNTRIES[0]; // Brasil como padrão

  const handleSelect = (country: Country) => {
    onSelect(country);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[styles.selectContainer, compact && styles.selectContainerCompact]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{selectedCountry.flag}</Text>
        <Text style={[styles.selectText, compact && styles.selectTextCompact]}>
          {selectedCountry.dialCode}
        </Text>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>▼</Text>
        </View>
      </TouchableOpacity>

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
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    value === item.code && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.optionFlag}>{item.flag}</Text>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionName}>{item.name}</Text>
                    <Text style={styles.optionDialCode}>{item.dialCode}</Text>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.list}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background.paper,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
  },
  selectContainerCompact: {
    minHeight: 44,
    paddingHorizontal: spacing.xs,
  },
  flag: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  selectText: {
    ...typography.body1,
    flex: 1,
    color: colors.text.primary,
    fontWeight: '500',
  },
  selectTextCompact: {
    fontSize: 14,
  },
  arrowContainer: {
    paddingLeft: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 10,
    color: colors.text.secondary,
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
    width: Platform.OS === 'web' ? 400 : '90%',
    maxHeight: '70%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  list: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
  },
  optionFlag: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionName: {
    ...typography.body1,
    color: colors.text.primary,
    flex: 1,
  },
  optionDialCode: {
    ...typography.body1,
    color: colors.text.secondary,
    fontWeight: '500',
  },
});

