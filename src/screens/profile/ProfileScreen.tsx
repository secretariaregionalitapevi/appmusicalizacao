/**
 * Tela de Perfil do Usuário - Edição de Dados com Abas
 */
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminLayout, Input, Button, Select } from '@/components/common';
import { CountrySelector } from '@/components/common/CountrySelector';
import type { Country } from '@/components/common/CountrySelector';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/api/supabase';
import { spacing } from '@/theme';
import { showToast } from '@/utils/toast';

type TabType = 'perfil' | 'pessoal' | 'profissional';

export const ProfileScreen: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('perfil');
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    // Perfil
    fullName: '',
    phone: '',
    phoneCountry: 'BR', // Código do país padrão (Brasil)
    phoneCommercial: '',
    phoneCommercialCountry: 'BR',
    regional: '',
    cidade: '',
    // Pessoal
    preferredName: '',
    gender: '',
    birthDate: '',
    maritalStatus: '',
    // Profissional
    experienceLevel: '',
    serviceTime: '',
    sector: '',
    education: '',
    institution: '',
    // Autorizações
    makeProfilePublic: false,
    receiveExternalPromotions: false,
  });

  // Definir título da página na web quando a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.title = 'Meu Perfil | CCB';
      }
    }, [])
  );

  // Também definir no mount para garantir
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Meu Perfil | CCB';
    }
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        regional: profile.regional || '',
        cidade: profile.cidade || '',
        preferredName: profile.fullName?.split(' ')[0] || '',
        gender: '',
        birthDate: '',
        maritalStatus: '',
        experienceLevel: '',
        serviceTime: '',
        sector: '',
        education: '',
        institution: '',
        makeProfilePublic: false,
        receiveExternalPromotions: false,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) {
      showToast.error('Erro ao carregar perfil');
      return;
    }

    if (!formData.fullName.trim()) {
      showToast.error('O nome completo é obrigatório');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('musicalizacao_profiles')
        .update({
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim() || null,
          regional: formData.regional.trim() || null,
          cidade: formData.cidade.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        showToast.error('Erro ao salvar alterações. Tente novamente.');
        return;
      }

      await refreshProfile();
      showToast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      showToast.error('Erro ao salvar alterações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        regional: profile.regional || '',
        cidade: profile.cidade || '',
        preferredName: profile.fullName?.split(' ')[0] || '',
        gender: '',
        birthDate: '',
        maritalStatus: '',
        experienceLevel: '',
        serviceTime: '',
        sector: '',
        education: '',
        institution: '',
        makeProfilePublic: false,
        receiveExternalPromotions: false,
      });
    }
  };

  if (!profile) {
    return (
      <AdminLayout title="Meu Perfil" currentScreen="Profile" showPageTitle={false}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </AdminLayout>
    );
  }

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'perfil', label: 'Perfil', icon: 'person' },
    { id: 'pessoal', label: 'Pessoal', icon: 'person-circle' },
    { id: 'profissional', label: 'Profissional', icon: 'briefcase' },
  ];

  return (
    <AdminLayout title="Meu Perfil" currentScreen="Profile" showPageTitle={false}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Título */}
        <Text style={styles.pageTitle}>Meu Perfil</Text>

        {/* Abas */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.id ? '#1F2937' : '#6B7280'}
              />
              <Text
                style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Conteúdo das Abas */}
        <View style={styles.card}>
          {activeTab === 'perfil' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person" size={20} color="#1F2937" />
                <Text style={styles.sectionTitle}>Perfil</Text>
              </View>

              <View style={styles.twoColumnLayout}>
                <View style={styles.column}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Nome *</Text>
                    <Input
                      value={formData.fullName.split(' ')[0] || ''}
                      onChangeText={(text) => {
                        const parts = formData.fullName.split(' ');
                        parts[0] = text;
                        setFormData({ ...formData, fullName: parts.join(' ') });
                      }}
                      placeholder="Digite seu nome"
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>E-mail</Text>
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyText}>{user?.email || 'Não informado'}</Text>
                      <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                    </View>
                    <Text style={styles.helperText}>
                      O e-mail não pode ser alterado aqui.
                    </Text>
                  </View>
                </View>

                <View style={styles.column}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Sobrenome *</Text>
                    <Input
                      value={formData.fullName.split(' ').slice(1).join(' ') || ''}
                      onChangeText={(text) => {
                        const firstName = formData.fullName.split(' ')[0] || '';
                        setFormData({ ...formData, fullName: `${firstName} ${text}`.trim() });
                      }}
                      placeholder="Digite seu sobrenome"
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Telefone</Text>
                    <Input
                      value={formData.phone}
                      onChangeText={(text) => setFormData({ ...formData, phone: text })}
                      placeholder="(00) 00000-0000"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Regional</Text>
                <Input
                  value={formData.regional}
                  onChangeText={(text) => setFormData({ ...formData, regional: text })}
                  placeholder="Digite sua regional"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Cidade</Text>
                <Input
                  value={formData.cidade}
                  onChangeText={(text) => setFormData({ ...formData, cidade: text })}
                  placeholder="Digite sua cidade"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Função</Text>
                <View style={styles.readOnlyField}>
                  <Text style={styles.readOnlyText}>
                    {profile.role === 'administrador' ? 'Administrador' :
                     profile.role === 'instrutor' ? 'Instrutor' :
                     profile.role === 'coordenador' ? 'Coordenador' :
                     'Usuário'}
                  </Text>
                  <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                </View>
              </View>
            </View>
          )}

          {activeTab === 'pessoal' && (
            <View style={styles.tabContent}>
              {/* Seção Contato */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="call" size={20} color="#1F2937" />
                  <Text style={styles.sectionTitle}>Contato</Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Celular</Text>
                  <View style={styles.phoneInputContainer}>
                    <CountrySelector
                      value={formData.phoneCountry}
                      onSelect={(country: Country) => setFormData({ ...formData, phoneCountry: country.code })}
                      compact
                      containerStyle={styles.countrySelector}
                    />
                    <View style={styles.phoneInputWrapper}>
                      <Input
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                        placeholder="(00) 00000-0000"
                        keyboardType="phone-pad"
                        containerStyle={styles.phoneInput}
                      />
                    </View>
                  </View>
                  <View style={styles.checkboxRowInline}>
                    <TouchableOpacity
                      style={styles.checkboxRowInline}
                      onPress={() => setFormData({ ...formData, receiveExternalPromotions: !formData.receiveExternalPromotions })}
                    >
                      <View style={[
                        styles.checkboxSmall,
                        formData.receiveExternalPromotions && styles.checkboxChecked
                      ]}>
                        {formData.receiveExternalPromotions && (
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        )}
                      </View>
                      <Text style={styles.checkboxLabelSmall}>
                        Promoções e eventos via SMS
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Telefone Comercial (Opcional)</Text>
                  <View style={styles.phoneInputContainer}>
                    <CountrySelector
                      value={formData.phoneCommercialCountry}
                      onSelect={(country: Country) => setFormData({ ...formData, phoneCommercialCountry: country.code })}
                      compact
                      containerStyle={styles.countrySelector}
                    />
                    <View style={styles.phoneInputWrapper}>
                      <Input
                        value={formData.phoneCommercial}
                        onChangeText={(text) => setFormData({ ...formData, phoneCommercial: text })}
                        placeholder="(00) 00000-0000"
                        keyboardType="phone-pad"
                        containerStyle={styles.phoneInput}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Seção Pessoal */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person-circle" size={20} color="#1F2937" />
                  <Text style={styles.sectionTitle}>Pessoal</Text>
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.labelWithHelp}>
                    <Text style={styles.label}>Como gostaria de ser chamado? (Opcional)</Text>
                    <Ionicons name="help-circle-outline" size={16} color="#6B7280" />
                  </View>
                  <Input
                    value={formData.preferredName}
                    onChangeText={(text) => setFormData({ ...formData, preferredName: text })}
                    placeholder="Digite como prefere ser chamado"
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Gênero</Text>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    placeholder="Selecione seu gênero"
                    options={[
                      { label: 'Masculino', value: 'male' },
                      { label: 'Feminino', value: 'female' },
                      { label: 'Prefiro não informar', value: 'other' },
                    ]}
                    containerStyle={styles.selectCompact}
                    compact
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Data de Nascimento</Text>
                  <Input
                    value={formData.birthDate}
                    onChangeText={(text) => setFormData({ ...formData, birthDate: text })}
                    placeholder="DD/MM/AAAA"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Estado Civil</Text>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}
                    placeholder="Selecione seu estado civil"
                    options={[
                      { label: 'Não Informado', value: 'not_informed' },
                      { label: 'Solteiro(a)', value: 'single' },
                      { label: 'Casado(a)', value: 'married' },
                      { label: 'Divorciado(a)', value: 'divorced' },
                      { label: 'Viúvo(a)', value: 'widowed' },
                    ]}
                  />
                </View>
              </View>
            </View>
          )}

          {activeTab === 'profissional' && (
            <View style={styles.tabContent}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="briefcase" size={20} color="#1F2937" />
                  <Text style={styles.sectionTitle}>Experiência</Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nível de Experiência</Text>
                  <Select
                    value={formData.experienceLevel}
                    onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
                    placeholder="Selecione o seu nível de experiência"
                    options={[
                      { label: 'Iniciante', value: 'beginner' },
                      { label: 'Intermediário', value: 'intermediate' },
                      { label: 'Avançado', value: 'advanced' },
                      { label: 'Especialista', value: 'expert' },
                    ]}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Tempo de Serviço</Text>
                  <Select
                    value={formData.serviceTime}
                    onValueChange={(value) => setFormData({ ...formData, serviceTime: value })}
                    placeholder="Selecione o tempo de serviço"
                    options={[
                      { label: 'Menos de 1 ano', value: 'less_than_1' },
                      { label: '1 a 3 anos', value: '1_to_3' },
                      { label: '3 a 5 anos', value: '3_to_5' },
                      { label: '5 a 10 anos', value: '5_to_10' },
                      { label: 'Mais de 10 anos', value: 'more_than_10' },
                    ]}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Setor</Text>
                  <Select
                    value={formData.sector}
                    onValueChange={(value) => setFormData({ ...formData, sector: value })}
                    placeholder="Selecione o seu setor"
                    options={[
                      { label: 'Musicalização Infantil', value: 'musicalizacao_infantil' },
                      { label: 'Canto Coral', value: 'canto_coral' },
                      { label: 'Instrumentos', value: 'instrumentos' },
                      { label: 'Teoria Musical', value: 'teoria_musical' },
                      { label: 'Administração', value: 'administracao' },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="school" size={20} color="#1F2937" />
                  <Text style={styles.sectionTitle}>Formação</Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Formação Escolar</Text>
                  <Select
                    value={formData.education}
                    onValueChange={(value) => setFormData({ ...formData, education: value })}
                    placeholder="Selecione sua formação"
                    options={[
                      { label: 'Ensino Fundamental', value: 'elementary' },
                      { label: 'Ensino Médio', value: 'high_school' },
                      { label: 'Graduação', value: 'graduation' },
                      { label: 'Pós-Graduação', value: 'post_graduation' },
                      { label: 'Mestrado', value: 'masters' },
                      { label: 'Doutorado', value: 'phd' },
                    ]}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Instituição</Text>
                  <Input
                    value={formData.institution}
                    onChangeText={(text) => setFormData({ ...formData, institution: text })}
                    placeholder="Digite o nome da instituição"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Autorizações */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="shield-checkmark" size={20} color="#1F2937" />
                  <Text style={styles.sectionTitle}>Autorizações e Privacidade</Text>
                </View>

                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setFormData({ ...formData, makeProfilePublic: !formData.makeProfilePublic })}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.makeProfilePublic && styles.checkboxChecked
                    ]}>
                      {formData.makeProfilePublic && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                    <View style={styles.checkboxContent}>
                      <Text style={styles.checkboxTitle}>Tornar Perfil Público</Text>
                      <Text style={styles.checkboxDescription}>
                        Ao selecionar esta opção, suas informações básicas (nome, e-mail e função)
                        estarão visíveis para outros usuários do sistema com permissões adequadas.
                        Esta opção facilita a comunicação e colaboração entre membros da equipe.
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setFormData({ ...formData, receiveExternalPromotions: !formData.receiveExternalPromotions })}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.receiveExternalPromotions && styles.checkboxChecked
                    ]}>
                      {formData.receiveExternalPromotions && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                    <View style={styles.checkboxContent}>
                      <Text style={styles.checkboxTitle}>Desejo receber divulgação de produtos externos</Text>
                      <Text style={styles.checkboxDescription}>
                        Ao selecionar esta opção, você receberá comunicados via sistema e e-mail
                        sobre oportunidades de produtos e serviços relacionados à musicalização e
                        atividades da instituição, incluindo cursos, eventos e materiais educacionais.
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Nota sobre LGPD */}
                <View style={styles.lgpdNote}>
                  <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                  <View style={styles.lgpdContent}>
                    <Text style={styles.lgpdTitle}>Proteção de Dados - LGPD</Text>
                    <Text style={styles.lgpdText}>
                      Este sistema está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                      {'\n\n'}
                      Os dados coletados são utilizados exclusivamente para fins de gestão e organização das atividades
                      de musicalização infantil da Congregação Cristã no Brasil. Não coletamos dados sensíveis como documentos
                      pessoais, informações de pagamento ou dados biométricos.
                      {'\n\n'}
                      Seus dados são tratados com segurança e confidencialidade, sendo utilizados apenas para:
                      {'\n'}
                      • Identificação e comunicação
                      {'\n'}
                      • Gestão de aulas e presenças
                      {'\n'}
                      • Relatórios administrativos internos
                      {'\n\n'}
                      Você tem direito a acessar, corrigir, excluir ou solicitar a portabilidade dos seus dados a qualquer momento.
                      Para exercer esses direitos, entre em contato com o administrador do sistema.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Botões de Ação */}
        <View style={styles.actions}>
          <Button
            title="Cancelar"
            onPress={handleCancel}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title="Salvar"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.xl,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: spacing.xs,
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }),
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#1F2937',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.xl,
    marginBottom: spacing.xl,
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
  tabContent: {
    gap: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  twoColumnLayout: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  column: {
    flex: Platform.OS === 'web' ? 1 : 1,
    gap: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.sm,
  },
  labelWithHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 48,
  },
  readOnlyText: {
    fontSize: 16,
    color: '#6B7280',
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  checkboxContainer: {
    marginBottom: spacing.xl,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  checkboxChecked: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  checkboxContent: {
    flex: 1,
  },
  checkboxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: spacing.sm,
  },
  checkboxDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  lgpdNote: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: spacing.lg,
  },
  lgpdContent: {
    flex: 1,
  },
  lgpdTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: spacing.sm,
  },
  lgpdText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: Platform.OS === 'web' ? 0 : 1,
    minWidth: Platform.OS === 'web' ? 120 : undefined,
  },
  saveButton: {
    flex: Platform.OS === 'web' ? 0 : 1,
    minWidth: Platform.OS === 'web' ? 120 : undefined,
  },
  selectCompact: {
    marginBottom: spacing.sm,
  },
  selectCompactContainer: {
    minHeight: 40,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  countrySelector: {
    width: 100,
    flexShrink: 0,
  },
  phoneInputWrapper: {
    flex: 1,
  },
  phoneInput: {
    marginBottom: 0,
  },
  checkboxRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  checkboxSmall: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  checkboxLabelSmall: {
    fontSize: 14,
    color: '#1F2937',
  },
});
