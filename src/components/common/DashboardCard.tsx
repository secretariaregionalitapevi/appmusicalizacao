/**
 * Card reutilizável para dashboard administrativo
 * Baseado no design do HomeScreen
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/theme';

const isWeb = Platform.OS === 'web';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  statusTitle: string;
  statusDescription: string;
  statusType?: 'success' | 'warning' | 'info';
  filterOptions?: Array<{ label: string; value: string }>;
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  showNavigation?: boolean;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  icon,
  iconColor = '#9CA3AF',
  statusTitle,
  statusDescription,
  statusType = 'success',
  filterOptions,
  selectedFilter,
  onFilterChange,
  showNavigation = false,
  onNavigatePrev,
  onNavigateNext,
}) => {
  const getStatusColor = () => {
    switch (statusType) {
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'info':
        return '#3B82F6';
      default:
        return '#10B981';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>
        {(filterOptions || showNavigation) && (
          <View style={styles.cardHeaderRight}>
            {filterOptions && selectedFilter && (
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterButtonText}>{selectedFilter}</Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
            )}
            {showNavigation && (
              <View style={styles.navArrows}>
                <TouchableOpacity style={styles.navArrow} onPress={onNavigatePrev}>
                  <Ionicons name="chevron-back" size={20} color="#9CA3AF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navArrow} onPress={onNavigateNext}>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <View style={styles.statusIconContainer}>
          <View style={styles.statusIconCircle}>
            <Ionicons name={icon} size={48} color={iconColor} />
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={24} color={getStatusColor()} />
            </View>
          </View>
        </View>
        <Text style={styles.statusTitle}>{statusTitle}</Text>
        <Text style={styles.statusDescription}>{statusDescription}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.xl,
    ...(isWeb
      ? {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: spacing.xs,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  navArrows: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  navArrow: {
    padding: spacing.xs,
  },
  cardContent: {
    alignItems: 'center',
  },
  statusIconContainer: {
    marginBottom: spacing.lg,
  },
  statusIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

