/**
 * Navegador principal do aplicativo
 * Gerencia a navegação entre autenticação e aplicativo principal
 */
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { Loading } from '@/components/common';
import { supabase } from '@/api/supabase';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe?: () => void } | null = null;

    // Função auxiliar para verificar perfil sem bloquear (com timeout)
    const verifyProfileAndSetAuth = async (userId: string) => {
      try {
        // Timeout de 3 segundos para evitar travamento
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );

        const profilePromise = supabase
          .from('musicalizacao_profiles')
          .select('id')
          .eq('id', userId)
          .single();

        const { data: profileData, error: profileError } = await Promise.race([
          profilePromise,
          timeoutPromise,
        ]) as any;

        if (!isMounted) return;

        if (profileError || !profileData) {
          console.warn('⚠️ Perfil não encontrado. Fazendo logout...');
          await supabase.auth.signOut();
          if (isMounted) {
            setIsAuthenticated(false);
          }
        }
      } catch (error: any) {
        console.error('Erro ao verificar perfil:', error);
        // Se for timeout, apenas logar sem fazer logout (pode ser problema de rede)
        if (error?.message?.includes('Timeout')) {
          console.warn('⚠️ Timeout ao verificar perfil. Mantendo sessão.');
        }
      }
    };

    // Verifica se há uma sessão ativa (verificação simples e rápida)
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error || !session) {
          console.log('📝 Nenhuma sessão ativa');
          setIsAuthenticated(false);
        } else {
          // Verificar perfil de forma assíncrona (não bloquear o carregamento)
          verifyProfileAndSetAuth(session.user.id);
          setIsAuthenticated(true); // Permitir acesso inicialmente, validação será feita depois
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    // Escuta mudanças no estado de autenticação
    try {
      const authStateChangeResult = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        
        // Ignorar eventos de SIGNED_OUT durante signup (evita flash da página principal)
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          return;
        }
        
        if (!session) {
          setIsAuthenticated(false);
          return;
        }

        // Verificar perfil quando a sessão mudar
        // IMPORTANTE: Não reagir imediatamente a SIGNED_UP para evitar mostrar página principal
        if (event === 'SIGNED_UP') {
          // Durante signup, aguardar um pouco antes de verificar
          // Se o signup fizer logout, não vamos mostrar a página principal
          setTimeout(async () => {
            if (!isMounted) return;
            const { data: currentSession } = await supabase.auth.getSession();
            if (currentSession?.session) {
              // Se ainda há sessão, verificar perfil
              verifyProfileAndSetAuth(currentSession.session.user.id);
              setIsAuthenticated(true);
            } else {
              // Se não há sessão, o signup fez logout - não autenticar
              setIsAuthenticated(false);
            }
          }, 500);
          return;
        }

        // Para outros eventos (SIGNED_IN, TOKEN_REFRESHED), verificar normalmente
        verifyProfileAndSetAuth(session.user.id);
        setIsAuthenticated(true);
      });
      
      // A estrutura do retorno do Supabase pode variar
      // Verificamos todas as possibilidades
      if (authStateChangeResult?.data?.subscription) {
        subscription = authStateChangeResult.data.subscription;
      } else if (authStateChangeResult?.subscription) {
        subscription = authStateChangeResult.subscription;
      } else if (authStateChangeResult && typeof authStateChangeResult === 'object') {
        // Pode ser que o retorno seja diretamente o objeto de subscription
        if ('unsubscribe' in authStateChangeResult) {
          subscription = authStateChangeResult as any;
        } else if ('data' in authStateChangeResult && authStateChangeResult.data) {
          subscription = (authStateChangeResult.data as any);
        }
      }
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      if (isMounted) {
        setIsLoading(false);
      }
    }

    return () => {
      isMounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  if (isLoading) {
    return <Loading fullScreen message="Carregando..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

