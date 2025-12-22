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
    const verifyProfileAndSetAuth = async (userId: string, isSignup: boolean = false) => {
      try {
        // Timeout de 5 segundos para dar mais tempo durante signup
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), isSignup ? 5000 : 3000)
        );

        const profilePromise = supabase
          .from('musicalizacao_profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle(); // Usar maybeSingle ao invés de single para não dar erro se não existir

        const { data: profileData, error: profileError } = await Promise.race([
          profilePromise,
          timeoutPromise,
        ]) as any;

        if (!isMounted) return;

        // Tratar erros específicos
        if (profileError) {
          // Erro 406 (Not Acceptable) pode ser problema de RLS ou formato
          // Erro PGRST116 significa que não encontrou (não é crítico)
          if (profileError.code === 'PGRST116') {
            console.log('ℹ️ Perfil ainda não existe (PGRST116)');
            if (isSignup) {
              // Durante signup, aguardar mais um pouco antes de fazer logout
              console.log('⏳ Aguardando criação do perfil durante signup...');
              await new Promise(resolve => setTimeout(resolve, 2000));
              // Tentar novamente
              const retryResult = await supabase
                .from('musicalizacao_profiles')
                .select('id')
                .eq('id', userId)
                .maybeSingle();
              
              if (retryResult.data) {
                console.log('✅ Perfil encontrado após retry');
                return; // Perfil existe, manter autenticado
              }
            }
            // Se não é signup ou perfil ainda não existe após retry, fazer logout
            console.warn('⚠️ Perfil não encontrado. Fazendo logout...');
            await supabase.auth.signOut();
            if (isMounted) {
              setIsAuthenticated(false);
            }
            return;
          }
          
          // Outros erros (406, etc) - durante signup, aguardar antes de fazer logout
          if (isSignup) {
            console.warn('⚠️ Erro ao buscar perfil durante signup:', profileError.code, profileError.message);
            console.log('⏳ Aguardando criação do perfil...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Tentar novamente
            const retryResult = await supabase
              .from('musicalizacao_profiles')
              .select('id')
              .eq('id', userId)
              .maybeSingle();
            
            if (retryResult.data && !retryResult.error) {
              console.log('✅ Perfil encontrado após retry');
              return; // Perfil existe, manter autenticado
            }
          }
          
          console.warn('⚠️ Erro ao buscar perfil:', profileError.code, profileError.message);
          console.warn('⚠️ Fazendo logout...');
          await supabase.auth.signOut();
          if (isMounted) {
            setIsAuthenticated(false);
          }
          return;
        }

        if (!profileData) {
          if (isSignup) {
            // Durante signup, aguardar antes de fazer logout
            console.log('⏳ Perfil não encontrado durante signup. Aguardando...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Tentar novamente
            const retryResult = await supabase
              .from('musicalizacao_profiles')
              .select('id')
              .eq('id', userId)
              .maybeSingle();
            
            if (retryResult.data) {
              console.log('✅ Perfil encontrado após retry');
              return; // Perfil existe, manter autenticado
            }
          }
          console.warn('⚠️ Perfil não encontrado. Fazendo logout...');
          await supabase.auth.signOut();
          if (isMounted) {
            setIsAuthenticated(false);
          }
        } else {
          console.log('✅ Perfil encontrado');
        }
      } catch (error: any) {
        console.error('Erro ao verificar perfil:', error);
        // Se for timeout, apenas logar sem fazer logout (pode ser problema de rede)
        if (error?.message?.includes('Timeout')) {
          console.warn('⚠️ Timeout ao verificar perfil. Mantendo sessão.');
        } else if (isSignup) {
          // Durante signup, não fazer logout imediatamente por erros inesperados
          console.warn('⚠️ Erro inesperado durante signup. Aguardando...');
        } else {
          // Em outros casos, fazer logout
          await supabase.auth.signOut();
          if (isMounted) {
            setIsAuthenticated(false);
          }
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
          // Não passar flag de signup aqui pois é verificação inicial
          verifyProfileAndSetAuth(session.user.id, false);
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
        
        // Processar eventos de SIGNED_OUT
        if (event === 'SIGNED_OUT') {
          console.log('🚪 Evento SIGNED_OUT recebido. Desautenticando usuário...');
          setIsAuthenticated(false);
          // Verificar novamente após um pequeno delay para garantir
          setTimeout(async () => {
            const { data: { session: checkSession } } = await supabase.auth.getSession();
            if (!checkSession && isMounted) {
              console.log('✅ Confirmado: nenhuma sessão ativa após logout');
              setIsAuthenticated(false);
            }
          }, 200);
          return;
        }
        
        if (!session) {
          console.log('🚪 Nenhuma sessão encontrada. Desautenticando usuário...');
          setIsAuthenticated(false);
          return;
        }

        // Verificar perfil quando a sessão mudar
        // IMPORTANTE: IGNORAR completamente SIGNED_UP - o signup faz logout imediatamente
        if (event === 'SIGNED_UP') {
          // Durante signup, o código faz logout imediatamente após criar perfil
          // Não autenticar para evitar mostrar página principal
          console.log('📝 Evento SIGNED_UP ignorado - signup faz logout imediatamente');
          setIsAuthenticated(false);
          return;
        }

        // IMPORTANTE: Se o evento for SIGNED_IN, verificar se a sessão ainda existe
        // (pode ter sido logout do signup antes do evento chegar)
        if (event === 'SIGNED_IN') {
          console.log('📝 Evento SIGNED_IN recebido. Verificando sessão...');
          
          // Aguardar um pouco para dar tempo do signup fazer logout se necessário
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Verificar se ainda há sessão (pode ter sido logout do signup)
          const { data: { session: checkSession } } = await supabase.auth.getSession();
          if (!checkSession) {
            console.log('✅ Sessão não encontrada após SIGNED_IN - provavelmente foi logout do signup');
            setIsAuthenticated(false);
            return;
          }
          
          // Se ainda há sessão, verificar perfil normalmente
          console.log('✅ Sessão ainda ativa. Verificando perfil...');
          verifyProfileAndSetAuth(checkSession.user.id, false);
          setIsAuthenticated(true);
          return;
        }

        // Para outros eventos (TOKEN_REFRESHED), verificar normalmente
        verifyProfileAndSetAuth(session.user.id, false);
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

