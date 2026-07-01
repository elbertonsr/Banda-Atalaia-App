import { renderizarInicio } from './inicio.js';
import { obterTodosPerfis } from '../supabase.js';

export async function renderizarMembros() {
    const app = document.getElementById('app');
    
    // TELA DE LOADING PRESERVANDO O DESIGN GLASSMORPHISM
    app.innerHTML = `
        <div class="min-h-screen bg-fundo relative font-sans text-texto select-none overflow-x-hidden pt-24 pb-12 px-6 flex flex-col items-center">
            <div class="fixed top-[-10%] right-[-10%] w-96 h-96 bg-ouro rounded-full filter blur-[120px] opacity-10 pointer-events-none z-0"></div>

            <header class="fixed top-0 left-0 w-full z-50 bg-fundo/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <button id="btn-membros-voltar-loading" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-all outline-none">
                    <i class="ph ph-arrow-left text-xl text-texto"></i>
                </button>
                <span class="text-sm font-bold text-ouro tracking-widest uppercase">Membros da Banda</span>
                <div class="w-10 h-10"></div>
            </header>

            <div class="w-full max-w-md flex flex-col items-center justify-center mt-20 relative z-10 animate-[fadeIn_0.3s_ease-in-out]">
                <i class="ph ph-spinner-gap text-4xl text-ouro animate-spin mb-4"></i>
                <p class="text-texto/50 text-sm tracking-widest uppercase">Buscando banco de dados...</p>
            </div>
        </div>
    `;
    
    document.getElementById('btn-membros-voltar-loading').addEventListener('click', () => {
        renderizarInicio();
    });
    
    // BUSCA DADOS REAIS DO SUPABASE
    const { perfis } = await obterTodosPerfis();
    const equipe = perfis || [];
    
    // Checa se o usuário voltou para a home enquanto os dados carregavam
    if (!document.getElementById('btn-membros-voltar-loading')) return;
    
    // TELA FINAL COM OS MEMBROS REAIS
    app.innerHTML = `
        <div class="min-h-screen bg-fundo relative font-sans text-texto select-none overflow-x-hidden pt-24 pb-12 px-6 flex flex-col items-center">
            <div class="fixed top-[-10%] right-[-10%] w-96 h-96 bg-ouro rounded-full filter blur-[120px] opacity-10 pointer-events-none z-0"></div>

            <header class="fixed top-0 left-0 w-full z-50 bg-fundo/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <button id="btn-membros-voltar" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-all outline-none">
                    <i class="ph ph-arrow-left text-xl text-texto"></i>
                </button>
                <span class="text-sm font-bold text-ouro tracking-widest uppercase">Membros da Banda</span>
                <div class="w-10 h-10"></div>
            </header>

            <div class="w-full max-w-md flex flex-col gap-4 relative z-10 animate-[fadeIn_0.3s_ease-in-out]">
                <span class="text-xs text-texto/40 font-bold uppercase tracking-widest px-1">Equipe de Louvor (${equipe.length})</span>
                
                ${equipe.length > 0 ? equipe.map(membro => `
                    <div class="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 shadow-md backdrop-blur-md">
                        <div class="w-12 h-12 rounded-full border border-ouro/30 bg-black/50 flex items-center justify-center overflow-hidden shrink-0">
                            ${membro.fotoUrl ? `<img src="${membro.fotoUrl}" class="w-full h-full object-cover">` : `<i class="ph-fill ph-user text-xl text-ouro-claro"></i>`}
                        </div>
                        <div class="flex flex-col gap-1">
                            <h3 class="text-sm font-bold text-texto">${membro.nome}</h3>
                            <div class="flex flex-wrap gap-1">
                                ${membro.funcoes && membro.funcoes.length > 0 
                                    ? membro.funcoes.map(f => `<span class="text-[9px] bg-ouro/10 text-ouro-claro border border-ouro/20 font-bold px-2 py-0.5 rounded-full">${f}</span>`).join('') 
                                    : '<span class="text-[9px] text-texto/30 italic">Sem função registrada</span>'}
                            </div>
                        </div>
                    </div>
                `).join('') : `
                    <div class="flex flex-col items-center justify-center py-10">
                        <i class="ph ph-users-slash text-4xl text-texto/30 mb-3"></i>
                        <p class="text-texto/50 text-sm text-center">Nenhum membro registrado ainda.</p>
                    </div>
                `}
            </div>
        </div>
    `;
    
    document.getElementById('btn-membros-voltar').addEventListener('click', () => {
        renderizarInicio();
    });
}
