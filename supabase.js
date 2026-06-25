/**
 * BANDA ATALAIA APP - Core de Persistência, Autenticação e Storage
 * Arquitetura: Vanilla JS + ES Modules
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// -------------------------------------------------------------------------
// 1. CONFIGURAÇÕES DE CONEXÃO
// -------------------------------------------------------------------------
// SUBSTITUA PELAS CREDENCIAIS DO SEU PAINEL DO SUPABASE
const SUPABASE_URL = 'https://tawjxujmihcenrmhzqmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhd2p4dWptaWhjZW5ybWh6cW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMDc5MzksImV4cCI6MjA5NzY4MzkzOX0.kssIjs_TJNtcIEH5G61_aZIvc9eDBR_iNDs8fYmPbAA';

if (SUPABASE_URL.includes('https://tawjxujmihcenrmhzqmw.supabase.co')) {
    console.warn("⚠️ Atenção: Configure suas credenciais do Supabase no arquivo 'supabase.js' para ativar o banco de dados real.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -------------------------------------------------------------------------
// 2. MÓDULO DE AUTENTICAÇÃO (AUTH)
// -------------------------------------------------------------------------
export async function loginUsuario(email, senha) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: senha,
        });
        if (error) throw error;
        return { user: data.user, error: null };
    } catch (error) {
        console.error("Erro na autenticação:", error.message);
        return { user: null, error: error };
    }
}

export async function logoutUsuario() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Erro ao deslogar:", error.message);
    return { error };
}

export async function obterUsuarioAtual() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// -------------------------------------------------------------------------
// 3. MÓDULO DE BANCO DE DADOS (DATABASE - PERFIS)
// -------------------------------------------------------------------------
export async function obterPerfilMembro(userId) {
    try {
        const { data, error } = await supabase
            .from('perfis')
            .select('nome, foto_url, funcoes')
            .eq('id', userId)
            .single();

        if (error) throw error;

        return {
            perfil: {
                nome: data.nome,
                fotoUrl: data.foto_url,
                funcoes: data.funcoes || []
            },
            error: null
        };
    } catch (error) {
        console.error("Erro ao carregar perfil do banco:", error.message);
        return { perfil: null, error };
    }
}

export async function atualizarPerfilMembro(userId, dadosNovos) {
    try {
        const { error } = await supabase
            .from('perfis')
            .update({
                nome: dadosNovos.nome,
                foto_url: dadosNovos.fotoUrl,
                funcoes: dadosNovos.funcoes,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw error;
        return { sucesso: true, error: null };
    } catch (error) {
        console.error("Erro ao atualizar perfil no banco:", error.message);
        return { sucesso: false, error };
    }
}

export async function atualizarSenhaUsuario(novaSenha) {
    try {
        const { error } = await supabase.auth.updateUser({
            password: novaSenha
        });
        if (error) throw error;
        return { sucesso: true, error: null };
    } catch (error) {
        console.error("Erro ao modificar senha de acesso:", error.message);
        return { sucesso: false, error };
    }
}

// -------------------------------------------------------------------------
// 4. MÓDULO DE STORAGE (UPLOAD DE ARQUIVOS/FOTOS)
// -------------------------------------------------------------------------
/**
 * Faz o upload do arquivo de imagem física para o Supabase Storage.
 * @param {string} userId - ID do usuário (usado para organizar as pastas)
 * @param {File} arquivo - Arquivo físico selecionado pelo input do dispositivo
 * @returns {Promise<{url: string|null, error: object|null}>}
 */
export async function uploadFotoPerfil(userId, arquivo) {
    try {
        // Extrai a extensão do arquivo (ex: jpg, png)
        const fileExt = arquivo.name.split('.').pop();
        // Cria um nome de arquivo seguro e único para evitar cache de imagens velhas
        const fileName = `${userId}_${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        // Envia para o bucket chamado 'avatars'
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, arquivo, { upsert: true });

        if (uploadError) throw uploadError;

        // Recupera a URL pública definitiva da imagem hospedada
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        
        return { url: data.publicUrl, error: null };
    } catch (error) {
        console.error("Erro no upload da imagem:", error.message);
        return { url: null, error };
    }
}
