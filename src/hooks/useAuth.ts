/**
 * Hook customizado para autenticação
 */
import { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/api/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/models';

interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, poloId?: string) => Promise<{ user: User | null; error: Error | null }>;
  logout: () => Promise<void>;
  getProfile: (userId: string) => Promise<Profile | null>;
  refreshProfile: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Iniciar como true para carregar sessão

  const getProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      console.log('🔍 Buscando perfil para userId:', userId);
      
      const { data, error } = await supabase
        .from('musicalizacao_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('📦 Resultado da busca:', { 
        hasData: !!data, 
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message,
        dataKeys: data ? Object.keys(data) : null
      });

      if (error) {
        if (error.code === '42P17') {
          console.error('❌ Erro de recursão RLS');
          return null;
        }
        if (error.code === 'PGRST116') {
          console.log('ℹ️ Perfil não encontrado (PGRST116)');
          return null;
        }
        // Erro 406 (Not Acceptable) pode ser problema de RLS ou formato de resposta
        // Não é crítico - apenas logar e retornar null
        if (error.code === 'PGRST301' || error.message?.includes('406') || error.message?.includes('Not Acceptable')) {
          console.warn('⚠️ Erro 406 ao buscar perfil (pode ser problema de RLS ou formato):', error.message);
          return null;
        }
        console.error('❌ Erro ao buscar perfil:', error);
        console.error('❌ Código:', error.code);
        console.error('❌ Mensagem:', error.message);
        return null;
      }

      if (!data) {
        console.log('ℹ️ Nenhum dado retornado');
        return null;
      }

      console.log('✅ Perfil encontrado:', {
        id: data.id,
        full_name: data.full_name,
        role: data.role,
        status: data.status,
      });

      return {
        id: data.id,
        fullName: data.full_name,
        role: data.role,
        phone: data.phone,
        photoUrl: data.photo_url,
        regional: data.regional,
        poloId: data.polo_id,
        cidade: data.cidade,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('❌ Erro inesperado em getProfile:', error);
      return null;
    }
  }, []);

  // Verificar sessão atual quando o hook é inicializado
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        console.log('🔍 Verificando sessão atual...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (error) {
          console.error('❌ Erro ao verificar sessão:', error);
          setIsLoading(false);
          return;
        }

        if (!session?.user) {
          console.log('ℹ️ Nenhuma sessão ativa');
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        console.log('✅ Sessão encontrada. User ID:', session.user.id);
        setUser(session.user);

        // Carregar perfil
        const userProfile = await getProfile(session.user.id);
        if (!isMounted) return;

        if (userProfile) {
          console.log('✅ Perfil carregado:', {
            id: userProfile.id,
            fullName: userProfile.fullName,
            role: userProfile.role,
          });
          setProfile(userProfile);
        } else {
          console.warn('⚠️ Perfil não encontrado para usuário logado');
          setProfile(null);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar sessão:', error);
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    // Escutar mudanças no estado de autenticação
    const authStateChangeResult = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      console.log('🔄 Mudança no estado de autenticação:', event);

      if (!session?.user) {
        setUser(null);
        setProfile(null);
        return;
      }

      setUser(session.user);

      // Carregar perfil quando a sessão mudar
      const userProfile = await getProfile(session.user.id);
      if (!isMounted) return;

      if (userProfile) {
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    });

    // Extrair subscription de forma segura
    let subscription: { unsubscribe?: () => void } | null = null;
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

    return () => {
      isMounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [getProfile]);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('🔐 Iniciando login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Erro ao fazer login');

      console.log('✅ Autenticação no Supabase Auth bem-sucedida. User ID:', data.user.id);
      console.log('📝 IMPORTANTE: Verificando se o perfil existe na tabela musicalizacao_profiles (NÃO profiles)...');

      // Busca o perfil do usuário na tabela CORRETA
      const userProfile = await getProfile(data.user.id);

      // Se o perfil não existir, tentar criar automaticamente
      if (!userProfile) {
        console.warn('⚠️ Perfil não encontrado. Tentando criar perfil automaticamente...');
        
        try {
          // Aguardar um pouco para garantir que a sessão está ativa
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Verificar se a sessão está ativa
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData?.session) {
            throw new Error('Sessão não está ativa');
          }
          
          // Criar perfil com nome do usuário do auth
          const userFullName = data.user.user_metadata?.full_name || 
                              data.user.email?.split('@')[0] || 
                              'Usuário';
          
          const { error: profileError } = await supabase
            .from('musicalizacao_profiles')
            .insert({
              id: data.user.id,
              full_name: userFullName,
              role: 'instrutor',
            });
          
          if (profileError) {
            console.error('❌ Erro ao criar perfil automaticamente:', profileError);
            // Se for erro de RLS, informar
            if (profileError.code === '42501' || profileError.message.includes('row-level security')) {
              throw new Error('Erro de permissão ao criar perfil. Entre em contato com o administrador.');
            }
            throw new Error('Não foi possível criar seu perfil automaticamente. Entre em contato com o administrador.');
          }
          
          // Buscar o perfil recém-criado
          const newProfile = await getProfile(data.user.id);
          if (!newProfile) {
            throw new Error('Perfil criado mas não foi possível carregá-lo. Tente fazer login novamente.');
          }
          
          console.log('✅ Perfil criado automaticamente com sucesso');
          setUser(data.user);
          setProfile(newProfile);
          return;
        } catch (profileError) {
          console.error('❌ Erro ao criar perfil:', profileError);
          await supabase.auth.signOut();
          throw profileError instanceof Error 
            ? profileError 
            : new Error('Erro ao criar perfil. Tente fazer login novamente.');
        }
      }

      console.log('✅ Perfil encontrado na tabela musicalizacao_profiles:', {
        id: userProfile.id,
        fullName: userProfile.fullName,
        role: userProfile.role,
      });

      setUser(data.user);
      setProfile(userProfile);
    } finally {
      setIsLoading(false);
    }
  }, [getProfile]);

  const signUp = useCallback(async (email: string, password: string, fullName: string, poloId?: string): Promise<{ user: User | null; error: Error | null }> => {
    setIsLoading(true);
    try {
      // Verificar se Supabase está configurado
      if (!isSupabaseConfigured()) {
        return { 
          user: null, 
          error: new Error('Supabase não está configurado. Configure SUPABASE_URL e SUPABASE_ANON_KEY nas variáveis de ambiente ou no app.json.') 
        };
      }

      console.log('📝 Criando usuário...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        // Se email já existe, fazer login e criar perfil
        if (authError.message.includes('already registered') || authError.status === 422) {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
          });
          
          if (loginError || !loginData?.user || !loginData?.session) {
            return { user: null, error: new Error('Email já cadastrado. Senha incorreta.') };
          }
          
          // Verificar se já tem perfil
          const existingProfile = await getProfile(loginData.user.id);
          if (existingProfile) {
            await supabase.auth.signOut();
            return { user: null, error: null };
          }
          
          // Criar perfil
          const profileInsert: any = {
            id: loginData.user.id,
            full_name: fullName.trim(),
            role: 'usuario',
            status: 'approved',
          };
          
          if (poloId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(poloId)) {
            profileInsert.polo_id = poloId;
          }
          
          const { error: profileError } = await supabase
            .from('musicalizacao_profiles')
            .insert(profileInsert);
          
          if (profileError) {
            await supabase.auth.signOut();
            return { user: null, error: new Error(`Erro ao criar perfil: ${profileError.message}`) };
          }
          
          await supabase.auth.signOut();
          return { user: null, error: null };
        }
        
        return { user: null, error: new Error(authError.message) };
      }

      if (!authData.user) {
        return { 
          user: null, 
          error: new Error('Confirme seu email antes de continuar.') 
        };
      }

      // Se não há sessão, precisa confirmar email
      if (!authData.session) {
        return { 
          user: null, 
          error: new Error('Confirme seu email antes de continuar.') 
        };
      }

      // Criar perfil
      const profileInsert: any = {
        id: authData.user.id,
        full_name: fullName.trim(),
        role: 'usuario',
        status: 'approved',
      };
      
      if (poloId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(poloId)) {
        profileInsert.polo_id = poloId;
      }
      
      const { error: profileError } = await supabase
        .from('musicalizacao_profiles')
        .insert(profileInsert);

      if (profileError) {
        await supabase.auth.signOut();
        return { user: null, error: new Error(`Erro ao criar perfil: ${profileError.message}`) };
      }
      
      await supabase.auth.signOut();
      return { user: null, error: null };
    } catch (error) {
      console.error('❌ Erro geral no signUp:', error);
      let errorMessage = 'Erro desconhecido ao criar conta';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        // Melhorar mensagens de erro comuns
        if (error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e se o Supabase está configurado corretamente.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Não foi possível conectar ao servidor. Verifique se o Supabase está configurado e acessível.';
        }
      }
      
      return { user: null, error: new Error(errorMessage) };
    } finally {
      setIsLoading(false);
    }
  }, [getProfile]);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    try {
      const updatedProfile = await getProfile(user.id);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  }, [user, getProfile]);

  return {
    user,
    profile,
    isLoading,
    login,
    signUp,
    logout,
    getProfile,
    refreshProfile,
  };
};

