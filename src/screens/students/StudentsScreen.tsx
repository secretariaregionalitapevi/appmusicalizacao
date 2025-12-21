/**
 * Tela de listagem de alunos
 */
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminLayout, EmptyState, DashboardCard, Button } from '@/components/common';
import { supabase } from '@/api/supabase';
import { spacing } from '@/theme';
import { useAuth } from '@/hooks/useAuth';

export const StudentsScreen: React.FC = () => {
  const { profile } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Definir título da página na web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Alunos | CCB';
    }
  }, []);

  // Carregar alunos
  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('musicalizacao_students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Garantir que is_active seja boolean
      // Primeiro, vamos ver o que está vindo do banco
      console.log('🔍 Dados brutos do banco:', data?.map((s: any) => ({
        nome: s.full_name,
        is_active: s.is_active,
        tipo: typeof s.is_active,
      })));
      
      const normalizedData = (data || []).map((student: any) => {
        // Normalizar is_active: pode vir como boolean, string, ou null
        let isActive: boolean;
        
        // Se já é boolean, usar diretamente
        if (typeof student.is_active === 'boolean') {
          isActive = student.is_active;
        }
        // Se é string 'true' ou número 1, converter para true
        else if (student.is_active === 'true' || student.is_active === 1) {
          isActive = true;
        }
        // Qualquer outro valor (false, 'false', 0, null, undefined) é false
        else {
          isActive = false;
        }
        
        return {
          ...student,
          is_active: isActive,
        };
      });
      
      setStudents(normalizedData);
      
      const ativos = normalizedData.filter((s: any) => s.is_active === true).length;
      const inativos = normalizedData.filter((s: any) => s.is_active === false).length;
      
      console.log('📊 Alunos carregados:', {
        total: normalizedData.length,
        ativos: ativos,
        inativos: inativos,
        detalhes: normalizedData.map((s: any) => ({ 
          nome: s.full_name, 
          is_active_original: s.is_active,
          is_active_normalizado: s.is_active === true 
        })),
      });
      
      console.log('🔍 Verificação detalhada:', normalizedData.map((s: any) => ({
        nome: s.full_name,
        is_active: s.is_active,
        tipo: typeof s.is_active,
        igual_a_true: s.is_active === true,
        igual_a_false: s.is_active === false,
      })));
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const activeStudents = students.filter((s: any) => {
    // Garantir que is_active seja tratado como boolean
    return s.is_active === true;
  }).length;

  // Filtrar alunos baseado na busca
  const filteredStudents = students.filter((student) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.full_name?.toLowerCase().includes(query) ||
      student.responsible_name?.toLowerCase().includes(query) ||
      student.responsible_phone?.includes(query) ||
      student.regional?.toLowerCase().includes(query) ||
      student.local?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <AdminLayout title="Cadastro de Alunos" currentScreen="Students" showPageTitle={false}>
      {/* Título da Página */}
      <Text style={styles.pageTitle}>Cadastro de Alunos</Text>

      {/* Cards de Dashboard */}
      <View style={styles.dashboardCards}>
        <View style={styles.dashboardCardsRow}>
          <View style={styles.dashboardCardContainer}>
            <DashboardCard
              title="Total de Alunos"
              icon="people"
              iconColor="#033D60"
              statusTitle={`${students.length} aluno${students.length !== 1 ? 's' : ''} cadastrado${students.length !== 1 ? 's' : ''}`}
              statusDescription="Alunos registrados no sistema"
              statusType="info"
            />
          </View>
          <View style={styles.dashboardCardContainer}>
            <DashboardCard
              title="Alunos Ativos"
              icon="checkmark-circle"
              iconColor="#033D60"
              statusTitle={`${activeStudents} aluno${activeStudents !== 1 ? 's' : ''} ativo${activeStudents !== 1 ? 's' : ''}`}
              statusDescription={
                activeStudents > 0
                  ? 'Alunos com matrícula ativa'
                  : 'Nenhum aluno ativo no momento'
              }
              statusType={activeStudents > 0 ? 'success' : 'info'}
            />
          </View>
        </View>
      </View>

      {/* Botão Criar Novo Aluno */}
      {(profile?.role === 'administrador' || profile?.role === 'instrutor' || profile?.role === 'coordenador') && (
        <View style={styles.createButtonContainer}>
          <Button
            title="+ Novo Aluno"
            onPress={() => setShowCreateModal(true)}
            style={styles.createButton}
          />
        </View>
      )}

      {/* Barra de Busca */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Busque pelo nome do aluno, responsável ou telefone"
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
      </View>

      {/* Lista de Alunos */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando alunos...</Text>
        </View>
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          title={searchQuery ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
          message={
            searchQuery
              ? "Tente ajustar os termos de busca."
              : "Os alunos aparecerão aqui quando forem cadastrados."
          }
        />
      ) : (
        <ScrollView style={styles.studentsList} showsVerticalScrollIndicator={false}>
          {filteredStudents.map((student) => (
            <TouchableOpacity key={student.id} style={styles.studentCard}>
              <View style={styles.studentCardHeader}>
                <View style={styles.studentCardTitleContainer}>
                  <Text style={styles.studentCardTitle}>{student.full_name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { 
                        backgroundColor: (student.is_active === true || student.is_active === 'true' || student.is_active === 1) 
                          ? '#10B981' 
                          : '#ed5565' 
                      },
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>
                      {(student.is_active === true || student.is_active === 'true' || student.is_active === 1) 
                        ? 'Ativo' 
                        : 'Inativo'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                  <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.studentCardContent}>
                <View style={styles.studentInfoRow}>
                  <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                  <Text style={styles.studentInfoText}>
                    {formatDate(student.birth_date)} ({calculateAge(student.birth_date)} anos)
                  </Text>
                </View>
                <View style={styles.studentInfoRow}>
                  <Ionicons name="person-outline" size={16} color="#6B7280" />
                  <Text style={styles.studentInfoText}>
                    Responsável: {student.responsible_name}
                  </Text>
                </View>
                <View style={styles.studentInfoRow}>
                  <Ionicons name="call-outline" size={16} color="#6B7280" />
                  <Text style={styles.studentInfoText}>{student.responsible_phone}</Text>
                </View>
                <View style={styles.studentInfoRow}>
                  <Ionicons name="location-outline" size={16} color="#6B7280" />
                  <Text style={styles.studentInfoText}>
                    {student.local} - {student.regional}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Modal Criar Novo Aluno */}
      {/* TODO: Implementar modal de criação de aluno */}
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
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  searchBarContainer: {
    marginBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: spacing.md,
    minHeight: 48,
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
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: spacing.sm,
    outlineStyle: 'none',
    ...(Platform.OS === 'web' ? {
      // @ts-ignore
      outline: 'none',
      border: 'none',
      boxShadow: 'none',
    } : {}),
  },
  studentsList: {
    flex: 1,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
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
  studentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  studentCardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  studentCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  moreButton: {
    padding: spacing.xs,
  },
  studentCardContent: {
    gap: spacing.sm,
  },
  studentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  studentInfoText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  createButtonContainer: {
    marginBottom: spacing.lg,
  },
  createButton: {
    backgroundColor: '#033D60',
  },
});

