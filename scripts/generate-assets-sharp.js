/**
 * Script para gerar assets PNG reais usando Sharp
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Cores do tema
const PRIMARY_COLOR = '#1976D2';

async function createImage(filename, width, height, backgroundColor, text = '') {
  try {
    // Criar SVG com texto
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
`;
    
    if (text && width >= 200) {
      const fontSize = Math.floor(width / 6);
      svg += `  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${text}</text>
`;
    }
    
    svg += `</svg>`;
    
    // Converter SVG para PNG usando Sharp
    const filePath = path.join(__dirname, '..', 'assets', filename);
    await sharp(Buffer.from(svg))
      .png()
      .toFile(filePath);
    
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

  console.log('Gerando assets PNG com Sharp...\n');

  const results = await Promise.all([
    createImage('icon.png', 1024, 1024, PRIMARY_COLOR, 'CCB'),
    createImage('splash.png', 2048, 2048, PRIMARY_COLOR),
    createImage('adaptive-icon.png', 1024, 1024, PRIMARY_COLOR, 'CCB'),
    createImage('favicon.png', 32, 32, PRIMARY_COLOR),
  ]);

  const successCount = results.filter(r => r).length;
  console.log(`\n✓ ${successCount}/4 assets PNG criados com sucesso!`);
}

generateAssets().catch(console.error);

