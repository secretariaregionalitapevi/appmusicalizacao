/**
 * Hook customizado para autenticação
 */
import { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/api/supabase';
import { poloService } from '@/services/poloService';
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
    } else if (authStateChangeResult && typeof authStateChangeResult === 'object') {
      // Pode ser que o retorno seja diretamente o objeto de subscription
      const result = authStateChangeResult as any;
      if (result.subscription) {
        subscription = result.subscription;
      } else if ('unsubscribe' in result) {
        subscription = result;
      } else if (result.data) {
        subscription = result.data;
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
          // Usar a sessão que já temos do login (data.session)
          if (!data.session) {
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
              role: 'usuario',
            });
          
          if (profileError) {
            console.error('❌ Erro ao criar perfil automaticamente:', profileError);
            // Se for erro de RLS, informar
            if (profileError.code === '42501' || profileError.message.includes('row-level security')) {
              throw new Error('Erro de permissão ao criar perfil. Execute a migration 011_fix_rls_insert_signup_final.sql no Supabase SQL Editor.');
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
        
        // Erro 500 do Supabase - problema no servidor
        if (authError.status === 500 || authError.message.includes('Database error')) {
          return { 
            user: null, 
            error: new Error('Erro no servidor do Supabase ao criar usuário. Isso pode ser um problema temporário. Tente novamente em alguns instantes ou entre em contato com o administrador.') 
          };
        }
        
        // Se o erro for "email já cadastrado", fazer login e criar perfil se não existir
        if (authError.message.includes('already registered') || authError.message.includes('User already registered') || authError.status === 422) {
          console.log('📝 Email já existe. Fazendo login...');
          
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
          });
          
          if (loginError || !loginData?.user || !loginData?.session) {
            return { 
              user: null, 
              error: new Error('Este email já está cadastrado, mas a senha está incorreta. Tente fazer login.') 
            };
          }
          
          const userId = loginData.user.id;
          console.log('✅ Login OK. User ID:', userId);
          console.log('✅ Sessão ativa:', !!loginData.session);
          
          // Verificar se já tem perfil
          const existingProfile = await getProfile(userId);
          if (existingProfile) {
            console.log('✅ Perfil já existe');
            await supabase.auth.signOut(); // Fazer logout para não manter sessão
            return { user: null, error: null };
          }
          
          // Buscar e validar poloId usando poloService como fallback
          let cidadePolo = null;
          let poloIdValidado = null;
          
          if (poloId) {
            // Se não é UUID, pode ser ID numérico do fallback - buscar polo real
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(poloId)) {
              console.log('⚠️ poloId não é UUID, buscando polo real:', poloId);
              try {
                // Tentar buscar diretamente no Supabase
                let { data: allPolos, error: polosError } = await supabase
                  .from('musicalizacao_polos')
                  .select('id, nome, cidade, is_active')
                  .order('nome', { ascending: true });
                
                // Se falhar ou vazio, tentar com filtro
                if (polosError || !allPolos || allPolos.length === 0) {
                  console.log('⚠️ Tentando buscar polos com filtro is_active...');
                  const result = await supabase
                    .from('musicalizacao_polos')
                    .select('id, nome, cidade, is_active')
                    .eq('is_active', true)
                    .order('nome', { ascending: true });
                  allPolos = result.data;
                  polosError = result.error;
                }
                
                // Se ainda falhar, usar poloService (que tem fallback)
                if (polosError || !allPolos || allPolos.length === 0) {
                  console.log('⚠️ Busca direta falhou, usando poloService...');
                  try {
                    const polosFromService = await poloService.getAllPolos();
                    if (polosFromService && polosFromService.length > 0) {
                      allPolos = polosFromService.map((p: any) => ({
                        id: p.id,
                        nome: p.nome,
                        cidade: p.cidade,
                        is_active: p.isActive
                      }));
                      console.log('✅ Polos obtidos via poloService:', allPolos.length);
                    }
                  } catch (serviceError) {
                    console.error('❌ Erro ao usar poloService:', serviceError);
                  }
                }
                
                if (allPolos && allPolos.length > 0) {
                  console.log('📋 Polos encontrados:', allPolos.length, 'Nomes:', allPolos.map(p => p.nome));
                  
                  // Mapear IDs numéricos do fallback para os polos reais
                  const fallbackMap: { [key: number]: string } = {
                    1: 'Cotia',
                    2: 'Caucaia do Alto',
                    3: 'Vargem Grande Paulista',
                    4: 'Itapevi',
                    5: 'Jandira',
                    6: 'Santana de Parnaíba',
                    7: 'Pirapora do Bom Jesus'
                  };
                  
                  const index = parseInt(poloId, 10);
                  const nomeEsperado = fallbackMap[index];
                  
                  if (nomeEsperado) {
                    // Buscar polo pelo nome (case insensitive e parcial)
                    let polo = allPolos.find(p => p.nome.toLowerCase() === nomeEsperado.toLowerCase());
                    if (!polo) {
                      // Tentar busca parcial
                      polo = allPolos.find(p => p.nome.toLowerCase().includes(nomeEsperado.toLowerCase()) || nomeEsperado.toLowerCase().includes(p.nome.toLowerCase()));
                    }
                if (polo) {
                  // Se o ID do polo não é UUID (é do fallback), buscar UUID real no banco
                  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(polo.id)) {
                    console.log('⚠️ Polo encontrado tem ID numérico, buscando UUID real no banco...');
                    try {
                      const { data: realPolo, error: realPoloError } = await supabase
                        .from('musicalizacao_polos')
                        .select('id, cidade')
                        .eq('nome', polo.nome)
                        .maybeSingle();
                      
                      if (!realPoloError && realPolo) {
                        poloIdValidado = realPolo.id;
                        cidadePolo = realPolo.cidade || polo.cidade || null;
                        console.log('✅ UUID real encontrado no banco:', { nome: polo.nome, poloId: poloIdValidado, cidade: cidadePolo });
                      } else {
                        console.warn('⚠️ Não foi possível encontrar UUID real no banco. Usando null para polo_id.');
                        poloIdValidado = null;
                        cidadePolo = polo.cidade || null;
                      }
                    } catch (uuidError) {
                      console.error('❌ Erro ao buscar UUID real:', uuidError);
                      poloIdValidado = null;
                      cidadePolo = polo.cidade || null;
                    }
                  } else {
                    poloIdValidado = polo.id;
                    cidadePolo = polo.cidade || null;
                    console.log('✅ Polo encontrado pelo nome:', { nome: nomeEsperado, poloId: poloIdValidado, cidade: cidadePolo, nomeReal: polo.nome });
                  }
                } else {
                  console.warn('⚠️ Polo não encontrado pelo nome:', nomeEsperado);
                  // Se não encontrar pelo nome, usar índice
                  const indexArray = index - 1;
                  if (indexArray >= 0 && indexArray < allPolos.length) {
                    const polo = allPolos[indexArray];
                    // Se o ID do polo não é UUID (é do fallback), buscar UUID real no banco
                    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(polo.id)) {
                      console.log('⚠️ Polo encontrado tem ID numérico, buscando UUID real no banco...');
                      try {
                        const { data: realPolo, error: realPoloError } = await supabase
                          .from('musicalizacao_polos')
                          .select('id, cidade')
                          .eq('nome', polo.nome)
                          .maybeSingle();
                        
                        if (!realPoloError && realPolo) {
                          poloIdValidado = realPolo.id;
                          cidadePolo = realPolo.cidade || polo.cidade || null;
                          console.log('✅ UUID real encontrado no banco:', { nome: polo.nome, poloId: poloIdValidado, cidade: cidadePolo });
                        } else {
                          console.warn('⚠️ Não foi possível encontrar UUID real no banco. Usando null para polo_id.');
                          poloIdValidado = null;
                          cidadePolo = polo.cidade || null;
                        }
                      } catch (uuidError) {
                        console.error('❌ Erro ao buscar UUID real:', uuidError);
                        poloIdValidado = null;
                        cidadePolo = polo.cidade || null;
                      }
                    } else {
                      poloIdValidado = polo.id;
                      cidadePolo = polo.cidade || null;
                      console.log('✅ Polo encontrado pelo índice:', { index: indexArray, nome: polo.nome, poloId: poloIdValidado, cidade: cidadePolo });
                    }
                  }
                }
              } else {
                // Tentar usar como índice direto
                const indexArray = index - 1;
                if (indexArray >= 0 && indexArray < allPolos.length) {
                  const polo = allPolos[indexArray];
                  // Se o ID do polo não é UUID (é do fallback), buscar UUID real no banco
                  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(polo.id)) {
                    console.log('⚠️ Polo encontrado tem ID numérico, buscando UUID real no banco...');
                    try {
                      const { data: realPolo, error: realPoloError } = await supabase
                        .from('musicalizacao_polos')
                        .select('id, cidade')
                        .eq('nome', polo.nome)
                        .maybeSingle();
                      
                      if (!realPoloError && realPolo) {
                        poloIdValidado = realPolo.id;
                        cidadePolo = realPolo.cidade || polo.cidade || null;
                        console.log('✅ UUID real encontrado no banco:', { nome: polo.nome, poloId: poloIdValidado, cidade: cidadePolo });
                      } else {
                        console.warn('⚠️ Não foi possível encontrar UUID real no banco. Usando null para polo_id.');
                        poloIdValidado = null;
                        cidadePolo = polo.cidade || null;
                      }
                    } catch (uuidError) {
                      console.error('❌ Erro ao buscar UUID real:', uuidError);
                      poloIdValidado = null;
                      cidadePolo = polo.cidade || null;
                    }
                  } else {
                    poloIdValidado = polo.id;
                    cidadePolo = polo.cidade || null;
                    console.log('✅ Polo encontrado pelo índice direto:', { index: indexArray, nome: polo.nome, poloId: poloIdValidado, cidade: cidadePolo });
                  }
                }
              }
                } else {
                  console.error('❌ Nenhum polo encontrado no banco. Verifique se a tabela musicalizacao_polos existe e tem dados.');
                }
              } catch (poloError) {
                console.error('❌ Erro ao buscar polo:', poloError);
              }
            } else {
              // É UUID válido
              poloIdValidado = poloId;
              try {
                const { data: poloData, error: poloError } = await supabase
                  .from('musicalizacao_polos')
                  .select('cidade')
                  .eq('id', poloId)
                  .maybeSingle();
                
                if (poloError) {
                  console.error('❌ Erro ao buscar cidade do polo:', poloError);
                } else {
                  cidadePolo = poloData?.cidade || null;
                  console.log('✅ Polo encontrado pelo UUID:', { poloId: poloIdValidado, cidade: cidadePolo });
                }
              } catch (poloError) {
                console.error('❌ Erro ao buscar cidade do polo:', poloError);
              }
            }
          }
          
          // Criar perfil usando função SECURITY DEFINER que bypassa RLS
          console.log('📝 Criando perfil usando função SECURITY DEFINER...', { 
            poloId: poloIdValidado, 
            cidade: cidadePolo,
            poloIdOriginal: poloId
          });
          
          const { error: profileError } = await supabase.rpc('musicalizacao_create_profile', {
            p_user_id: userId,
            p_full_name: fullName.trim(),
            p_role: 'usuario',
            p_status: 'approved',
            p_polo_id: poloIdValidado,
            p_cidade: cidadePolo
          });
          
          if (profileError) {
            console.error('❌ Erro ao criar perfil:', profileError);
            console.error('❌ Código:', profileError.code);
            console.error('❌ Mensagem:', profileError.message);
            if (profileError.code === '42501' || profileError.message.includes('row-level security')) {
              return { 
                user: null, 
                error: new Error('Erro de permissão RLS. Execute a migration 013_fix_rls_insert_definitive.sql no Supabase SQL Editor.') 
              };
            }
            return { user: null, error: new Error(`Erro ao criar perfil: ${profileError.message}`) };
          }
          
          console.log('✅ Perfil criado com sucesso');
          
          // FAZER LOGOUT IMEDIATAMENTE após criar perfil para evitar login automático
          console.log('📝 Fazendo logout IMEDIATAMENTE após criar perfil...');
          await supabase.auth.signOut();
          await new Promise(resolve => setTimeout(resolve, 300)); // Aguardar logout processar
          
          return { user: null, error: null };
        }
        
        // Outros erros
        let errorMessage = authError.message;
        if (authError.message.includes('fetch')) {
          errorMessage = 'Erro de conexão. Verifique se o Supabase está configurado corretamente e se há conexão com a internet.';
        }
        return { user: null, error: new Error(errorMessage) };
      }

      // Verificar se o usuário foi criado
      if (!authData.user) {
        console.error('❌ Usuário não foi criado');
        // Se não há sessão mas também não há erro, pode ser que precise confirmar email
        if (!authData.session) {
          return { 
            user: null, 
            error: new Error('Um email de confirmação foi enviado. Verifique sua caixa de entrada e clique no link para confirmar sua conta antes de fazer login.') 
          };
        }
        return { user: null, error: new Error('Erro ao criar usuário. Tente novamente.') };
      }

      console.log('✅ Usuário criado:', authData.user.id);
      console.log('📧 Sessão disponível:', !!authData.session);
      console.log('📧 Email confirmado:', authData.user.email_confirmed_at ? 'Sim' : 'Não (pode precisar confirmar)');

      // Se não há sessão, pode ser que o Supabase esteja configurado para exigir confirmação de email
      if (!authData.session) {
        console.warn('⚠️ Sessão não retornada no signup. Isso pode indicar que a confirmação de email é necessária.');
        
        // Tentar aguardar e verificar se a sessão aparece
        console.log('⏳ Aguardando 2 segundos para verificar se a sessão é criada...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: sessionCheck, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Erro ao verificar sessão:', sessionError);
        }
        
        if (!sessionCheck?.session) {
          console.warn('⚠️ Sessão ainda não disponível após espera. Pode ser necessário confirmar email.');
          // Não retornar erro aqui - tentar criar o perfil mesmo assim se possível
          // Mas informar ao usuário que pode precisar confirmar email
        } else {
          console.log('✅ Sessão encontrada após espera');
        }
      }

      // Buscar e validar poloId ANTES de criar perfil - usar poloService como fallback
      let cidadePolo = null;
      let poloIdValidado = null;
      
      if (poloId) {
        // Se não é UUID, pode ser ID numérico do fallback - buscar polo real
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(poloId)) {
          console.log('⚠️ poloId não é UUID, buscando polo real:', poloId);
          try {
            // Tentar buscar diretamente no Supabase
            let { data: allPolos, error: polosError } = await supabase
              .from('musicalizacao_polos')
              .select('id, nome, cidade, is_active')
              .order('nome', { ascending: true });
            
            // Se falhar ou vazio, tentar com filtro
            if (polosError || !allPolos || allPolos.length === 0) {
              console.log('⚠️ Tentando buscar polos com filtro is_active...');
              const result = await supabase
                .from('musicalizacao_polos')
                .select('id, nome, cidade, is_active')
                .eq('is_active', true)
                .order('nome', { ascending: true });
              allPolos = result.data;
              polosError = result.error;
            }
            
            // Se ainda falhar, usar poloService (que tem fallback)
            if (polosError || !allPolos || allPolos.length === 0) {
              console.log('⚠️ Busca direta falhou, usando poloService...');
              try {
                const polosFromService = await poloService.getAllPolos();
                if (polosFromService && polosFromService.length > 0) {
                  allPolos = polosFromService.map((p: any) => ({
                    id: p.id,
                    nome: p.nome,
                    cidade: p.cidade,
                    is_active: p.isActive
                  }));
                  console.log('✅ Polos obtidos via poloService:', allPolos.length);
                }
              } catch (serviceError) {
                console.error('❌ Erro ao usar poloService:', serviceError);
              }
            }
            
            if (allPolos && allPolos.length > 0) {
              console.log('📋 Polos encontrados:', allPolos.length, 'Nomes:', allPolos.map(p => `${p.nome} (${p.id.substring(0, 8)}...)`));
              
              // Mapear IDs numéricos do fallback para os polos reais
              const fallbackMap: { [key: number]: string } = {
                1: 'Cotia',
                2: 'Caucaia do Alto',
                3: 'Vargem Grande Paulista',
                4: 'Itapevi',
                5: 'Jandira',
                6: 'Santana de Parnaíba',
                7: 'Pirapora do Bom Jesus'
              };
              
              const index = parseInt(poloId, 10);
              const nomeEsperado = fallbackMap[index];
              
              if (nomeEsperado) {
                // Buscar polo pelo nome (case insensitive e parcial)
                let polo = allPolos.find(p => p.nome.toLowerCase() === nomeEsperado.toLowerCase());
                if (!polo) {
                  // Tentar busca parcial
                  polo = allPolos.find(p => p.nome.toLowerCase().includes(nomeEsperado.toLowerCase()) || nomeEsperado.toLowerCase().includes(p.nome.toLowerCase()));
                }
                if (polo) {
                  // Se o ID do polo não é UUID (é do fallback), buscar UUID real no banco
                  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(polo.id)) {
                    console.log('⚠️ Polo encontrado tem ID numérico, buscando UUID real no banco...');
                    try {
                      const { data: realPolo, error: realPoloError } = await supabase
                        .from('musicalizacao_polos')
                        .select('id, cidade')
                        .eq('nome', polo.nome)
                        .maybeSingle();
                      
                      if (!realPoloError && realPolo) {
                        poloIdValidado = realPolo.id;
                        cidadePolo = realPolo.cidade || polo.cidade || null;
                        console.log('✅ UUID real encontrado no banco:', { nome: polo.nome, poloId: poloIdValidado, cidade: cidadePolo });
                      } else {
                        console.warn('⚠️ Não foi possível encontrar UUID real no banco. Usando null para polo_id.');
                        poloIdValidado = null;
                        cidadePolo = polo.cidade || null;
                      }
                    } catch (uuidError) {
                      console.error('❌ Erro ao buscar UUID real:', uuidError);
                      poloIdValidado = null;
                      cidadePolo = polo.cidade || null;
                    }
                  } else {
                    poloIdValidado = polo.id;
                    cidadePolo = polo.cidade || null;
                    console.log('✅ Polo encontrado pelo nome:', { nome: nomeEsperado, poloId: poloIdValidado, cidade: cidadePolo, nomeReal: polo.nome });
                  }
                } else {
                  console.warn('⚠️ Polo não encontrado pelo nome:', nomeEsperado);
                  // Se não encontrar pelo nome, usar índice
                  const indexArray = index - 1;
                  if (indexArray >= 0 && indexArray < allPolos.length) {
                    const polo = allPolos[indexArray];
                    // Se o ID do polo não é UUID (é do fallback), buscar UUID real no banco
                    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(polo.id)) {
                      console.log('⚠️ Polo encontrado tem ID numérico, buscando UUID real no banco...');
                      try {
                        const { data: realPolo, error: realPoloError } = await supabase
                          .from('musicalizacao_polos')
                          .select('id, cidade')
                          .eq('nome', polo.nome)
                          .maybeSingle();
                        
                        if (!realPoloError && realPolo) {
                          poloIdValidado = realPolo.id;
                          cidadePolo = realPolo.cidade || polo.cidade || null;
                          console.log('✅ UUID real encontrado no banco:', { nome: polo.nome, poloId: poloIdValidado, cidade: cidadePolo });
                        } else {
                          console.warn('⚠️ Não foi possível encontrar UUID real no banco. Usando null para polo_id.');
                          poloIdValidado = null;
                          cidadePolo = polo.cidade || null;
                        }
                      } catch (uuidError) {
                        console.error('❌ Erro ao buscar UUID real:', uuidError);
                        poloIdValidado = null;
                        cidadePolo = polo.cidade || null;
                      }
                    } else {
                      poloIdValidado = polo.id;
                      cidadePolo = polo.cidade || null;
                      console.log('✅ Polo encontrado pelo índice:', { index: indexArray, nome: polo.nome, poloId: poloIdValidado, cidade: cidadePolo });
                    }
                  }
                }
              } else {
                // Tentar usar como índice direto
                const indexArray = index - 1;
                if (indexArray >= 0 && indexArray < allPolos.length) {
                  const polo = allPolos[indexArray];
                  // Se o ID do polo não é UUID (é do fallback), buscar UUID real no banco
                  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(polo.id)) {
                    console.log('⚠️ Polo encontrado tem ID numérico, buscando UUID real no banco...');
                    try {
                      const { data: realPolo, error: realPoloError } = await supabase
                        .from('musicalizacao_polos')
                        .select('id, cidade')
                        .eq('nome', polo.nome)
                        .maybeSingle();
                      
                      if (!realPoloError && realPolo) {
                        poloIdValidado = realPolo.id;
                        cidadePolo = realPolo.cidade || polo.cidade || null;
                        console.log('✅ UUID real encontrado no banco:', { nome: polo.nome, poloId: poloIdValidado, cidade: cidadePolo });
                      } else {
                        console.warn('⚠️ Não foi possível encontrar UUID real no banco. Usando null para polo_id.');
                        poloIdValidado = null;
                        cidadePolo = polo.cidade || null;
                      }
                    } catch (uuidError) {
                      console.error('❌ Erro ao buscar UUID real:', uuidError);
                      poloIdValidado = null;
                      cidadePolo = polo.cidade || null;
                    }
                  } else {
                    poloIdValidado = polo.id;
                    cidadePolo = polo.cidade || null;
                    console.log('✅ Polo encontrado pelo índice direto:', { index: indexArray, nome: polo.nome, poloId: poloIdValidado, cidade: cidadePolo });
                  }
                }
              }
            } else {
              console.error('❌ Nenhum polo encontrado no banco. Verifique se a tabela musicalizacao_polos existe e tem dados.');
            }
          } catch (poloError) {
            console.error('❌ Erro ao buscar polo:', poloError);
          }
        } else {
          // É UUID válido
          poloIdValidado = poloId;
          try {
            const { data: poloData, error: poloError } = await supabase
              .from('musicalizacao_polos')
              .select('cidade')
              .eq('id', poloId)
              .maybeSingle();
            
            if (poloError) {
              console.error('❌ Erro ao buscar cidade do polo:', poloError);
            } else {
              cidadePolo = poloData?.cidade || null;
              console.log('✅ Polo encontrado pelo UUID:', { poloId: poloIdValidado, cidade: cidadePolo });
            }
          } catch (poloError) {
            console.error('❌ Erro ao buscar cidade do polo:', poloError);
          }
        }
      }
      
      // Criar perfil - MÍNIMO NECESSÁRIO
      const profileInsert: any = {
        id: authData.user.id,
        full_name: fullName.trim(),
        role: 'usuario',
        status: 'approved',
      };
      
      // Adicionar campos opcionais apenas se fornecidos E válidos
      if (poloIdValidado) {
        profileInsert.polo_id = poloIdValidado;
      }
      if (cidadePolo) {
        profileInsert.cidade = cidadePolo;
      }
      
      // Verificar sessão antes de inserir - com múltiplas tentativas
      let sessionCheck = authData.session ? { data: { session: authData.session } } : await supabase.auth.getSession();
      
      if (!sessionCheck?.data?.session) {
        console.warn('⚠️ Sessão não está ativa após signup. Tentando aguardar e verificar novamente...');
        
        // Tentar múltiplas vezes com intervalos crescentes
        for (let attempt = 1; attempt <= 3; attempt++) {
          const waitTime = attempt * 1000; // 1s, 2s, 3s
          console.log(`⏳ Tentativa ${attempt}/3: Aguardando ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          const checkResult = await supabase.auth.getSession();
          if (checkResult.error) {
            console.error(`❌ Erro ao verificar sessão (tentativa ${attempt}):`, checkResult.error);
          }
          
          if (checkResult.data?.session) {
            console.log(`✅ Sessão encontrada na tentativa ${attempt}`);
            sessionCheck = checkResult;
            break;
          }
        }
        
        // Se ainda não há sessão após todas as tentativas
        if (!sessionCheck?.data?.session) {
          console.error('❌ Sessão não foi ativada após múltiplas tentativas');
          
          // Verificar se o email precisa ser confirmado
          if (!authData.user.email_confirmed_at) {
            console.warn('⚠️ Email não confirmado. Pode ser necessário confirmar email antes de criar perfil.');
            // Tentar criar perfil mesmo assim - algumas configurações do Supabase permitem isso
          } else {
            // Se o email está confirmado mas não há sessão, há um problema
          await supabase.auth.signOut();
          return { 
            user: null, 
              error: new Error('Erro ao criar sessão. Verifique se o Supabase está configurado corretamente e se a confirmação de email está desabilitada ou confirme seu email antes de continuar.') 
          };
          }
        }
      } else {
        console.log('✅ Sessão ativa. auth.uid() =', sessionCheck.data.session.user.id);
      }
      
      console.log('📝 Tentando inserir perfil:', profileInsert);
      console.log('📝 Verificando: auth.uid() deve ser igual a id:', sessionCheck?.data?.session?.user.id === authData.user.id);
      
      // Se não há sessão, tentar usar o user ID diretamente
      // Isso pode funcionar se as políticas RLS permitirem inserção sem sessão ativa
      // ou se houver um trigger que cria o perfil automaticamente
      if (!sessionCheck?.data?.session) {
        console.warn('⚠️ Tentando criar perfil sem sessão ativa. Isso pode falhar se RLS estiver habilitado.');
        console.warn('💡 Se falhar, o usuário precisará confirmar o email e fazer login primeiro.');
      }
      
      // Tentar usar função SECURITY DEFINER primeiro (bypassa RLS)
      let profileData = null;
      let profileError = null;
      
      // Usar os valores já calculados acima (poloIdValidado e cidadePolo)
      console.log('📝 Dados para criar perfil:', {
        user_id: authData.user.id,
        full_name: fullName.trim(),
        polo_id: poloIdValidado,
        cidade: cidadePolo || null,
        poloId_original: poloId
      });
      
      try {
        const { error: rpcError } = await supabase.rpc('musicalizacao_create_profile', {
          p_user_id: authData.user.id,
          p_full_name: fullName.trim(),
          p_role: 'usuario',
          p_status: 'approved',
          p_polo_id: poloIdValidado,
          p_cidade: cidadePolo || null
        });
        
        if (rpcError) {
          profileError = rpcError;
          console.warn('⚠️ Erro ao usar função RPC, tentando INSERT direto...');
          // Se a função não existir, tentar INSERT direto
          const { data: insertData, error: insertError } = await supabase
        .from('musicalizacao_profiles')
        .insert(profileInsert)
        .select()
        .single();
          profileData = insertData;
          profileError = insertError;
        } else {
          // Função funcionou, buscar o perfil criado
          const createdProfile = await getProfile(authData.user.id);
          if (createdProfile) {
            profileData = {
              id: createdProfile.id,
              full_name: createdProfile.fullName,
              role: createdProfile.role,
              status: createdProfile.status,
              polo_id: createdProfile.poloId,
              cidade: createdProfile.cidade,
            };
          }
        }
        
        // FAZER LOGOUT IMEDIATAMENTE após criar perfil para evitar login automático
        console.log('📝 Fazendo logout IMEDIATAMENTE após criar perfil...');
        await supabase.auth.signOut();
        await new Promise(resolve => setTimeout(resolve, 300)); // Aguardar logout processar
      } catch (error: any) {
        profileError = error;
        // Fazer logout mesmo em caso de erro
        await supabase.auth.signOut();
      }

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
        
        // Verificar se o perfil foi criado mesmo com erro (pode ter sido criado por trigger)
        console.log('🔍 Verificando se o perfil foi criado por trigger...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar trigger executar
        const checkProfile = await getProfile(authData.user.id);
        if (checkProfile) {
          console.log('✅ Perfil foi criado (provavelmente por trigger). Mantendo logado.');
          // Se há sessão, manter logado. Se não, fazer logout e pedir para confirmar email
          if (sessionCheck?.data?.session) {
          setUser(authData.user);
          setProfile(checkProfile);
          return { user: authData.user, error: null };
          } else {
            // Sem sessão - fazer logout e informar que precisa confirmar email
            await supabase.auth.signOut();
            return { 
              user: null, 
              error: new Error('Conta criada com sucesso! Um email de confirmação foi enviado. Verifique sua caixa de entrada e clique no link para confirmar sua conta antes de fazer login.') 
            };
          }
        }
        
        // Se não há sessão e o erro é de RLS, informar que precisa confirmar email
        if (!sessionCheck?.data?.session && (profileError.code === '42501' || profileError.message.includes('row-level security'))) {
          await supabase.auth.signOut();
          return { 
            user: null, 
            error: new Error('Conta criada! Por favor, confirme seu email (verifique sua caixa de entrada) e faça login para completar o cadastro.') 
          };
        }
        
        await supabase.auth.signOut();
        
        if (profileError.code === '42501' || profileError.message.includes('row-level security')) {
          return { 
            user: null, 
            error: new Error('Erro de permissão RLS. Execute a migration 013_fix_rls_insert_definitive.sql no Supabase SQL Editor.') 
          };
        }
        
        // Melhorar mensagem de erro
        let errorMessage = `Erro ao criar perfil: ${profileError.message}`;
        if (profileError.message.includes('duplicate key') || profileError.message.includes('already exists')) {
          errorMessage = 'Este perfil já existe. Tente fazer login.';
        } else if (profileError.message.includes('foreign key') || profileError.message.includes('violates foreign key')) {
          errorMessage = 'Erro ao associar polo. Verifique se o polo selecionado existe.';
        }
        
        return { 
          user: null, 
          error: new Error(errorMessage) 
        };
      }
      
      if (!profileData) {
        console.warn('⚠️ Nenhum dado retornado da inserção. Verificando se o perfil existe...');
        // Aguardar um pouco para dar tempo de triggers executarem
        await new Promise(resolve => setTimeout(resolve, 1000));
        const checkProfile = await getProfile(authData.user.id);
        if (checkProfile) {
          console.log('✅ Perfil existe mesmo sem retorno.');
          // Se há sessão, manter logado. Se não, fazer logout e informar
          if (sessionCheck?.data?.session) {
          setUser(authData.user);
          setProfile(checkProfile);
            // Fazer logout mesmo assim para evitar login automático
            await supabase.auth.signOut();
            return { user: null, error: null };
          } else {
            await supabase.auth.signOut();
            return { 
              user: null, 
              error: new Error('Conta criada! Por favor, confirme seu email (verifique sua caixa de entrada) e faça login para acessar o sistema.') 
            };
          }
        }
        
        await supabase.auth.signOut();
        return { 
          user: null, 
          error: new Error('Perfil não foi criado. Tente novamente ou entre em contato com o administrador.') 
        };
      }
      
      console.log('✅ Perfil criado com sucesso:', profileData);
      
      // Logout já foi feito antes de criar o perfil, apenas garantir que não há sessão
      const finalSessionCheck = await supabase.auth.getSession();
      if (finalSessionCheck.data?.session) {
        console.log('⚠️ Ainda há sessão após logout, fazendo logout novamente...');
        await supabase.auth.signOut();
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
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

