/**
 * Serviço para gerenciar polos
 */
import { supabase } from '@/api/supabase';
import type { Polo } from '@/types/models';

export const poloService = {
  /**
   * Buscar todos os polos ativos
   */
  async getAllPolos(): Promise<Polo[]> {
    try {
      console.log('🔍 Buscando polos no Supabase...');
      const { data, error } = await supabase
        .from('musicalizacao_polos')
        .select('*')
        .eq('is_active', true)
        .order('nome', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar polos:', error);
        console.error('❌ Código do erro:', error.code);
        console.error('❌ Mensagem:', error.message);
        // Se a tabela não existir, usar fallback
        if (error.code === 'PGRST116' || error.message.includes('does not exist') || error.message.includes('relation')) {
          console.warn('⚠️ Tabela musicalizacao_polos não encontrada. Usando polos fallback.');
          throw new Error('TABLE_NOT_FOUND');
        }
        throw error;
      }

      console.log('✅ Polos encontrados no banco:', data?.length || 0);

      if (!data || data.length === 0) {
        console.warn('⚠️ Nenhum polo encontrado no banco. Usando polos fallback.');
        throw new Error('NO_DATA');
      }

      const polosMapped = (data || []).map((polo) => ({
        id: polo.id,
        nome: polo.nome,
        cidade: polo.cidade,
        regional: polo.regional,
        endereco: polo.endereco || null,
        telefone: polo.telefone || null,
        email: polo.email || null,
        isActive: polo.is_active,
        createdAt: polo.created_at,
        updatedAt: polo.updated_at,
      }));

      console.log('✅ Polos mapeados:', polosMapped);
      return polosMapped;
    } catch (error) {
      console.error('❌ Erro ao buscar polos, usando fallback:', error);
      // Fallback para lista mockada se houver erro ou tabela não existir
      const fallbackPolos = [
        { id: '1', nome: 'Cotia', cidade: 'Cotia', regional: 'Itapevi', isActive: true, createdAt: '', updatedAt: '' },
        { id: '2', nome: 'Caucaia do Alto', cidade: 'Caucaia do Alto', regional: 'Itapevi', isActive: true, createdAt: '', updatedAt: '' },
        { id: '3', nome: 'Vargem Grande Paulista', cidade: 'Vargem Grande Paulista', regional: 'Itapevi', isActive: true, createdAt: '', updatedAt: '' },
        { id: '4', nome: 'Itapevi', cidade: 'Itapevi', regional: 'Itapevi', isActive: true, createdAt: '', updatedAt: '' },
        { id: '5', nome: 'Jandira', cidade: 'Jandira', regional: 'Itapevi', isActive: true, createdAt: '', updatedAt: '' },
        { id: '6', nome: 'Santana de Parnaíba', cidade: 'Santana de Parnaíba', regional: 'Itapevi', isActive: true, createdAt: '', updatedAt: '' },
        { id: '7', nome: 'Pirapora do Bom Jesus', cidade: 'Pirapora do Bom Jesus', regional: 'Itapevi', isActive: true, createdAt: '', updatedAt: '' },
      ];
      console.log('📋 Retornando polos fallback:', fallbackPolos);
      return fallbackPolos;
    }
  },

  /**
   * Buscar polos por cidade
   */
  async getPolosByCidade(cidade: string): Promise<Polo[]> {
    try {
      const { data, error } = await supabase
        .from('musicalizacao_polos')
        .select('*')
        .eq('cidade', cidade)
        .eq('is_active', true)
        .order('nome', { ascending: true });

      if (error) {
        console.error('Erro ao buscar polos por cidade:', error);
        throw error;
      }

      return (data || []).map((polo) => ({
        id: polo.id,
        nome: polo.nome,
        cidade: polo.cidade,
        regional: polo.regional,
        endereco: polo.endereco || null,
        telefone: polo.telefone || null,
        email: polo.email || null,
        isActive: polo.is_active,
        createdAt: polo.created_at,
        updatedAt: polo.updated_at,
      }));
    } catch (error) {
      console.error('Erro ao buscar polos por cidade:', error);
      return [];
    }
  },

  /**
   * Buscar polo por ID
   */
  async getPoloById(id: string): Promise<Polo | null> {
    try {
      const { data, error } = await supabase
        .from('musicalizacao_polos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar polo:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        nome: data.nome,
        cidade: data.cidade,
        regional: data.regional,
        endereco: data.endereco || null,
        telefone: data.telefone || null,
        email: data.email || null,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Erro ao buscar polo:', error);
      return null;
    }
  },
};

