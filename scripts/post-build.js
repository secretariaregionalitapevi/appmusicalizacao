/**
 * Script pós-build para corrigir o index.html gerado pelo Expo
 * e garantir que os caminhos estejam corretos para o Vercel
 * Também injeta variáveis de ambiente no HTML para acesso no runtime
 */
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html não encontrado em dist/');
  process.exit(1);
}

// Ler o index.html gerado pelo Expo
let html = fs.readFileSync(indexPath, 'utf8');

// Garantir que os caminhos sejam absolutos (começando com /)
html = html.replace(/src="\.\/_expo\//g, 'src="/_expo/');
html = html.replace(/src="\.\/assets\//g, 'src="/assets/');
html = html.replace(/href="\.\/_expo\//g, 'href="/_expo/');
html = html.replace(/href="\.\/assets\//g, 'href="/assets/');

// Atualizar o título se necessário
html = html.replace(
  '<title>Musicalização Infantil CCB</title>',
  '<title>CCB | Login</title>'
);

// Injetar variáveis de ambiente no HTML para acesso no runtime
// Isso permite que o código JavaScript no navegador acesse as variáveis
const envVars = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  APP_ENV: process.env.APP_ENV || 'production',
};

// Criar script para injetar variáveis no window
// IMPORTANTE: Este script deve ser executado ANTES de qualquer outro script
const envScript = `
<script>
  // Injetar variáveis de ambiente no window para acesso no runtime
  // CRÍTICO: Executar imediatamente, antes de qualquer outro código
  (function() {
    window.__ENV__ = ${JSON.stringify(envVars)};
    window._env_ = ${JSON.stringify(envVars)};
    
    // SEMPRE logar para debug (mesmo em produção)
    console.log('🔧 Environment variables injected:', {
      hasSupabaseUrl: !!window.__ENV__.SUPABASE_URL,
      hasSupabaseKey: !!window.__ENV__.SUPABASE_ANON_KEY,
      urlPreview: window.__ENV__.SUPABASE_URL ? window.__ENV__.SUPABASE_URL.substring(0, 40) + '...' : 'MISSING',
      keyPreview: window.__ENV__.SUPABASE_ANON_KEY ? window.__ENV__.SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'MISSING',
      isConfigured: !window.__ENV__.SUPABASE_URL.includes('placeholder') && 
                    !window.__ENV__.SUPABASE_ANON_KEY.includes('placeholder') &&
                    window.__ENV__.SUPABASE_URL !== '' &&
                    window.__ENV__.SUPABASE_ANON_KEY !== '',
      allKeys: Object.keys(window.__ENV__)
    });
    
    // Aviso se não estiver configurado
    if (!window.__ENV__.SUPABASE_URL || window.__ENV__.SUPABASE_URL === '' || window.__ENV__.SUPABASE_URL.includes('placeholder')) {
      console.error('❌ SUPABASE_URL não configurado! Configure no Vercel: Settings → Environment Variables');
    }
    if (!window.__ENV__.SUPABASE_ANON_KEY || window.__ENV__.SUPABASE_ANON_KEY === '' || window.__ENV__.SUPABASE_ANON_KEY.includes('placeholder')) {
      console.error('❌ SUPABASE_ANON_KEY não configurado! Configure no Vercel: Settings → Environment Variables');
    }
  })();
</script>
`;

// Inserir o script ANTES de qualquer outro script, preferencialmente no <head>
// Isso garante que as variáveis estejam disponíveis quando o código React carregar
if (html.includes('</head>')) {
  // Inserir antes do fechamento do </head>, mas depois de qualquer meta tag
  html = html.replace('</head>', `${envScript}</head>`);
} else if (html.includes('<head>')) {
  // Se tem <head> mas não tem </head>, inserir logo após <head>
  html = html.replace('<head>', `<head>${envScript}`);
} else if (html.includes('<body>')) {
  // Fallback: inserir no início do <body>
  html = html.replace('<body>', `<body>${envScript}`);
} else {
  // Último recurso: inserir no início do HTML
  html = envScript + html;
}

// Escrever o arquivo corrigido
fs.writeFileSync(indexPath, html, 'utf8');

console.log('✅ index.html corrigido com sucesso!');
console.log('🔧 Variáveis de ambiente injetadas:', {
  hasSupabaseUrl: !!envVars.SUPABASE_URL,
  hasSupabaseKey: !!envVars.SUPABASE_ANON_KEY,
  urlPreview: envVars.SUPABASE_URL ? envVars.SUPABASE_URL.substring(0, 40) + '...' : 'missing',
});


