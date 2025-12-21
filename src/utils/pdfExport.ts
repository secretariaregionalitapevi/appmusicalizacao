/**
 * Utilitários para exportação de PDF e impressão
 */

/**
 * Exporta o conteúdo HTML para PDF usando a API de impressão do navegador
 */
export const exportToPDF = (contentId: string, filename: string = 'relatorio.pdf') => {
  if (typeof window === 'undefined') return;

  const content = document.getElementById(contentId) || document.querySelector(`[nativeID="${contentId}"]`);
  if (!content) {
    console.error('Conteúdo não encontrado para exportação');
    return;
  }

  // Criar uma nova janela para impressão
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita pop-ups para exportar o PDF');
    return;
  }

  // Estilos para impressão
  const styles = `
    <style>
      @media print {
        @page {
          margin: 20mm;
          size: A4;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12pt;
          color: #000;
          background: #fff;
        }
        .no-print {
          display: none !important;
        }
      }
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        color: #333;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f5f5f5;
        font-weight: bold;
      }
      .header {
        margin-bottom: 30px;
        border-bottom: 2px solid #333;
        padding-bottom: 20px;
      }
      .footer {
        margin-top: 30px;
        border-top: 1px solid #ddd;
        padding-top: 20px;
        font-size: 10pt;
        color: #666;
      }
    </style>
  `;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <meta charset="utf-8">
        ${styles}
      </head>
      <body>
        ${content.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  // Aguardar o conteúdo carregar e então imprimir
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

/**
 * Imprime o conteúdo diretamente
 */
export const printContent = (contentId: string) => {
  if (typeof window === 'undefined') return;

  const content = document.getElementById(contentId) || document.querySelector(`[nativeID="${contentId}"]`);
  if (!content) {
    console.error('Conteúdo não encontrado para impressão');
    return;
  }

  // Criar uma nova janela para impressão
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita pop-ups para imprimir');
    return;
  }

  // Estilos para impressão
  const styles = `
    <style>
      @media print {
        @page {
          margin: 20mm;
          size: A4;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12pt;
          color: #000;
          background: #fff;
        }
        .no-print {
          display: none !important;
        }
      }
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        color: #333;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f5f5f5;
        font-weight: bold;
      }
      .header {
        margin-bottom: 30px;
        border-bottom: 2px solid #333;
        padding-bottom: 20px;
      }
      .footer {
        margin-top: 30px;
        border-top: 1px solid #ddd;
        padding-top: 20px;
        font-size: 10pt;
        color: #666;
      }
    </style>
  `;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Relatório</title>
        <meta charset="utf-8">
        ${styles}
      </head>
      <body>
        ${content.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  // Aguardar o conteúdo carregar e então imprimir
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

