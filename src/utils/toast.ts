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
    // 🚀 MELHORIA: Sempre usar title como mensagem única (ultra-compacto)
    // Se message foi fornecido, combinar em uma linha
    const finalMessage = message ? `${title} ${message}` : title;
    
    if (Platform.OS === 'web') {
      // 🚀 MODELO APPNEW: Toast de sucesso com cores e configurações específicas
      const Swal = getSwal();
      if (Swal) {
        const config = {
          toast: true,
          position: 'top-end' as const,
          showConfirmButton: false,
          timer: 1200, // Otimizado para 1.2 segundos (modelo APPNEW)
          timerProgressBar: true, // Modelo APPNEW usa progressBar
          didOpen: (toast: any) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        };

        Swal.fire({
          ...config,
          icon: 'success',
          title: finalMessage,
          background: '#f0f9ff', // Cor de fundo do modelo APPNEW
          color: '#059669', // Cor do texto (verde)
          iconColor: '#059669' // Cor do ícone (verde)
        });
      } else {
        console.log(`✅ ${finalMessage}`);
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
      const Swal = getSwal();
      if (Swal) {
        // 🚀 MODELO APPNEW: Toast de erro com cores específicas
        const config = {
          toast: true,
          position: 'top-end' as const,
          showConfirmButton: false,
          timer: 1200, // Otimizado para 1.2 segundos (modelo APPNEW)
          timerProgressBar: true,
          didOpen: (toast: any) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        };

        Swal.fire({
          ...config,
          icon: 'error',
          title: message ? `${title} ${message}` : title,
          background: '#fef2f2', // Cor de fundo vermelho claro (modelo APPNEW)
          color: '#dc2626', // Cor do texto (vermelho)
          iconColor: '#dc2626' // Cor do ícone (vermelho)
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
      // 🚀 MODELO APPNEW: Toast de info com cores específicas
      const Swal = getSwal();
      if (Swal) {
        const config = {
          toast: true,
          position: 'top-end' as const,
          showConfirmButton: false,
          timer: 1200, // Otimizado para 1.2 segundos (modelo APPNEW)
          timerProgressBar: true,
          didOpen: (toast: any) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        };

        Swal.fire({
          ...config,
          icon: 'info',
          title: message ? `${title} ${message}` : title,
          background: '#eff6ff', // Cor de fundo azul claro (modelo APPNEW)
          color: '#1e40af', // Cor do texto (azul)
          iconColor: '#1e40af' // Cor do ícone (azul)
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
      // 🚀 MODELO APPNEW: Toast de warning com cores específicas
      const Swal = getSwal();
      if (Swal) {
        const config = {
          toast: true,
          position: 'top-end' as const,
          showConfirmButton: false,
          timer: 1200, // Otimizado para 1.2 segundos (modelo APPNEW)
          timerProgressBar: true,
          didOpen: (toast: any) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        };

        Swal.fire({
          ...config,
          icon: 'warning',
          title: message ? `${title} ${message}` : title,
          background: '#fffbeb', // Cor de fundo amarelo claro (modelo APPNEW)
          color: '#d97706', // Cor do texto (laranja)
          iconColor: '#d97706' // Cor do ícone (laranja)
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
