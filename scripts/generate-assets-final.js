/**
 * Script para gerar assets PNG reais usando Jimp
 */
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

// Cores do tema (RGB)
const PRIMARY_COLOR = 0x1976D2FF; // #1976D2 com alpha
const WHITE = 0xFFFFFFFF;

async function createImage(filename, width, height, backgroundColor, text = '') {
  try {
    // Criar nova imagem
    const image = new Jimp(width, height, backgroundColor);
    
    // Adicionar texto se fornecido e se a imagem for grande o suficiente
    if (text && width >= 200) {
      try {
        // Carregar fonte
        const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
        const textWidth = Jimp.measureText(font, text);
        const textHeight = Jimp.measureTextHeight(font, text);
        const x = Math.floor((width - textWidth) / 2);
        const y = Math.floor((height - textHeight) / 2);
        image.print(font, x, y, text);
      } catch (fontError) {
        // Se não conseguir carregar fonte, continua sem texto
        console.log(`  (imagem criada sem texto)`);
      }
    }
    
    // Salvar arquivo
    const filePath = path.join(__dirname, '..', 'assets', filename);
    await image.writeAsync(filePath);
    console.log(`✓ Criado: ${filename} (${width}x${height})`);
    return true;
  } catch (error) {
    console.error(`✗ Erro ao criar ${filename}:`, error.message);
    return false;
  }
}

async function generateAssets() {
  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  console.log('Gerando assets PNG...\n');

  const results = await Promise.all([
    createImage('icon.png', 1024, 1024, PRIMARY_COLOR, 'CCB'),
    createImage('splash.png', 2048, 2048, PRIMARY_COLOR),
    createImage('adaptive-icon.png', 1024, 1024, PRIMARY_COLOR, 'CCB'),
    createImage('favicon.png', 32, 32, PRIMARY_COLOR),
  ]);

  const successCount = results.filter(r => r).length;
  console.log(`\n✓ ${successCount}/4 assets criados com sucesso!`);
  
  if (successCount < 4) {
    console.log('\nNota: Alguns assets podem ter falhado. Os arquivos SVG podem ser usados temporariamente.');
  }
}

generateAssets().catch(console.error);

