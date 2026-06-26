/**
 * BANDA ATALAIA APP - Core de Persistência, Autenticação e Storage
 * Arquitetura: Vanilla JS + ES Modules (Dynamic)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// -------------------------------------------------------------------------
// 1. CONFIGURAÇÕES DE CONEXÃO
// -------------------------------------------------------------------------
const SUPABASE_URL = 'https://tawjxujmihcenrmhzqmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhd2p4dWptaWhjZW5ybWh6cW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMDc5MzksImV4cCI6MjA5NzY4MzkzOX0.kssIjs_TJNtcIEH5G61_aZIvc9eDBR_iNDs8fYmPbAA';

if (SUPABASE_URL.includes('https://tawjxujmihcenrmhzqmw.supabase.co')) {
    console.warn("⚠️ Atenção: Configurar as credenciais reais no 'supabase.js'.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
        return {
            perfil: { nome: data.nome, fotoUrl: data.foto_url, funcoes: data.funcoes || [] },
            error: null
        };
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
        return { url: null, error };
    }
}
