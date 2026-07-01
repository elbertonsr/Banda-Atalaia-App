/**
 * BANDA ATALAIA APP - Core de Persistência, Autenticação e Storage
 * Arquitetura: Vanilla JS + ES Modules (Robust Load)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://tawjxujmihcenrmhzqmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhd2p4dWptaWhjZW5ybWh6cW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMDc5MzksImV4cCI6MjA5NzY4MzkzOX0.kssIjs_TJNtcIEH5G61_aZIvc9eDBR_iNDs8fYmPbAA';

let supabaseInstance;

try {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (error) {
    console.error("Erro Fatal na Configuração do Supabase:", error);
    supabaseInstance = {
        auth: {
            signInWithPassword: async () => ({ error: { message: "As credenciais do Supabase não foram configuradas." } }),
            signOut: async () => ({ error: null }),
            getUser: async () => ({ data: { user: null } }),
            updateUser: async () => ({ error: { message: "Supabase Offline" } })
        },
        from: () => ({
            select: () => ({ eq: () => ({ single: async () => ({ error: { message: "Offline" } }), order: () => ({}) }) }),
            update: () => ({ eq: async () => ({ error: { message: "Offline" } }) }),
            insert: () => ({ select: () => ({ single: async () => ({ error: { message: "Offline" } }) }) }),
            delete: () => ({ eq: async () => ({ error: { message: "Offline" } }) })
        }),
        storage: {
            from: () => ({
                upload: async () => ({ error: { message: "Offline" } }),
                getPublicUrl: () => ({ data: { publicUrl: "" } })
            })
        }
    };
}

export const supabase = supabaseInstance;

export async function loginUsuario(email, senha) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        return { user: data.user, error: null };
    } catch (error) {
        return { user: null, error };
    }
}

export async function logoutUsuario() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

export async function obterUsuarioAtual() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function obterPerfilMembro(userId) {
    try {
        const { data, error } = await supabase.from('perfis').select('nome, foto_url, funcoes').eq('id', userId).single();
        if (error) throw error;
        return { perfil: { nome: data.nome, fotoUrl: data.foto_url, funcoes: data.funcoes || [] }, error: null };
    } catch (error) {
        return { perfil: null, error };
    }
}

export async function atualizarPerfilMembro(userId, dadosNovos) {
    try {
        const { error } = await supabase.from('perfis').update({
            nome: dadosNovos.nome,
            foto_url: dadosNovos.fotoUrl,
            funcoes: dadosNovos.funcoes,
            updated_at: new Date().toISOString()
        }).eq('id', userId);
        if (error) throw error;
        return { sucesso: true, error: null };
    } catch (error) {
        return { sucesso: false, error };
    }
}

export async function atualizarSenhaUsuario(novaSenha) {
    try {
        const { error } = await supabase.auth.updateUser({ password: novaSenha });
        if (error) throw error;
        return { sucesso: true, error: null };
    } catch (error) {
        return { sucesso: false, error };
    }
}

export async function uploadFotoPerfil(userId, arquivo) {
    try {
        const fileExt = arquivo.name.split('.').pop();
        const fileName = `${userId}_${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, arquivo, { upsert: true });
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        return { url: data.publicUrl, error: null };
    } catch (error) {
        console.error("Erro interno no uploadFotoPerfil:", error);
        return { url: null, error };
    }
}

// NOVA FUNÇÃO: Busca todas as contas reais cadastradas para a listagem da banda
export async function obterTodosPerfis() {
    try {
        const { data, error } = await supabase.from('perfis').select('id, nome, foto_url, funcoes').order('nome');
        if (error) throw error;
        return {
            perfis: data.map(p => ({
                id: p.id,
                nome: p.nome,
                fotoUrl: p.foto_url,
                funcoes: p.funcoes || []
            })),
            error: null
        };
    } catch (error) {
        console.error("Erro ao buscar todos os perfis:", error);
        return { perfis: [], error };
    }
}

// ==========================================
// MÓDULO REPERTÓRIO (SUPABASE CRUD)
// ==========================================

export async function obterRepertorio() {
    try {
        const { data, error } = await supabase.from('repertorio').select('*').order('data', { ascending: false });
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error("Erro ao buscar repertório:", error);
        return { data: [], error };
    }
}

export async function adicionarCancao(cancao) {
    try {
        // Removemos o id temporário se existir, para o banco gerar o UUID/ID real
        const { id, ...dadosInsercao } = cancao;
        const { data, error } = await supabase.from('repertorio').insert([dadosInsercao]).select().single();
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error("Erro ao adicionar canção:", error);
        return { data: null, error };
    }
}

export async function atualizarCancao(id, cancao) {
    try {
        const { data, error } = await supabase.from('repertorio').update(cancao).eq('id', id).select().single();
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error("Erro ao atualizar canção:", error);
        return { data: null, error };
    }
}

export async function deletarCancao(id) {
    try {
        const { error } = await supabase.from('repertorio').delete().eq('id', id);
        if (error) throw error;
        return { sucesso: true, error: null };
    } catch (error) {
        console.error("Erro ao deletar canção:", error);
        return { sucesso: false, error };
    }
}
