/**
 * BANDA ATALAIA APP - Core de Persistência e Autenticação (Supabase)
 * Arquitetura: Vanilla JS + ES Modules
 * Desenvolvido seguindo as melhores práticas de segurança e performance.
 */

// Importação oficial do cliente Supabase otimizado para ES Modules
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// -------------------------------------------------------------------------
// 1. CONFIGURAÇÕES DE CONEXÃO
// -------------------------------------------------------------------------
// SUBSTITUA PELAS CREDENCIAIS DO SEU PAINEL DO SUPABASE (Project Settings > API)
const SUPABASE_URL = 'https://tawjxujmihcenrmhzqmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhd2p4dWptaWhjZW5ybWh6cW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMDc5MzksImV4cCI6MjA5NzY4MzkzOX0.kssIjs_TJNtcIEH5G61_aZIvc9eDBR_iNDs8fYmPbAA';

if (SUPABASE_URL.includes('https://tawjxujmihcenrmhzqmw.supabase.co')) {
    console.warn("⚠️ Atenção: Configure suas credenciais do Supabase no arquivo 'supabase.js' para ativar o banco de dados real.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -------------------------------------------------------------------------
// 2. MÓDULO DE AUTENTICAÇÃO (AUTH)
// -------------------------------------------------------------------------

/**
 * Realiza o login utilizando e-mail e senha no Supabase Auth.
 * @param {string} email 
 * @param {string} senha 
 * @returns {Promise<{user: object, error: object}>}
 */
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

/**
 * Encerra a sessão ativa do usuário atual.
 * @returns {Promise<{error: object|null}>}
 */
export async function logoutUsuario() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Erro ao deslogar:", error.message);
    return { error };
}

/**
 * Retorna os dados da sessão do usuário autenticado no momento.
 * @returns {Promise<object|null>}
 */
export async function obterUsuarioAtual() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// -------------------------------------------------------------------------
// 3. MÓDULO DE BANCO DE DADOS (DATABASE - PERFIS)
// -------------------------------------------------------------------------

/**
 * Recupera as informações customizadas do perfil do membro da igreja.
 * @param {string} userId - UUID vindo do Supabase Auth
 * @returns {Promise<{perfil: object|null, error: object|null}>}
 */
export async function obterPerfilMembro(userId) {
    try {
        const { data, error } = await supabase
            .from('perfis')
            .select('nome, foto_url, funcoes')
            .eq('id', userId)
            .single();

        if (error) throw error;

        // Mapeia o snake_case do banco para o camelCase padronizado nas telas JS
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

/**
 * Atualiza os dados de perfil (Nome, URL da Foto e Funções na Banda) no banco.
 * @param {string} userId - UUID do usuário
 * @param {object} dadosNovos - Objeto contendo { nome, fotoUrl, funcoes }
 * @returns {Promise<{sucesso: boolean, error: object|null}>}
 */
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

/**
 * Atualiza a senha da conta do usuário logado diretamente no módulo Auth.
 * @param {string} novaSenha 
 * @returns {Promise<{sucesso: boolean, error: object|null}>}
 */
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
