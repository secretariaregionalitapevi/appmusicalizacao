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
const envScript = `
<script>
  // Injetar variáveis de ambiente no window para acesso no runtime
  window.__ENV__ = ${JSON.stringify(envVars)};
  window._env_ = ${JSON.stringify(envVars)};
  
  // Log de debug (apenas em desenvolvimento)
  if (window.__ENV__.APP_ENV === 'development') {
    console.log('🔧 Environment variables loaded:', {
      hasSupabaseUrl: !!window.__ENV__.SUPABASE_URL,
      hasSupabaseKey: !!window.__ENV__.SUPABASE_ANON_KEY,
      urlPreview: window.__ENV__.SUPABASE_URL ? window.__ENV__.SUPABASE_URL.substring(0, 40) + '...' : 'missing',
      isConfigured: !window.__ENV__.SUPABASE_URL.includes('placeholder') && 
                    !window.__ENV__.SUPABASE_ANON_KEY.includes('placeholder')
    });
  }
</script>
`;

// Inserir o script antes do fechamento do </head> ou no início do <body>
if (html.includes('</head>')) {
  html = html.replace('</head>', `${envScript}</head>`);
} else if (html.includes('<body>')) {
  html = html.replace('<body>', `<body>${envScript}`);
} else {
  // Se não encontrar head ou body, inserir no início
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


