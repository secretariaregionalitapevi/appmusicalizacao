import { Platform, Alert } from 'react-native';

// Importar Toast apenas para plataformas nativas (não web)
let Toast: any = null;
if (Platform.OS !== 'web') {
  try {
    Toast = require('react-native-toast-message').default;
  } catch (error) {
    console.warn('Toast não disponível:', error);
  }
}

// Função para obter SweetAlert2 dinamicamente (para web)
const getSwal = (): any => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  // Primeiro tentar usar Swal do window (carregado via CDN no index.html)
  if ((window as any).Swal && typeof (window as any).Swal.fire === 'function') {
    return (window as any).Swal;
  }

  // Fallback: tentar importar SweetAlert2 (como no APPNEW)
  try {
    const sweetalert2 = require('sweetalert2');
    return sweetalert2.default || sweetalert2;
  } catch (error) {
    console.warn('SweetAlert2 não disponível:', error);
    return null;
  }
};

// Carregar estilos customizados do SweetAlert2 (CSS já está no index.html)
if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Verificar se os estilos customizados já foram carregados
  if (!document.getElementById('sweetalert2-custom-styles')) {
    // Carregar fonte Inter do Google Fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preconnect';
    fontLink.href = 'https://fonts.googleapis.com';
    document.head.appendChild(fontLink);

    const fontLink2 = document.createElement('link');
    fontLink2.rel = 'preconnect';
    fontLink2.href = 'https://fonts.gstatic.com';
    fontLink2.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink2);

    const fontStyle = document.createElement('link');
    fontStyle.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    fontStyle.rel = 'stylesheet';
    document.head.appendChild(fontStyle);

    // 🚀 MELHORIA: Estilos customizados mais compactos e elegantes
    const customStyle = document.createElement('style');
    customStyle.id = 'sweetalert2-custom-styles';
    customStyle.textContent = `
      /* Toast (modo ultra-compacto e elegante) */
      .swal2-toast {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        border-radius: 8px !important;
        padding: 0.625rem 0.875rem !important;
        min-width: 240px !important;
        max-width: 320px !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        display: flex !important;
        align-items: center !important;
      }
      .swal2-toast .swal2-title {
        font-size: 13px !important;
        font-weight: 600 !important;
        color: #1f2937 !important;
        line-height: 1.3 !important;
        margin: 0 !important;
        padding: 0 !important;
        flex: 1 !important;
      }
      .swal2-toast .swal2-content {
        display: none !important; /* Ocultar conteúdo extra para manter compacto */
      }
      .swal2-toast .swal2-icon {
        width: 28px !important;
        height: 28px !important;
        margin: 0 0.625rem 0 0 !important;
        flex-shrink: 0 !important;
      }
      .swal2-toast .swal2-icon .swal2-success-ring {
        width: 28px !important;
        height: 28px !important;
      }
      .swal2-toast .swal2-icon .swal2-success-line-tip,
      .swal2-toast .swal2-icon .swal2-success-line-long {
        height: 2px !important;
      }
      .swal2-toast .swal2-icon.swal2-success {
        border-color: #10b981 !important;
      }
      .swal2-toast .swal2-icon.swal2-error {
        border-color: #ef4444 !important;
      }
      .swal2-toast .swal2-icon.swal2-info {
        border-color: #3b82f6 !important;
      }
      .swal2-toast .swal2-icon.swal2-warning {
        border-color: #f59e0b !important;
      }
      
      /* Modal Seantheme Style (padrão central) */
      .swal2-modal-seantheme {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        font-size: 15px !important;
        border-radius: 8px !important;
        padding: 1.5rem !important;
        max-width: 400px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
        border: 1px solid #e5e7eb !important;
      }
      
      .swal2-title-seantheme {
        font-size: 20px !important;
        font-weight: 600 !important;
        color: #1f2937 !important;
        margin-bottom: 0.75rem !important;
      }
      
      .swal2-content-seantheme {
        font-size: 14px !important;
        color: #6b7280 !important;
        line-height: 1.5 !important;
      }
      
      .swal2-confirm-seantheme {
        font-size: 14px !important;
        font-weight: 600 !important;
        padding: 0.5rem 1.5rem !important;
        border-radius: 6px !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      }
      
      /* Modal (para erros importantes) */
      .swal2-popup:not(.swal2-toast),
      .swal2-popup-error-elegant {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        font-size: 15px !important;
        border-radius: 16px !important;
        padding: 2rem !important;
        max-width: 420px !important;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
        border: none !important;
      }
      .swal2-popup:not(.swal2-toast) .swal2-title,
      .swal2-title-error-elegant {
        font-size: 20px !important;
        font-weight: 700 !important;
        color: #1f2937 !important;
        line-height: 1.3 !important;
        margin-bottom: 1rem !important;
        margin-top: 0 !important;
        padding: 0 !important;
        text-align: center !important;
      }
      .swal2-popup:not(.swal2-toast) .swal2-content,
      .swal2-content-error-elegant {
        font-size: 15px !important;
        font-weight: 400 !important;
        color: #6b7280 !important;
        line-height: 1.6 !important;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        padding: 0 !important;
        text-align: center !important;
      }
      /* Remover estilos do ícone padrão já que usamos HTML customizado */
      .swal2-popup-error-elegant .swal2-icon {
        display: none !important;
      }
      .swal2-popup:not(.swal2-toast) .swal2-confirm,
      .swal2-confirm-error-elegant {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        font-size: 15px !important;
        font-weight: 600 !important;
        padding: 0.75rem 2rem !important;
        border-radius: 10px !important;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3) !important;
        transition: all 0.2s ease !important;
        margin-top: 1.5rem !important;
        background-color: #dc2626 !important;
        border: none !important;
        min-width: 120px !important;
      }
      .swal2-popup:not(.swal2-toast) .swal2-confirm:hover,
      .swal2-confirm-error-elegant:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4) !important;
        background-color: #b91c1c !important;
      }
      .swal2-popup:not(.swal2-toast) .swal2-confirm:active,
      .swal2-confirm-error-elegant:active {
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(customStyle);
  }
}

export const showToast = {
  success: (title: string, message?: string) => {
    if (Platform.OS === 'web') {
      // 🚀 MODELO SEANTHEME: Modal central (não toast)
      const Swal = getSwal();
      if (Swal) {
        Swal.fire({
          icon: 'success',
          title: title,
          text: message || '',
          showConfirmButton: true,
          confirmButtonText: 'OK',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
          allowOutsideClick: true,
          allowEscapeKey: true,
          customClass: {
            popup: 'swal2-modal-seantheme',
            title: 'swal2-title-seantheme',
            content: 'swal2-content-seantheme',
            confirmButton: 'swal2-confirm-seantheme',
          },
        });
      } else {
        console.log(`✅ ${title}: ${message || ''}`);
      }
    } else if (Toast) {
      // 🚀 MELHORIA: Toast mobile ultra-compacto (uma linha)
      try {
        Toast.show({
          type: 'success',
          text1: finalMessage,
          text2: undefined, // Sempre undefined para manter compacto
          position: 'top',
          visibilityTime: 1500,
          autoHide: true,
          topOffset: Platform.OS === 'ios' ? 60 : 50,
          text1Style: { 
            fontSize: 13, 
            fontWeight: '600',
            fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
          },
        });
      } catch (toastError) {
        // Fallback se Toast falhar
        if (Platform.OS !== 'web') {
          Alert.alert('Sucesso', finalMessage);
        }
      }
    } else {
      // Fallback para iOS se Toast não estiver disponível
      if (Platform.OS === 'ios') {
        Alert.alert('Sucesso', finalMessage);
      }
    }
  },

  error: (title: string, message?: string) => {
    if (Platform.OS === 'web') {
      // 🚀 MODELO SEANTHEME: Modal central de erro
      const Swal = getSwal();
      if (Swal) {
        Swal.fire({
          icon: 'error',
          title: title,
          text: message || '',
          showConfirmButton: true,
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444',
          allowOutsideClick: true,
          allowEscapeKey: true,
          customClass: {
            popup: 'swal2-modal-seantheme',
            title: 'swal2-title-seantheme',
            content: 'swal2-content-seantheme',
            confirmButton: 'swal2-confirm-seantheme',
          },
        });
      } else {
        // Fallback para alert nativo
        console.error(`❌ ${title}: ${message || ''}`);
        if (typeof window !== 'undefined' && window.alert) {
          alert(`${title}\n${message || ''}`);
        }
      }
    } else if (Toast) {
      // 🚀 MELHORIA: Toast mobile mais compacto
      Toast.show({
        type: 'error',
        text1: title,
        text2: message,
        position: 'top',
        visibilityTime: 3500,
        autoHide: true,
        topOffset: Platform.OS === 'ios' ? 50 : 40,
        text1Style: { 
          fontSize: 14, 
          fontWeight: '600',
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        },
        text2Style: { 
          fontSize: 12,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        },
      });
    } else {
      Alert.alert(title, message || '');
    }
  },

  info: (title: string, message?: string) => {
    if (Platform.OS === 'web') {
      // 🚀 MODELO SEANTHEME: Modal central de info
      const Swal = getSwal();
      if (Swal) {
        Swal.fire({
          icon: 'info',
          title: title,
          text: message || '',
          showConfirmButton: true,
          confirmButtonText: 'OK',
          confirmButtonColor: '#3b82f6',
          timer: 2500,
          timerProgressBar: true,
          allowOutsideClick: true,
          allowEscapeKey: true,
          customClass: {
            popup: 'swal2-modal-seantheme',
            title: 'swal2-title-seantheme',
            content: 'swal2-content-seantheme',
            confirmButton: 'swal2-confirm-seantheme',
          },
        });
      } else {
        // Fallback para console
        console.info(`ℹ️ ${title}: ${message || ''}`);
      }
    } else if (Toast) {
      // 🚀 MELHORIA: Toast mobile mais compacto
      Toast.show({
        type: 'info',
        text1: title,
        text2: message,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: Platform.OS === 'ios' ? 50 : 40,
        text1Style: { 
          fontSize: 14, 
          fontWeight: '600',
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        },
        text2Style: { 
          fontSize: 12,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        },
      });
    } else {
      Alert.alert(title, message || '');
    }
  },

  warning: (title: string, message?: string) => {
    if (Platform.OS === 'web') {
      // 🚀 MODELO SEANTHEME: Modal central de warning
      const Swal = getSwal();
      if (Swal) {
        Swal.fire({
          icon: 'warning',
          title: title,
          text: message || '',
          showConfirmButton: true,
          confirmButtonText: 'OK',
          confirmButtonColor: '#f59e0b',
          timer: 3000,
          timerProgressBar: true,
          allowOutsideClick: true,
          allowEscapeKey: true,
          customClass: {
            popup: 'swal2-modal-seantheme',
            title: 'swal2-title-seantheme',
            content: 'swal2-content-seantheme',
            confirmButton: 'swal2-confirm-seantheme',
          },
        });
      } else {
        // Fallback para console
        console.warn(`⚠️ ${title}: ${message || ''}`);
        if (typeof window !== 'undefined' && window.alert) {
          alert(`${title}\n${message || ''}`);
        }
      }
    } else if (Toast) {
      // 🚀 MELHORIA: Toast mobile mais compacto
      Toast.show({
        type: 'info',
        text1: title,
        text2: message,
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: Platform.OS === 'ios' ? 50 : 40,
        text1Style: { 
          fontSize: 14, 
          fontWeight: '600',
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        },
        text2Style: { 
          fontSize: 12,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        },
      });
    } else {
      Alert.alert(title, message || '');
    }
  },

  // 🚀 NOVO: Toast de progresso compacto para envio de registros
  progress: (title: string, message?: string) => {
    if (Platform.OS === 'web') {
      const Swal = getSwal();
      if (Swal) {
        Swal.fire({
          icon: 'info',
          title: title,
          text: message || 'Aguarde...',
          timer: 15000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          width: 'auto',
          padding: '0.75rem 1rem',
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: {
            popup: 'swal2-toast',
            title: 'swal2-toast-title',
            content: 'swal2-toast-content',
          },
          didOpen: () => {
            Swal.showLoading();
          },
        });
      }
    } else if (Toast) {
      // 🚀 MELHORIA: Toast mobile mais compacto
      Toast.show({
        type: 'info',
        text1: title,
        text2: message || 'Aguarde...',
        position: 'top',
        visibilityTime: 15000,
        autoHide: false,
        topOffset: Platform.OS === 'ios' ? 60 : 50,
        text1Style: { 
          fontSize: 14, 
          fontWeight: '600',
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        },
        text2Style: { 
          fontSize: 12,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        },
      });
    }
  },

  // 🚀 NOVO: Fechar toast de progresso
  hide: () => {
    if (Platform.OS === 'web') {
      const Swal = getSwal();
      if (Swal) {
        Swal.close();
      }
    } else if (Toast) {
      Toast.hide();
    }
  },
};
