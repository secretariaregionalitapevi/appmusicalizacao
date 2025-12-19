/**
 * Script pós-build para corrigir o index.html gerado pelo Expo
 * e garantir que os caminhos estejam corretos para o Vercel
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

// Escrever o arquivo corrigido
fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ index.html corrigido com sucesso!');

