/**
 * Tela de Login - Padrão Regional Itapevi
 * Baseado no design do SAC (Sistema Administrativo de Contagem)
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Button, InputWithIcon, Select, Logo } from '@/components/common';
import { colors, spacing, typography } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import type { SelectOption } from '@/components/common/Select';

// Polos da Musicalização disponíveis (pode ser carregado do backend futuramente)
const POLOS: SelectOption[] = [
  { label: 'Selecione um polo...', value: '' },
  { label: 'Cotia', value: 'cotia' },
  { label: 'Caucaia do Alto', value: 'caucaia-do-alto' },
  { label: 'Fazendinha', value: 'fazendinha' },
  { label: 'Itapevi', value: 'itapevi' },
  { label: 'Jandira', value: 'jandira' },
  { label: 'Pirapora', value: 'pirapora' },
  { label: 'Vargem Grande Paulista', value: 'vargem-grande-paulista' },
];

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [polo, setPolo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();

  // Definir título da página na web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'CCB | Login';
      
      // Atualizar favicon
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/png';
      link.rel = 'shortcut icon';
      link.href = '/src/img/ccb.png';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim() || !polo) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Logo */}
            <Logo width={220} height={140} />

            {/* Título */}
            <Text style={styles.welcomeTitle}>Bem-vindos ao Sistema de Musicalização Infantil</Text>
            
            {/* Descrição */}
            <Text style={styles.description}>
              Sistema criado para facilitar a administração Musical da Congregação Cristã no Brasil Regional Itapevi.
            </Text>
            
            <Text style={styles.instruction}>
              Faça o login para acessar o Sistema
            </Text>

            {/* Card do Formulário */}
            <View style={styles.formCard}>
              <InputWithIcon
                label="Nome de usuário"
                value={email}
                onChangeText={setEmail}
                placeholder="Nome de usuário"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                icon={<MaterialIcons name="email" size={20} color={colors.text.secondary} />}
                required
                error={error && !email.trim() ? 'Campo obrigatório' : undefined}
              />

              <InputWithIcon
                label="Senha"
                value={password}
                onChangeText={setPassword}
                placeholder="Senha"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                icon={<MaterialIcons name="lock" size={20} color={colors.text.secondary} />}
                rightIcon={
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off' : 'eye'} 
                      size={20} 
                      color={colors.text.secondary} 
                    />
                  </TouchableOpacity>
                }
                required
                error={error && !password.trim() ? 'Campo obrigatório' : undefined}
              />

              <Select
                label="Polo da Musicalização"
                options={POLOS}
                value={polo}
                onValueChange={setPolo}
                placeholder="Selecione um polo..."
                icon={<Ionicons name="location" size={20} color={colors.text.secondary} />}
                required
                error={error && !polo ? 'Campo obrigatório' : undefined}
              />

              {error && email.trim() && password.trim() && polo && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              <Button
                title="LOGIN"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                fullWidth
                style={styles.loginButton}
                textStyle={styles.loginButtonText}
                rightIcon={<MaterialIcons name="send" size={18} color={colors.primary.contrastText} />}
              />
            </View>

            {/* Link para criar conta */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerQuestion}>Não tem uma conta?</Text>
              <TouchableOpacity style={styles.registerButton} activeOpacity={0.7}>
                <Text style={styles.registerButtonText}>Criar conta</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                <Text style={styles.footerBold}>©</Text> Aplicativo de Musicalização Infantil v1.0.0
                {'\n'}
                <Text 
                  style={styles.footerLink}
                  onPress={() => Linking.openURL('https://congregacaocristanobrasil.org.br/')}
                >
                  Congregação Cristã no Brasil
                </Text>
                {'\n'}
                <Text style={styles.footerBold}>Regional Itapevi</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: spacing.xl,
  },
  content: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      default: 'Arial',
    }),
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 20,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'Arial',
    }),
  },
  instruction: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'Arial',
    }),
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButton: {
    marginTop: spacing.md,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  errorText: {
    fontSize: 12,
    color: colors.error.main,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  registerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  registerQuestion: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'Arial',
    }),
  },
  registerButton: {
    backgroundColor: colors.background.paper,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      default: 'Arial',
    }),
  },
  footer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'Arial',
    }),
  },
  footerBold: {
    fontWeight: '600',
  },
  footerLink: {
    color: colors.primary.main,
    textDecorationLine: 'underline',
  },
});
