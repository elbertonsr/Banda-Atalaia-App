import { renderizarInicio } from './inicio.js';

export function renderizarMembros() {
  const app = document.getElementById('app');
  
  // Dados mocados simulando o retorno dos perfis cadastrados no Supabase
  const equipe = [
    { nome: 'Arthur Vasconcelos', funcoes: ['Líder', 'Vocalista'], foto: '' },
    { nome: 'Sarah Bezerra', funcoes: ['Tecladista', 'Diretor Musical'], foto: '' },
    { nome: 'David Lucas', funcoes: ['Guitarrista'], foto: '' },
    { nome: 'Matheus Rocha', funcoes: ['Baterista'], foto: '' },
    { nome: 'Rebeca Souza', funcoes: ['Vocalista'], foto: '' }
  ];
  
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
                
                ${equipe.map(membro => `
                    <div class="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 shadow-md backdrop-blur-md">
                        <div class="w-12 h-12 rounded-full border border-ouro/30 bg-black/50 flex items-center justify-center overflow-hidden">
                            ${membro.foto ? `<img src="${membro.foto}" class="w-full h-full object-cover">` : `<i class="ph-fill ph-user text-xl text-ouro-claro"></i>`}
                        </div>
                        <div class="flex flex-col gap-1">
                            <h3 class="text-sm font-bold text-texto">${membro.nome}</h3>
                            <div class="flex flex-wrap gap-1">
                                ${membro.funcoes.map(f => `<span class="text-[9px] bg-ouro/10 text-ouro-claro border border-ouro/20 font-bold px-2 py-0.5 rounded-full">${f}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
  
  document.getElementById('btn-membros-voltar').addEventListener('click', () => {
    renderizarInicio();
  });
}
