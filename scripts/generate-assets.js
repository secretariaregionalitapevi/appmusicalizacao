/**
 * Script para gerar assets básicos do aplicativo
 * Execute: node scripts/generate-assets.js
 */
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

// Cores do tema (RGB)
const PRIMARY_COLOR = { r: 25, g: 118, b: 210 }; // #1976D2
const WHITE = { r: 255, g: 255, b: 255 };

async function createImage(filename, width, height, backgroundColor, text = '') {
  try {
    // Criar nova imagem usando a API correta do Jimp
    const image = await new Jimp(width, height, backgroundColor);
    
    // Adicionar texto se fornecido
    if (text && width >= 200) {
      try {
        // Carregar fonte (usar fonte padrão do Jimp)
        const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
        const textWidth = Jimp.measureText(font, text);
        const textHeight = Jimp.measureTextHeight(font, text);
        const x = (width - textWidth) / 2;
        const y = (height - textHeight) / 2;
        image.print(font, x, y, text);
      } catch (fontError) {
        // Se não conseguir carregar fonte, apenas cria a imagem sem texto
        console.log(`  (sem texto para ${filename})`);
      }
    }
    
    // Salvar arquivo
    const filePath = path.join(__dirname, '..', 'assets', filename);
    await image.writeAsync(filePath);
    console.log(`✓ Criado: ${filename} (${width}x${height})`);
  } catch (error) {
    console.error(`✗ Erro ao criar ${filename}:`, error.message);
    // Fallback: criar SVG se PNG falhar
    createSVGFallback(filename, width, height, backgroundColor, text);
  }
}

function createSVGFallback(filename, width, height, backgroundColor, text = '') {
  const hexColor = `#${backgroundColor.r.toString(16).padStart(2, '0')}${backgroundColor.g.toString(16).padStart(2, '0')}${backgroundColor.b.toString(16).padStart(2, '0')}`;
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${hexColor}"/>
  ${text ? `<text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.floor(width / 6)}" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${text}</text>` : ''}
</svg>`;
  const filePath = path.join(__dirname, '..', 'assets', filename.replace('.png', '.svg'));
  fs.writeFileSync(filePath, svg);
  console.log(`✓ Criado fallback SVG: ${filename.replace('.png', '.svg')}`);
}

async function generateAssets() {
  // Criar diretório assets se não existir
  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  console.log('Gerando assets básicos...\n');

  try {
    // Icon (1024x1024)
    await createImage('icon.png', 1024, 1024, PRIMARY_COLOR, 'CCB');

    // Splash (2048x2048) - sem texto para ser mais limpo
    await createImage('splash.png', 2048, 2048, PRIMARY_COLOR);

    // Adaptive Icon (1024x1024)
    await createImage('adaptive-icon.png', 1024, 1024, PRIMARY_COLOR, 'CCB');

    // Favicon (32x32) - muito pequeno para texto
    await createImage('favicon.png', 32, 32, PRIMARY_COLOR);

    console.log('\n✓ Todos os assets foram criados com sucesso!');
    console.log('\nNota: Para produção, substitua estes placeholders por imagens PNG reais com o logo da CCB.');
  } catch (error) {
    console.error('\n✗ Erro ao gerar assets:', error);
    process.exit(1);
  }
}

generateAssets();
