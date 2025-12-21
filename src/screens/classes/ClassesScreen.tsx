/**
 * Tela de gerenciamento de aulas - Dashboard Administrativo Profissional
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AdminLayout, EmptyState, Button, DashboardCard } from '@/components/common';
import { supabase } from '@/api/supabase';
import { useAuth } from '@/hooks/useAuth';
import { spacing } from '@/theme';
import type { ClassStatus } from '@/api/types/database.types';

interface Class {
  id: string;
  title: string;
  description: string | null;
  class_date: string;
  start_time: string;
  end_time: string;
  regional: string;
  local: string;
  instructor_id: string | null;
  observations: string | null;
  status: ClassStatus;
  created_at: string;
}

type ViewMode = 'list' | 'grid';
type FilterType = 'status' | 'date' | 'regional' | 'local';

interface AppliedFilter {
  type: FilterType;
  label: string;
  value: string;
}

export const ClassesScreen: React.FC = () => {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Definir título da página na web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Aulas | CCB';
    }
  }, []);

  // Carregar aulas
  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('musicalizacao_classes')
        .select('*')
        .order('class_date', { ascending: false })
        .order('start_time', { ascending: true });

      // Aplicar filtros
      appliedFilters.forEach((filter) => {
        if (filter.type === 'status') {
          query = query.eq('status', filter.value);
        } else if (filter.type === 'regional') {
          query = query.eq('regional', filter.value);
        } else if (filter.type === 'local') {
          query = query.eq('local', filter.value);
        }
      });

      // Aplicar busca
      if (debouncedSearchQuery.trim()) {
        const searchTerm = `%${debouncedSearchQuery.trim()}%`;
        // Usar múltiplas condições OR para busca mais robusta
        // Formato correto: campo.operador.valor,campo2.operador.valor2
        query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, appliedFilters]);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleRemoveFilter = (filterToRemove: AppliedFilter) => {
    setAppliedFilters(appliedFilters.filter((f) => f !== filterToRemove));
  };

  const handleAddFilter = (type: FilterType, label: string, value: string) => {
    // Remover filtro existente do mesmo tipo
    const newFilters = appliedFilters.filter((f) => f.type !== type);
    newFilters.push({ type, label, value });
    setAppliedFilters(newFilters);
    setShowFilters(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:mm
  };

  const getStatusColor = (status: ClassStatus) => {
    switch (status) {
      case 'scheduled':
        return '#3B82F6'; // Azul
      case 'completed':
        return '#10B981'; // Verde
      case 'cancelled':
        return '#EF4444'; // Vermelho
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: ClassStatus) => {
    switch (status) {
      case 'scheduled':
        return 'Agendada';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const canManageClasses = profile?.role === 'administrador' || 
                          profile?.role === 'instrutor' || 
                          profile?.role === 'coordenador';

  return (
    <AdminLayout title="Aulas" currentScreen="Classes" showPageTitle={false}>
      {/* Título da Página */}
      <Text style={styles.pageTitle}>Aulas</Text>

      {/* Cards de Dashboard */}
      <View style={styles.dashboardCards}>
        <View style={styles.dashboardCardsRow}>
          <View style={styles.dashboardCardContainer}>
            <DashboardCard
              title="Suas Aulas"
              icon="book"
              iconColor="#033D60"
              statusTitle="Aulas cadastradas"
              statusDescription={`Total de ${classes.length} aula${classes.length !== 1 ? 's' : ''} no sistema`}
              statusType="info"
            />
          </View>
          <View style={styles.dashboardCardContainer}>
            <DashboardCard
              title="Aulas Agendadas"
              icon="calendar"
              iconColor="#033D60"
              statusTitle={
                classes.filter((c) => c.status === 'scheduled').length > 0
                  ? `${classes.filter((c) => c.status === 'scheduled').length} aula${classes.filter((c) => c.status === 'scheduled').length !== 1 ? 's' : ''} agendada${classes.filter((c) => c.status === 'scheduled').length !== 1 ? 's' : ''}`
                  : 'Nenhuma aula agendada'
              }
              statusDescription={
                classes.filter((c) => c.status === 'scheduled').length > 0
                  ? 'Aulas programadas para os próximos dias'
                  : 'Não há aulas agendadas no momento'
              }
              statusType={classes.filter((c) => c.status === 'scheduled').length > 0 ? 'success' : 'info'}
            />
          </View>
        </View>
      </View>

      {/* Barra de Busca e Ações */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Busque pelo nome da aula, instrutor ou descrição"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            {...(Platform.OS === 'web' ? {
              // @ts-ignore
              onFocus: (e: any) => {
                if (e.target) {
                  e.target.style.outline = 'none';
                  e.target.style.border = 'none';
                  e.target.style.boxShadow = 'none';
                }
              },
            } : {})}
          />
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, showFilters && styles.actionButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="filter" size={18} color={showFilters ? '#FFFFFF' : '#6B7280'} />
            <Text style={[styles.actionButtonText, showFilters && styles.actionButtonTextActive]}>
              Filtros
            </Text>
          </TouchableOpacity>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons
                name="list"
                size={18}
                color={viewMode === 'list' ? '#FFFFFF' : '#6B7280'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons
                name="grid"
                size={18}
                color={viewMode === 'grid' ? '#FFFFFF' : '#6B7280'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Filtros Aplicados */}
      {appliedFilters.length > 0 && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersLabel}>Filtros Aplicados:</Text>
          <View style={styles.filtersList}>
            {appliedFilters.map((filter, index) => (
              <TouchableOpacity
                key={index}
                style={styles.filterTag}
                onPress={() => handleRemoveFilter(filter)}
              >
                <Text style={styles.filterTagText}>{filter.label}</Text>
                <Ionicons name="close-circle" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Botão Criar Nova Aula */}
      {canManageClasses && (
        <View style={styles.createButtonContainer}>
          <Button
            title="+ Nova Aula"
            onPress={() => setShowCreateModal(true)}
            style={styles.createButton}
          />
        </View>
      )}

      {/* Lista de Aulas */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando aulas...</Text>
        </View>
      ) : classes.length === 0 ? (
        <EmptyState
          title="Nenhuma aula encontrada"
          message={
            searchQuery || appliedFilters.length > 0
              ? 'Tente ajustar os filtros ou a busca.'
              : 'As aulas aparecerão aqui quando forem criadas.'
          }
        />
      ) : (
        <ScrollView style={styles.classesList} showsVerticalScrollIndicator={false}>
          {viewMode === 'list' ? (
            // Visualização em Lista
            <View style={styles.listView}>
              {classes.map((classItem) => (
                <TouchableOpacity key={classItem.id} style={styles.classCard}>
                  <View style={styles.classCardHeader}>
                    <View style={styles.classCardTitleContainer}>
                      <Text style={styles.classCardTitle}>{classItem.title}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(classItem.status) },
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>
                          {getStatusLabel(classItem.status)}
                        </Text>
                      </View>
                    </View>
                    {canManageClasses && (
                      <View style={styles.classCardActions}>
                        <TouchableOpacity style={styles.actionIcon}>
                          <Ionicons name="create-outline" size={20} color="#6B7280" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionIcon}>
                          <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  {classItem.description && (
                    <Text style={styles.classCardDescription} numberOfLines={2}>
                      {classItem.description}
                    </Text>
                  )}
                  <View style={styles.classCardInfo}>
                    <View style={styles.classCardInfoItem}>
                      <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                      <Text style={styles.classCardInfoText}>
                        {formatDate(classItem.class_date)}
                      </Text>
                    </View>
                    <View style={styles.classCardInfoItem}>
                      <Ionicons name="time-outline" size={16} color="#6B7280" />
                      <Text style={styles.classCardInfoText}>
                        {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                      </Text>
                    </View>
                    <View style={styles.classCardInfoItem}>
                      <Ionicons name="location-outline" size={16} color="#6B7280" />
                      <Text style={styles.classCardInfoText}>
                        {classItem.local} - {classItem.regional}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            // Visualização em Grid
            <View style={styles.gridView}>
              {classes.map((classItem) => (
                <TouchableOpacity key={classItem.id} style={styles.classCardGrid}>
                  <View style={styles.classCardGridHeader}>
                    <View
                      style={[
                        styles.statusBadgeSmall,
                        { backgroundColor: getStatusColor(classItem.status) },
                      ]}
                    >
                      <Text style={styles.statusBadgeTextSmall}>
                        {getStatusLabel(classItem.status)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.classCardGridTitle} numberOfLines={2}>
                    {classItem.title}
                  </Text>
                  <View style={styles.classCardGridInfo}>
                    <Text style={styles.classCardGridDate}>
                      {formatDate(classItem.class_date)}
                    </Text>
                    <Text style={styles.classCardGridTime}>
                      {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal de Filtros */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Filtro por Status */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Status da Aula</Text>
                <View style={styles.filterOptions}>
                  {(['scheduled', 'completed', 'cancelled'] as ClassStatus[]).map((status) => {
                    const isSelected = appliedFilters.some(
                      (f) => f.type === 'status' && f.value === status
                    );
                    return (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.filterOption,
                          isSelected && styles.filterOptionSelected,
                        ]}
                        onPress={() => {
                          if (isSelected) {
                            handleRemoveFilter(
                              appliedFilters.find((f) => f.type === 'status' && f.value === status)!
                            );
                          } else {
                            handleAddFilter('status', getStatusLabel(status), status);
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            isSelected && styles.filterOptionTextSelected,
                          ]}
                        >
                          {getStatusLabel(status)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Botões de Ação */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={() => {
                    setAppliedFilters([]);
                    setShowFilters(false);
                  }}
                >
                  <Text style={styles.modalActionButtonTextSecondary}>Limpar Filtros</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.modalActionButtonPrimary]}
                  onPress={() => setShowFilters(false)}
                >
                  <Text style={styles.modalActionButtonTextPrimary}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Criar Nova Aula */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Aula</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalMessage}>
                Funcionalidade de criação de aula será implementada em breve.
              </Text>
              <Button
                title="Fechar"
                onPress={() => setShowCreateModal(false)}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.xl,
  },
  dashboardCards: {
    marginBottom: spacing.xl,
  },
  dashboardCardsRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  dashboardCardContainer: {
    flex: Platform.OS === 'web' ? 1 : 1,
  },
  searchBarContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    ...(Platform.OS === 'web' ? { alignItems: 'center' } : { flexDirection: 'column' }),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web' ? {
      // @ts-ignore
      outline: 'none',
      boxShadow: 'none',
    } : {}),
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    outlineStyle: 'none',
    ...(Platform.OS === 'web' ? {
      // @ts-ignore
      outline: 'none',
      border: 'none',
      boxShadow: 'none',
    } : {}),
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  actionButtonTextActive: {
    color: '#FFFFFF',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewButton: {
    padding: spacing.sm,
    borderRadius: 6,
  },
  viewButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filtersContainer: {
    marginBottom: spacing.lg,
  },
  filtersLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: spacing.sm,
  },
  filtersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#374151',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  filterTagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  createButtonContainer: {
    marginBottom: spacing.lg,
  },
  createButton: {
    backgroundColor: '#10B981',
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  classesList: {
    flex: 1,
  },
  listView: {
    gap: spacing.md,
  },
  gridView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web'
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
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  classCardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  classCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  classCardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionIcon: {
    padding: spacing.xs,
  },
  classCardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  classCardInfo: {
    gap: spacing.sm,
  },
  classCardInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  classCardInfoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  classCardGrid: {
    width: Platform.OS === 'web' ? '31%' : '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web'
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
  classCardGridHeader: {
    marginBottom: spacing.sm,
  },
  statusBadgeSmall: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeTextSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  classCardGridTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.sm,
    minHeight: 40,
  },
  classCardGridInfo: {
    gap: spacing.xs,
  },
  classCardGridDate: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  classCardGridTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    ...(Platform.OS === 'web' && {
      maxWidth: 700,
      alignSelf: 'center',
      borderRadius: 20,
      margin: spacing.xl,
      width: '90%',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: spacing.md,
  },
  filterSection: {
    marginBottom: spacing.xl * 2,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.lg,
  },
  filterOptions: {
    gap: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    flex: Platform.OS === 'web' ? 0 : 1,
    minWidth: Platform.OS === 'web' ? 180 : '45%',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
  filterOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  filterOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionButtonPrimary: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  modalActionButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalActionButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
