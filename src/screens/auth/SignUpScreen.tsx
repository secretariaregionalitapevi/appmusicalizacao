/**
 * Tela de Cadastro - Padrão Regional Itapevi
 * Baseado no design do SAC (Sistema Administrativo de Contagem)
 * Adaptado do APPNEW
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { showToast } from '@/utils/toast';
import { colors, spacing, typography } from '@/theme';
import { poloService } from '@/services/poloService';
import type { Polo } from '@/types/models';
import { Select } from '@/components/common';

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
};

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { signUp } = useAuth();

  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [polos, setPolos] = useState<Polo[]>([]);
  const [poloSelecionado, setPoloSelecionado] = useState<string>('');

  // Definir título da página na web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Cadastro | CCB';
    }
  }, []);

  // Carregar polos
  useEffect(() => {
    const loadPolos = async () => {
      try {
        console.log('🔄 Carregando polos...');
        const polosData = await poloService.getAllPolos();
        console.log('✅ Polos carregados:', polosData);
        console.log('📊 Quantidade de polos:', polosData.length);
        setPolos(polosData);
      } catch (error) {
        console.error('❌ Erro ao carregar polos:', error);
        // Usar fallback mesmo em caso de erro
        const fallbackPolos = [
          { id: '1', nome: 'Cotia', cidade: 'Cotia', regional: 'Itapevi', isActive: true, createdAt: '', updatedAt: '' },
          { id: '2', nome: 'Caucaia do Alto', cidade: 'Caucaia do Alto', regional: 'Itapevi', isActive: true, createdAt: '', updatedAt: '' },
          { id: '3', nome: 'Fazendinha', cidade: 'Fazendinha', regional: 'Itapevi', isActive: true, createdAt: '', updatedAt: '' },
          { id: '4', nome: 'Itapevi', cidade: 'Itapevi', regional: 'Itapevi', isActive: true, createdAt: '', updatedAt: '' },
          { id: '5', nome: 'Jandira', cidade: 'Jandira', regional: 'Itapevi', isActive: true, createdAt: '', updatedAt: '' },
          { id: '6', nome: 'Pirapora', cidade: 'Pirapora', regional: 'Itapevi', isActive: true, createdAt: '', updatedAt: '' },
          { id: '7', nome: 'Vargem Grande', cidade: 'Vargem Grande', regional: 'Itapevi', isActive: true, createdAt: '', updatedAt: '' },
        ];
        console.log('⚠️ Usando polos fallback:', fallbackPolos);
        setPolos(fallbackPolos);
      }
    };
    loadPolos();
  }, []);

  const handleSignUp = async () => {
    // Validações
    if (!nomeCompleto.trim() || !email.trim() || !password || !confirmPassword) {
      showToast.error('Campos obrigatórios', 'Preencha todos os campos obrigatórios.');
      return;
    }

    if (!poloSelecionado) {
      showToast.error('Polo obrigatório', 'Selecione o polo ao qual você pertence.');
      return;
    }

    if (password !== confirmPassword) {
      showToast.error('Senhas não coincidem', 'As senhas digitadas não são iguais.');
      return;
    }

    if (password.length < 6) {
      showToast.error('Senha muito curta', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast.error('Email inválido', 'Por favor, insira um email válido.');
      return;
    }

    setLoading(true);
    try {
      console.log('📝 Tentando criar conta:', { email, nomeCompleto, poloSelecionado });
      const result = await signUp(email.trim(), password, nomeCompleto.trim(), poloSelecionado);
      console.log('📦 Resultado do signUp:', {
        user: result.user ? 'existe' : 'null',
        error: result.error?.message,
        hasError: !!result.error,
      });

      // Verificar se há erro primeiro
      if (result.error) {
        let errorMessage = 'Ocorreu um erro ao criar sua conta.';
        const errorMsg = result.error.message || '';

        if (
          errorMsg.includes('already registered') ||
          errorMsg.includes('already exists') ||
          errorMsg.includes('User already registered')
        ) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login ou use outro email.';
        } else if (errorMsg.includes('Invalid email')) {
          errorMessage = 'Por favor, insira um email válido.';
        } else if (errorMsg.includes('Password should be at least')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        } else if (errorMsg.includes('Supabase não está configurado')) {
          errorMessage = 'Supabase não está configurado. Configure as variáveis SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env ou app.json.';
        } else if (errorMsg.includes('Tabela musicalizacao_profiles não encontrada')) {
          errorMessage = 'Tabela não encontrada. Execute as migrations do Supabase primeiro (arquivo supabase/migrations/001_initial_schema.sql).';
        } else if (
          errorMsg.includes('fetch') ||
          errorMsg.includes('network') ||
          errorMsg.includes('Failed to fetch') ||
          errorMsg.includes('conexão')
        ) {
          errorMessage = 'Erro de conexão. Verifique sua internet e se o Supabase está configurado corretamente.';
        } else if (
          errorMsg.includes('email de confirmação') ||
          errorMsg.includes('confirmation') ||
          errorMsg.includes('Verifique sua caixa de entrada')
        ) {
          // Caso especial: usuário criado mas precisa confirmar email
          showToast.info(
            'Verifique seu email',
            'Um email de confirmação foi enviado. Verifique sua caixa de entrada e clique no link para confirmar sua conta.'
          );
          setTimeout(() => {
            navigation.goBack();
          }, 4000);
          return;
        } else {
          errorMessage = errorMsg || 'Ocorreu um erro ao criar sua conta. Tente novamente.';
        }

        showToast.error('Erro no cadastro', errorMessage);
        console.error('Erro ao criar conta:', result.error);
        return;
      }

      // Se não há erro, sucesso! (mesmo que user seja null, pois fizemos logout)
      if (!result.error) {
        // Exibir toast de sucesso profissional
        showToast.success(
          'Conta criada com sucesso!',
          `Sua conta foi criada. Faça login para acessar o sistema.`
        );

        // Aguardar um pouco antes de navegar para dar tempo do usuário ver o toast
        setTimeout(() => {
          // Redirecionar para a tela de login usando reset para limpar o stack
          // Isso garante que não haja navegação para a página principal
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' as never }],
          });
        }, 2000);
        return;
      }

      // Caso não tratado: sem erro mas também sem usuário
      console.warn('⚠️ Resultado inesperado:', result);
      showToast.error('Erro', 'Não foi possível criar a conta. Tente novamente.');
    } catch (error) {
      console.error('Erro no cadastro:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro ao criar sua conta. Tente novamente.';
      showToast.error('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.loginWrap}>
          {/* Logo CCB */}
          <View style={styles.logoContainer}>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://congregacaocristanobrasil.org.br/')}
              activeOpacity={0.7}
            >
              <Image
                source={require('@/img/logo-ccb-light.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Título */}
          <Text style={styles.title}>Bem-vindos ao Sistema de Musicalização Infantil</Text>

          {/* Subtítulo */}
          <Text style={styles.leadText}>
            Sistema criado para facilitar a administração Musical da Congregação Cristã no Brasil
            {'\n'}
            <Text style={styles.boldText}>Regional Itapevi</Text>.
          </Text>

          <Text style={styles.subText}>Preencha os dados para criar sua conta</Text>

          {/* Formulário */}
          <View style={styles.card}>
            {/* Nome Completo */}
            <View style={styles.inputGroup}>
              <View style={styles.inputGroupText}>
                <FontAwesome5 name="user" size={16} color={colors.text.secondary} />
              </View>
              <TextInput
                style={styles.input}
                value={nomeCompleto}
                onChangeText={setNomeCompleto}
                placeholder="Nome completo"
                placeholderTextColor={colors.text.secondary}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <View style={styles.inputGroupText}>
                <FontAwesome5 name="envelope" size={16} color={colors.text.secondary} />
              </View>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="E-mail"
                placeholderTextColor={colors.text.secondary}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            {/* Senha */}
            <View style={styles.inputGroup}>
              <View style={styles.inputGroupText}>
                <FontAwesome5 name="lock" size={16} color={colors.text.secondary} />
              </View>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Senha (mínimo 6 caracteres)"
                placeholderTextColor={colors.text.secondary}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.togglePassword}
                onPress={() => setShowPassword(!showPassword)}
              >
                <FontAwesome5
                  name={showPassword ? 'eye-slash' : 'eye'}
                  size={16}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            {/* Confirmar Senha */}
            <View style={styles.inputGroup}>
              <View style={styles.inputGroupText}>
                <FontAwesome5 name="lock" size={16} color={colors.text.secondary} />
              </View>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmar senha"
                placeholderTextColor={colors.text.secondary}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.togglePassword}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <FontAwesome5
                  name={showConfirmPassword ? 'eye-slash' : 'eye'}
                  size={16}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            {/* Seleção de Polo */}
            <Select
              label="Polo"
              icon={<FontAwesome5 name="map-marker-alt" size={16} color={colors.text.secondary} />}
              options={polos.map((polo) => ({
                label: `${polo.nome} - ${polo.cidade}`,
                value: polo.id,
              }))}
              value={poloSelecionado}
              onValueChange={(value) => {
                console.log('📍 Polo selecionado:', value);
                setPoloSelecionado(value);
              }}
              placeholder="Escolha o polo"
              required
            />

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={Platform.OS === 'web' ? 0.85 : 0.6}
            >
              {loading ? (
                <Text style={styles.loginButtonText}>Criando conta...</Text>
              ) : (
                <View style={styles.loginButtonContent}>
                  <FontAwesome
                    name="user-plus"
                    size={12}
                    color={colors.primary.contrastText}
                    style={styles.loginButtonIcon}
                  />
                  <Text style={styles.loginButtonText}>CRIAR CONTA</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Já tem uma conta?</Text>
              <TouchableOpacity style={styles.registerButton} onPress={() => navigation.goBack()}>
                <Text style={styles.registerButtonText}>Faça login aqui</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Rodapé */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              <Text style={styles.footerBold}>©</Text> Aplicativo de Musicalização Infantil v1.0.0
              {'\n'}
              <TouchableOpacity
                onPress={() => Linking.openURL('https://congregacaocristanobrasil.org.br/')}
              >
                <Text style={styles.footerLink}>Congregação Cristã no Brasil</Text>
              </TouchableOpacity>
              {'\n'}
              <Text style={styles.footerBold}>Regional Itapevi</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  loginWrap: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingVertical: spacing.md,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logo: {
    width: 200,
    height: 120,
    marginVertical: spacing.sm,
  },
  title: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  leadText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  boldText: {
    fontWeight: '600',
  },
  subText: {
    fontSize: typography.body2.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background.paper,
    overflow: 'hidden',
    minHeight: 48,
  },
  inputGroupText: {
    backgroundColor: colors.background.paper,
    borderRightWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  input: {
    flex: 1,
    fontSize: typography.body1.fontSize,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    minHeight: 48,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  togglePassword: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#033d60', // Azul da CCB (igual ao APPNEW)
    borderRadius: 8,
    paddingVertical: Platform.OS === 'web' ? 10 : 12,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    minHeight: Platform.OS === 'web' ? 44 : 48,
    minWidth: 120,
    alignSelf: 'center',
    ...(Platform.OS === 'web'
      ? {
          background: 'linear-gradient(135deg, #033d60 0%, #022a47 100%)',
          boxShadow: '0 2px 8px rgba(3, 61, 96, 0.3)',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }
      : {
          shadowColor: '#033d60',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.4,
          shadowRadius: 6,
          elevation: 4,
        }),
  },
  loginButtonDisabled: {
    backgroundColor: colors.background.disabled,
    opacity: 0.6,
    ...(Platform.OS === 'web'
      ? {
          background: colors.background.disabled,
          boxShadow: 'none',
          cursor: 'not-allowed',
        }
      : {
          shadowOpacity: 0,
          elevation: 0,
        }),
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  loginButtonIcon: {
    marginRight: 0,
  },
  loginButtonText: {
    color: colors.primary.contrastText,
    fontSize: Platform.OS === 'web' ? 14 : 15,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: Platform.OS === 'web' ? 20 : 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  registerContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  registerText: {
    fontSize: typography.body2.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  registerButton: {
    paddingVertical: spacing.xs,
  },
  registerButtonText: {
    fontSize: typography.body2.fontSize,
    color: colors.primary.main,
    fontWeight: '500',
  },
  footer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerBold: {
    fontWeight: '600',
  },
  footerLink: {
    color: colors.primary.main,
    textDecorationLine: 'underline',
  },
  selectWeb: {
    flex: 1,
    fontSize: typography.body1.fontSize,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    minHeight: 48,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
    appearance: 'auto',
    WebkitAppearance: 'menulist',
    MozAppearance: 'menulist',
  },
  selectNative: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    minHeight: 48,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    justifyContent: 'center',
  },
  selectText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.primary,
  },
});

