import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// Valores padrão para desenvolvimento (substitua pelas suas credenciais reais)
const supabaseUrl = 
  Constants.expoConfig?.extra?.supabaseUrl || 
  process.env.SUPABASE_URL || 
  'https://placeholder.supabase.co';
  
const supabaseAnonKey = 
  Constants.expoConfig?.extra?.supabaseAnonKey || 
  process.env.SUPABASE_ANON_KEY || 
  'placeholder-key';

// Aviso em desenvolvimento se não houver credenciais
if ((!Constants.expoConfig?.extra?.supabaseUrl && !process.env.SUPABASE_URL) ||
    (!Constants.expoConfig?.extra?.supabaseAnonKey && !process.env.SUPABASE_ANON_KEY)) {
  console.warn(
    '⚠️ Supabase credentials not configured. Using placeholder values.\n' +
    'Please configure SUPABASE_URL and SUPABASE_ANON_KEY in your .env file or app.json extra config.'
  );
}

/**
 * Custom storage implementation using Expo SecureStore for secure token storage
 */
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error getting item from SecureStore:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error setting item in SecureStore:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing item from SecureStore:', error);
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

