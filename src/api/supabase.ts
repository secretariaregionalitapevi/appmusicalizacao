import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Valores padrão para desenvolvimento (substitua pelas suas credenciais reais)
// Tentar múltiplas fontes: window.__ENV__ (runtime web - Vercel) > Constants.expoConfig.extra > process.env > placeholder
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // 1. PRIMEIRO: Tentar window.__ENV__ ou window._env_ (runtime web - Vercel)
  // Isso é crítico porque no Vercel, as variáveis são injetadas no HTML durante o build
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const windowEnv = (window as any).__ENV__ || (window as any)._env_;
    if (windowEnv?.[key] && windowEnv[key] !== '') {
      return windowEnv[key];
    }
  }
  
  // 2. Tentar Constants.expoConfig.extra (build time - funciona em dev)
  const fromExpoConfig = Constants.expoConfig?.extra?.[key] || Constants.expoConfig?.extra?.[key.toLowerCase()];
  if (fromExpoConfig && fromExpoConfig !== '') {
    return fromExpoConfig;
  }
  
  // 3. Tentar process.env (build time - não funciona no runtime web)
  if (typeof process !== 'undefined' && process.env?.[key] && process.env[key] !== '') {
    return process.env[key];
  }
  
  // 4. Tentar NEXT_PUBLIC_ prefix (compatibilidade)
  if (typeof process !== 'undefined' && process.env?.[`NEXT_PUBLIC_${key}`] && process.env[`NEXT_PUBLIC_${key}`] !== '') {
    return process.env[`NEXT_PUBLIC_${key}`];
  }
  
  return defaultValue;
};

const supabaseUrl = getEnvVar('SUPABASE_URL', 'https://placeholder.supabase.co');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY', 'placeholder-key');

// Log para debug (sempre logar em produção também para debug no Vercel)
const debugInfo = {
  hasWindowEnv: Platform.OS === 'web' && typeof window !== 'undefined' && !!(window as any).__ENV__,
  hasExpoConfigUrl: !!Constants.expoConfig?.extra?.supabaseUrl,
  hasExpoConfigKey: !!Constants.expoConfig?.extra?.supabaseAnonKey,
  hasExpoConfigUrlUpper: !!Constants.expoConfig?.extra?.SUPABASE_URL,
  hasExpoConfigKeyUpper: !!Constants.expoConfig?.extra?.SUPABASE_ANON_KEY,
  hasProcessEnvUrl: !!(typeof process !== 'undefined' && process.env?.SUPABASE_URL),
  hasProcessEnvKey: !!(typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY),
  urlLength: supabaseUrl.length,
  keyLength: supabaseAnonKey.length,
  urlPreview: supabaseUrl.substring(0, 40) + '...',
  isConfigured: !supabaseUrl.includes('placeholder') && !supabaseAnonKey.includes('placeholder'),
  allExtraKeys: Constants.expoConfig?.extra ? Object.keys(Constants.expoConfig.extra) : [],
  windowEnvKeys: Platform.OS === 'web' && typeof window !== 'undefined' && (window as any).__ENV__ 
    ? Object.keys((window as any).__ENV__) 
    : [],
};

console.log('🔧 Supabase Config Debug:', debugInfo);

// Aviso em desenvolvimento se não houver credenciais
const hasConfig = 
  (Constants.expoConfig?.extra?.supabaseUrl || Constants.expoConfig?.extra?.SUPABASE_URL) &&
  (Constants.expoConfig?.extra?.supabaseAnonKey || Constants.expoConfig?.extra?.SUPABASE_ANON_KEY);

if (!hasConfig) {
  console.warn(
    '⚠️ Supabase credentials not configured. Using placeholder values.\n' +
    'Please configure SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.\n' +
    'The app.config.js will read from .env and inject into Constants.expoConfig.extra.\n' +
    'Make sure to RESTART the Expo server after creating/updating app.config.js!\n' +
    'Run: npm start -- --clear (to clear cache and restart)'
  );
  
  // Debug adicional
  console.log('🔍 Debug - Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
  console.log('🔍 Debug - process.env keys:', typeof process !== 'undefined' ? Object.keys(process.env).filter(k => k.includes('SUPABASE')) : 'process not available');
}

/**
 * Custom storage implementation using Expo SecureStore for secure token storage
 * No web, usa localStorage como fallback
 */
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        // No web, usar localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          return localStorage.getItem(key);
        }
        return null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      // Fallback para localStorage se SecureStore falhar
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      }
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        // No web, usar localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(key, value);
        }
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      // Fallback para localStorage se SecureStore falhar
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          console.warn('Erro ao salvar no localStorage:', e);
        }
      }
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        // No web, usar localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(key);
        }
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      // Fallback para localStorage se SecureStore falhar
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn('Erro ao remover do localStorage:', e);
        }
      }
    }
  },
};

/**
 * Supabase client configured for React Native
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Exportar função para verificar se Supabase está configurado
export const isSupabaseConfigured = (): boolean => {
  return !supabaseUrl.includes('placeholder') && !supabaseAnonKey.includes('placeholder') &&
         supabaseUrl !== '' && supabaseAnonKey !== '' &&
         supabaseUrl.startsWith('https://') && supabaseAnonKey.length > 20;
};

