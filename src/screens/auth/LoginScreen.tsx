/**
 * Tela de Login - Padrão Regional Itapevi
 * Baseado no design do SAC (Sistema Administrativo de Contagem)
 * Adaptado do APPNEW
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Linking,
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { showToast } from '@/utils/toast';
import { colors, spacing, typography } from '@/theme';
import { isSupabaseConfigured } from '@/api/supabase';

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Register: undefined;
  Home: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  // Definir título da página na web quando a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.title = 'Login | CCB';
      }
    }, [])
  );

  // Também definir no mount para garantir
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Login | CCB';
    }
  }, []);


  const handleLogin = async () => {
    if (!email || !password) {
      showToast.error('Campos obrigatórios', 'Preencha e-mail e senha.');
      return;
    }

    // Verificar se Supabase está configurado
    if (!isSupabaseConfigured()) {
      showToast.error(
        'Erro de configuração',
        'As credenciais do Supabase não estão configuradas. Verifique as variáveis de ambiente no Vercel.'
      );
      return;
    }

    setLoading(true);
    try {
      console.log('Tentando fazer login...');
      await login(email.trim(), password);
      console.log('Login bem-sucedido, navegando...');
      
      // Navegar para a tela principal
      (navigation as any).navigate('Home');
    } catch (error) {
      console.error('Erro no login:', error);
      
      // Tratar diferentes tipos de erro
      let errorMessage = 'Ocorreu um erro inesperado';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Mensagens mais amigáveis para erros comuns
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e as configurações do Supabase.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'E-mail ou senha incorretos.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor, confirme seu e-mail antes de fazer login.';
        }
      }
      
      showToast.error('Erro no login', errorMessage);
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

          <Text style={styles.subText}>Faça o login para acessar o Sistema</Text>

          {/* Formulário */}
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <View style={styles.inputGroupText}>
                <Text style={styles.icon}>✉</Text>
              </View>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Nome de usuário"
                placeholderTextColor={colors.text.secondary}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputGroupText}>
                <Text style={styles.icon}>🔒</Text>
              </View>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Senha"
                placeholderTextColor={colors.text.secondary}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.togglePassword}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.toggleIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={Platform.OS === 'web' ? 0.85 : 0.6}
            >
              {loading ? (
                <Text style={styles.loginButtonText}>Carregando...</Text>
              ) : (
                <View style={styles.loginButtonContent}>
                  <FontAwesome
                    name="paper-plane"
                    size={12}
                    color={colors.primary.contrastText}
                    style={styles.loginButtonIcon}
                  />
                  <Text style={styles.loginButtonText}>LOGIN</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Não tem uma conta?</Text>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => {
                  console.log('🔘 Botão "Criar conta" clicado');
                  try {
                    navigation.navigate('SignUp');
                  } catch (error) {
                    console.error('❌ Erro ao navegar para SignUp:', error);
                    Alert.alert('Erro', 'Não foi possível abrir a tela de cadastro. Tente novamente.');
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.registerButtonText}>Criar conta</Text>
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
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    outline: 'none',
    cursor: 'pointer',
  } as any,
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
  inputGroupText: {
    backgroundColor: colors.background.paper,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    minHeight: 48,
  },
  icon: {
    textAlign: 'center',
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
    position: 'absolute',
    right: spacing.sm,
    padding: spacing.xs,
    zIndex: 2,
  },
  toggleIcon: {
    fontSize: typography.h6.fontSize,
    color: colors.text.secondary,
  },
  loginButton: {
    backgroundColor: '#033d60', // Azul da CCB (igual ao APPNEW)
    borderRadius: 8,
    paddingVertical: Platform.OS === 'web' ? 10 : 12,
    paddingHorizontal: spacing.xl, // Aumentado para ficar igual ao APPNEW
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    minHeight: Platform.OS === 'web' ? 44 : 48,
    minWidth: 120, // Largura mínima igual ao APPNEW
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
    marginVertical: spacing.md,
  },
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: typography.body2.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  registerButton: {
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  registerButtonText: {
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: typography.body2.fontSize,
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
});
