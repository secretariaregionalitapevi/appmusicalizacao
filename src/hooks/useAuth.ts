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
  signUp: (email: string, password: string, fullName: string) => Promise<{ user: User | null; error: Error | null }>;
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
        console.error('❌ Erro ao buscar perfil:', error);
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

      console.log('📝 Criando usuário no Supabase Auth...');
      
      // Criar usuário no Supabase Auth (SEM metadata para evitar problemas)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        console.error('❌ Erro ao criar usuário no Supabase Auth:', authError);
        console.error('❌ Código:', authError.status);
        console.error('❌ Mensagem:', authError.message);
        
        // Se o erro for "email já cadastrado", verificar se tem perfil e criar se necessário
        if (authError.message.includes('already registered') || authError.message.includes('User already registered') || authError.status === 422) {
          console.log('📝 Email já existe em auth.users. Verificando perfil em musicalizacao_profiles...');
          
          // Fazer login para obter o user ID e sessão
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
          });
          
          if (loginError || !loginData?.user) {
            return { 
              user: null, 
              error: new Error('Este email já está cadastrado, mas a senha está incorreta. Tente fazer login.') 
            };
          }
          
          // Verificar se a sessão está ativa
          const { data: sessionCheck } = await supabase.auth.getSession();
          if (!sessionCheck?.session) {
            console.error('❌ Sessão não está ativa após login');
            return { 
              user: null, 
              error: new Error('Erro ao criar sessão. Tente novamente.') 
            };
          }
          
          console.log('✅ Sessão ativa. User ID:', loginData.user.id);
          console.log('✅ auth.uid() deve ser:', loginData.user.id);
          
          const userId = loginData.user.id;
          
          // Verificar se já tem perfil
          const existingProfile = await getProfile(userId);
          
          if (existingProfile) {
            // Já tem perfil - manter logado e retornar sucesso
            setUser(loginData.user);
            setProfile(existingProfile);
            return { user: loginData.user, error: null };
          }
          
          // Não tem perfil - criar agora
          console.log('📝 Criando perfil em musicalizacao_profiles para usuário existente...');
          
          // Criar perfil - MÍNIMO NECESSÁRIO (sem buscar cidade do polo para evitar erros)
          const profileInsert: any = {
            id: userId,
            full_name: fullName.trim(),
            role: 'usuario',
            status: 'approved',
          };
          
          // Adicionar campos opcionais apenas se fornecidos E válidos
          // Validar se poloId é UUID válido (não aceitar strings numéricas como "1")
          if (poloId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(poloId)) {
            profileInsert.polo_id = poloId;
          }
          
          // Verificar sessão ANTES de criar o perfil (NÃO fazer logout se não estiver ativa - tentar reativar)
          let sessionBeforeInsert = await supabase.auth.getSession();
          if (!sessionBeforeInsert.data?.session) {
            console.warn('⚠️ Sessão não está ativa. Tentando reativar...');
            // Tentar fazer login novamente para reativar a sessão
            const { data: reloginData, error: reloginError } = await supabase.auth.signInWithPassword({
              email: email.trim(),
              password: password,
            });
            
            if (reloginError || !reloginData?.session) {
              return { 
                user: null, 
                error: new Error('Não foi possível manter a sessão ativa. Tente fazer login.') 
              };
            }
            console.log('✅ Sessão reativada');
            sessionBeforeInsert = await supabase.auth.getSession();
          }
          
          if (!sessionBeforeInsert.data?.session) {
            return { 
              user: null, 
              error: new Error('Sessão não está ativa. Tente fazer login.') 
            };
          }
          
          console.log('✅ Sessão ativa. auth.uid() =', sessionBeforeInsert.data.session.user.id);
          console.log('📝 Tentando inserir perfil:', profileInsert);
          console.log('📝 Verificando: auth.uid() deve ser igual a id:', sessionBeforeInsert.data.session.user.id === userId);
          
          const { data: profileData, error: profileError } = await supabase
            .from('musicalizacao_profiles')
            .insert(profileInsert)
            .select()
            .single();
          
          console.log('📦 Resultado da inserção:', { 
            hasData: !!profileData, 
            hasError: !!profileError,
            errorCode: profileError?.code,
            errorMessage: profileError?.message,
            data: profileData 
          });
          
          if (profileError) {
            console.error('❌ Erro ao criar perfil:', profileError);
            console.error('❌ Código:', profileError.code);
            console.error('❌ Mensagem:', profileError.message);
            console.error('❌ Detalhes:', profileError.details);
            console.error('❌ Hint:', profileError.hint);
            
            // Não fazer logout imediatamente - tentar verificar se o perfil foi criado mesmo com erro
            const checkProfile = await getProfile(userId);
            if (checkProfile) {
              console.log('✅ Perfil foi criado apesar do erro. Mantendo logado.');
              setUser(loginData.user);
              setProfile(checkProfile);
              return { user: loginData.user, error: null };
            }
            
            // NÃO fazer logout - manter sessão para tentar novamente
            if (profileError.code === '42501' || profileError.message.includes('row-level security')) {
              return { 
                user: null, 
                error: new Error('Erro de permissão RLS. Execute a migration 005 no Supabase.') 
              };
            }
            
            return { 
              user: null, 
              error: new Error(`Erro ao criar perfil: ${profileError.message}`) 
            };
          }
          
          if (!profileData) {
            console.warn('⚠️ Nenhum dado retornado da inserção. Verificando se o perfil existe...');
            await new Promise(resolve => setTimeout(resolve, 500)); // Aguardar um pouco
            const checkProfile = await getProfile(userId);
            if (checkProfile) {
              console.log('✅ Perfil existe mesmo sem retorno. Mantendo logado.');
              setUser(loginData.user);
              setProfile(checkProfile);
              return { user: loginData.user, error: null };
            }
            
            // NÃO fazer logout - manter sessão para tentar novamente
            return { 
              user: null, 
              error: new Error('Perfil não foi criado. Tente novamente ou entre em contato com o administrador.') 
            };
          }
          
          console.log('✅ Perfil criado com sucesso:', profileData);
          
          // Buscar perfil criado para garantir
          await new Promise(resolve => setTimeout(resolve, 500)); // Aguardar um pouco
          const userProfile = await getProfile(userId);
          
          if (!userProfile) {
            console.warn('⚠️ Perfil criado mas não foi possível carregá-lo. Usando dados retornados.');
            // Usar os dados retornados diretamente
            const mappedProfile = {
              id: profileData.id,
              fullName: profileData.full_name,
              role: profileData.role,
              phone: profileData.phone,
              photoUrl: profileData.photo_url,
              regional: profileData.regional,
              poloId: profileData.polo_id,
              cidade: profileData.cidade,
              status: profileData.status,
              createdAt: profileData.created_at,
              updatedAt: profileData.updated_at,
            };
            setUser(loginData.user);
            setProfile(mappedProfile);
            return { user: loginData.user, error: null };
          }
          
          // Sucesso - manter logado
          setUser(loginData.user);
          setProfile(userProfile);
          return { user: loginData.user, error: null };
        }
        
        // Outros erros
        let errorMessage = authError.message;
        if (authError.message.includes('fetch')) {
          errorMessage = 'Erro de conexão. Verifique se o Supabase está configurado corretamente e se há conexão com a internet.';
        }
        return { user: null, error: new Error(errorMessage) };
      }

      if (!authData.user) {
        console.error('❌ Usuário não foi criado');
        return { user: null, error: new Error('Erro ao criar usuário. Tente novamente.') };
      }

      console.log('✅ Usuário criado:', authData.user.id);

      // Buscar cidade do polo
      let cidade = null;
      if (poloId) {
        const { data: poloData } = await supabase
          .from('musicalizacao_polos')
          .select('cidade')
          .eq('id', poloId)
          .maybeSingle();
        cidade = poloData?.cidade || null;
      }

      // Criar perfil - MÍNIMO NECESSÁRIO
      const profileInsert: any = {
        id: authData.user.id,
        full_name: fullName.trim(),
        role: 'usuario',
        status: 'approved',
      };
      
      // Adicionar campos opcionais apenas se fornecidos E válidos
      // Validar se poloId é UUID válido (não aceitar strings numéricas como "1")
      if (poloId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(poloId)) {
        profileInsert.polo_id = poloId;
      }
      if (cidade) {
        profileInsert.cidade = cidade;
      }
      
      // Verificar sessão antes de inserir
      const { data: sessionCheck } = await supabase.auth.getSession();
      if (!sessionCheck?.session) {
        console.error('❌ Sessão não está ativa após signup');
        // Tentar aguardar um pouco e verificar novamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data: sessionCheck2 } = await supabase.auth.getSession();
        if (!sessionCheck2?.session) {
          console.error('❌ Sessão não foi ativada após signup');
          await supabase.auth.signOut();
          return { 
            user: null, 
            error: new Error('Sessão não foi ativada. Tente fazer login.') 
          };
        }
        console.log('✅ Sessão ativada após espera');
      } else {
        console.log('✅ Sessão ativa. auth.uid() =', sessionCheck.session.user.id);
      }
      
      console.log('📝 Tentando inserir perfil:', profileInsert);
      console.log('📝 Verificando: auth.uid() deve ser igual a id:', sessionCheck?.session?.user.id === authData.user.id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('musicalizacao_profiles')
        .insert(profileInsert)
        .select()
        .single();

      console.log('📦 Resultado da inserção:', { 
        hasData: !!profileData, 
        hasError: !!profileError,
        errorCode: profileError?.code,
        errorMessage: profileError?.message,
        data: profileData 
      });

      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError);
        console.error('❌ Código:', profileError.code);
        console.error('❌ Mensagem:', profileError.message);
        console.error('❌ Detalhes:', profileError.details);
        console.error('❌ Hint:', profileError.hint);
        
        // Verificar se o perfil foi criado mesmo com erro
        const checkProfile = await getProfile(authData.user.id);
        if (checkProfile) {
          console.log('✅ Perfil foi criado apesar do erro. Mantendo logado.');
          setUser(authData.user);
          setProfile(checkProfile);
          return { user: authData.user, error: null };
        }
        
        await supabase.auth.signOut();
        
        if (profileError.code === '42501' || profileError.message.includes('row-level security')) {
          return { 
            user: null, 
            error: new Error('Erro de permissão RLS. Execute a migration 004 no Supabase.') 
          };
        }
        
        return { 
          user: null, 
          error: new Error(`Erro ao criar perfil: ${profileError.message}`) 
        };
      }
      
      if (!profileData) {
        console.warn('⚠️ Nenhum dado retornado da inserção. Verificando se o perfil existe...');
        const checkProfile = await getProfile(authData.user.id);
        if (checkProfile) {
          console.log('✅ Perfil existe mesmo sem retorno. Mantendo logado.');
          setUser(authData.user);
          setProfile(checkProfile);
          return { user: authData.user, error: null };
        }
        
        await supabase.auth.signOut();
        return { 
          user: null, 
          error: new Error('Perfil não foi criado. Tente novamente.') 
        };
      }
      
      console.log('✅ Perfil criado com sucesso:', profileData);
      
      // Para novos usuários: fazer logout IMEDIATAMENTE após criar o perfil
      // Isso evita que o AppNavigator detecte a sessão e mostre a página principal
      console.log('📝 Conta criada com sucesso. Fazendo logout IMEDIATAMENTE para evitar login automático...');
      
      // IMPORTANTE: Fazer logout ANTES de qualquer outra coisa para evitar que
      // o AppNavigator detecte a sessão e mostre a página principal
      await supabase.auth.signOut();
      
      // Aguardar um pouco para garantir que o logout foi processado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // NÃO setar user/profile aqui - isso faria o AppNavigator mostrar a página principal
      // Apenas retornar sucesso para o SignUpScreen exibir toast e redirecionar
      return { user: null, error: null }; // Retornar null para não triggerar login automático
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

