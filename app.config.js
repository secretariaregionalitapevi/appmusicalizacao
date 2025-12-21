/**
 * Expo App Configuration
 * Lê variáveis do .env e injeta no extra
 * Otimizado para carregamento rápido
 */
// Carregar dotenv apenas se o arquivo existir (evita erro se não houver .env)
try {
  require('dotenv').config({ silent: true });
} catch (e) {
  // Ignorar erro se dotenv não estiver disponível
}

module.exports = {
  expo: {
    name: 'Musicalização Infantil CCB',
    slug: 'musicalizacao-infantil-ccb',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#1976D2',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.ccb.musicalizacaoinfantil',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#1976D2',
      },
      package: 'com.ccb.musicalizacaoinfantil',
      permissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
      output: 'dist',
    },
    plugins: [
      [
        'expo-image-picker',
        {
          photosPermission:
            'O aplicativo precisa acessar suas fotos para adicionar imagens de alunos e aulas.',
        },
      ],
    ],
    extra: {
      eas: {
        projectId: 'your-project-id',
      },
      // Injetar variáveis do .env (usar os mesmos nomes que o código espera)
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      // Também manter os nomes em maiúsculas para compatibilidade
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
      appEnv: process.env.APP_ENV || 'development',
    },
  },
};

