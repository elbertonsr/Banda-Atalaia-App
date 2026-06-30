// BANDA ATALAIA APP - Módulo de Repertório Atualizado
// Arquitetura Reativa Vanilla JS com Tailwind CSS

import { obterRepertorio, adicionarCancao, atualizarCancao, deletarCancao } from '../supabase.js';

// Banco de dados em memória (Agora começa vazio e reflete o Supabase)
let musicasCadastradas = [];

// Lista de tons padronizados para seleção
const listaTonsDisponiveis = [
    'C', 'Cm', 'C#', 'C#m', 'D', 'Dm', 'D#', 'D#m', 'E', 'Em', 'F', 'Fm', 'F#', 'F#m', 'G', 'Gm', 'G#', 'G#m', 'A', 'Am', 'A#', 'A#m', 'B', 'Bm'
];

// Lista de estilos musicais predefinidos
const listaEstilosDisponiveis = [
    'Worship', 'Corinho de Fogo', 'Celebração', 'Tradicional', 'Pop/Rock', 'Contemporânea'
];

// Estado atual da tela
let estadoRepertorio = {
    abaAtiva: 'cancoes', // 'cancoes', 'artistas', 'detalhes-artista', 'detalhes-cancao', 'cadastro', 'edicao'
    filtro: 'az', // 'az', 'za', 'recente'
    filtroEstilo: '', 
    filtroTom: '',
    menuFiltroAberto: false,
    termoBusca: '',
    artistaSelecionado: null,
    cancaoSelecionadaId: null
};

let listenerGlobalAdicionado = false;

export function obterTemplateAba() {
    return `<div id="raiz-repertorio" class="w-full h-full flex flex-col items-center"></div>`;
}

export async function inicializarEventosAba() {
    // Injeção do CSS obrigatório e isolado do módulo
    if (!document.getElementById('estilos-repertorio')) {
        const style = document.createElement('style');
        style.id = 'estilos-repertorio';
        style.innerHTML = `
            @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fadeIn { animation: fadeIn 0.3s ease-in-out forwards; }
            select option { background-color: #0D0D0D; color: #FFFAFA; }
        `;
        document.head.appendChild(style);
    }

    // Recebe e processa comandos de roteamento vindos da aba de Agenda
    if (window.RepertorioMusicaId) {
        estadoRepertorio.cancaoSelecionadaId = window.RepertorioMusicaId;
        estadoRepertorio.abaAtiva = 'detalhes-cancao';
        window.RepertorioMusicaId = null; // Limpa para evitar loops
    }

    // Controle global robusto para fechar o menu de filtros ao clicar fora
    if (!listenerGlobalAdicionado) {
        document.addEventListener('click', (e) => {
            if (estadoRepertorio.abaAtiva === 'cancoes' || estadoRepertorio.abaAtiva === 'artistas') {
                const dropdownFiltro = document.getElementById('dropdown-filtro');
                const btnFiltro = document.getElementById('btn-filtro');
                if (estadoRepertorio.menuFiltroAberto && dropdownFiltro && btnFiltro && !dropdownFiltro.contains(e.target) && !btnFiltro.contains(e.target)) {
                    estadoRepertorio.menuFiltroAberto = false;
                    renderizarInterface();
                }
            }
        });
        listenerGlobalAdicionado = true;
    }

    // TELA DE CARREGAMENTO INICIAL
    const raiz = document.getElementById('raiz-repertorio');
    if (raiz) {
        raiz.innerHTML = `
            <div class="w-full h-full flex flex-col items-center justify-center pt-32 pb-44">
                <i class="ph ph-spinner-gap text-4xl text-ouro animate-spin mb-4"></i>
                <p class="text-texto/50 text-sm tracking-widest uppercase">Buscando Canções...</p>
            </div>
        `;
    }

    // Busca dados reais do Supabase
    const { data } = await obterRepertorio();
    if (data) {
        musicasCadastradas = data;
    }

    renderizarInterface();
}

// Motor de Renderização Reativo
function renderizarInterface() {
    const raiz = document.getElementById('raiz-repertorio');
    if (!raiz) return;

    switch (estadoRepertorio.abaAtiva) {
        case 'cadastro':
            raiz.innerHTML = renderizarTelaCadastro();
            configurarEventosCadastro();
            break;
        case 'edicao':
            raiz.innerHTML = renderizarTelaEdicao();
            configurarEventosEdicao();
            break;
        case 'detalhes-artista':
            raiz.innerHTML = renderizarTelaDetalhesArtista();
            configurarEventosDetalhesArtista();
            break;
        case 'detalhes-cancao':
            raiz.innerHTML = renderizarTelaDetalhesCancao();
            configurarEventosDetalhesCancao();
            break;
        default:
            raiz.innerHTML = renderizarTelaPrincipal();
            configurarEventosPrincipal();
            break;
    }
}

// Helper para renderizar os Badges coloridos por estilo musical
function obterBadgeEstilo(estilo) {
    let cores = 'bg-white/5 text-texto/60 border-white/10';
    switch (estilo) {
        case 'Worship':
            cores = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
            break;
        case 'Corinho de Fogo':
            cores = 'bg-red-500/10 text-orange-400 border-red-500/20';
            break;
        case 'Celebração':
            cores = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
            break;
        case 'Tradicional':
            cores = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
            break;
        case 'Pop/Rock':
            cores = 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20';
            break;
    }
    return `<span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${cores}">${estilo || 'Contemporânea'}</span>`;
}

// ==========================================
// RENDERIZAÇÕES DE TELA
// ==========================================

function renderizarTelaPrincipal() {
return `
        <div class="w-full max-w-xl relative h-full">
            
            <div class="w-full flex flex-col gap-4 animate-fadeIn">
                
                <div class="flex items-center gap-3 w-full">
                    <div class="relative flex-1">
                        <i class="ph ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-texto/40 text-lg"></i>
                        <input type="text" id="busca-musica" value="${estadoRepertorio.termoBusca}" placeholder="Buscar repertório..." class="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-texto placeholder-texto/30 focus:outline-none focus:border-ouro transition-all">
                    </div>
                    <div class="relative">
                        <button id="btn-filtro" class="w-12 h-12 rounded-xl border flex items-center justify-center transition-all outline-none ${estadoRepertorio.menuFiltroAberto || estadoRepertorio.filtroEstilo || estadoRepertorio.filtroTom ? 'bg-ouro/10 text-ouro border-ouro/30' : 'bg-white/5 border-white/10 text-ouro hover:bg-white/10'}">
                            <i class="ph ph-sliders-horizontal text-xl"></i>
                        </button>
                        <div id="dropdown-filtro" class="${estadoRepertorio.menuFiltroAberto ? 'flex' : 'hidden'} absolute top-full right-0 mt-2 w-56 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl flex-col p-3 shadow-2xl z-50">
                            <span class="text-[10px] text-texto/40 font-bold uppercase tracking-widest px-2 pb-1">Ordenar por</span>
                            <button data-filtro="az" class="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-left ${estadoRepertorio.filtro === 'az' ? 'text-ouro bg-ouro/10' : 'text-texto hover:bg-white/5'} transition-colors outline-none mb-1"><i class="ph ph-sort-ascending text-lg"></i> Ordem (A-Z)</button>
                            <button data-filtro="za" class="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-left ${estadoRepertorio.filtro === 'za' ? 'text-ouro bg-ouro/10' : 'text-texto hover:bg-white/5'} transition-colors outline-none mb-1"><i class="ph ph-sort-descending text-lg"></i> Ordem (Z-A)</button>
                            <button data-filtro="recente" class="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-left ${estadoRepertorio.filtro === 'recente' ? 'text-ouro bg-ouro/10' : 'text-texto hover:bg-white/5'} transition-colors outline-none"><i class="ph ph-clock text-lg"></i> Mais Recentes</button>
                            
                            <div class="h-px w-full bg-white/10 my-3"></div>
                            
                            <span class="text-[10px] text-texto/40 font-bold uppercase tracking-widest px-2 pb-2">Filtrar por</span>
                            <select id="filtro-estilo" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-texto outline-none mb-2 cursor-pointer transition-all focus:border-ouro/50">
                                <option value="">Todos os Estilos</option>
                                ${listaEstilosDisponiveis.map(e => `<option value="${e}" ${estadoRepertorio.filtroEstilo === e ? 'selected' : ''}>${e}</option>`).join('')}
                            </select>
                            <select id="filtro-tom" class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-texto outline-none cursor-pointer transition-all focus:border-ouro/50">
                                <option value="">Todos os Tons</option>
                                ${listaTonsDisponiveis.map(t => `<option value="${t}" ${estadoRepertorio.filtroTom === t ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <div class="flex p-1 bg-white/5 border border-white/10 rounded-xl mt-2">
                    <button id="tab-cancoes" class="flex-1 py-2 text-sm font-bold rounded-lg transition-all outline-none ${estadoRepertorio.abaAtiva === 'cancoes' ? 'bg-ouro text-fundo shadow-md' : 'text-texto/50 hover:text-texto'}">Canções</button>
                    <button id="tab-artistas" class="flex-1 py-2 text-sm font-bold rounded-lg transition-all outline-none ${estadoRepertorio.abaAtiva === 'artistas' ? 'bg-ouro text-fundo shadow-md' : 'text-texto/50 hover:text-texto'}">Artistas</button>
                </div>

                <div class="flex flex-col gap-3 mt-2 pb-44 w-full">
                    ${estadoRepertorio.abaAtiva === 'cancoes' ? gerarListaCancoes() : gerarListaArtistas()}
                </div>

            </div>

            <button id="btn-nova-cancao" class="fixed bottom-28 right-6 w-14 h-14 bg-ouro hover:bg-ouro-brilhante rounded-full shadow-[0_4px_20px_rgba(242,183,5,0.4)] flex items-center justify-center text-fundo transition-transform hover:scale-105 active:scale-95 outline-none z-50">
                <i class="ph ph-plus text-2xl font-bold"></i>
            </button>
        </div>
    `;
}

function renderizarTelaDetalhesArtista() {
    const musicasDoArtista = musicasCadastradas.filter(m => m.artista === estadoRepertorio.artistaSelecionado);
    
    return `
        <div class="w-full max-w-xl flex flex-col gap-4 animate-fadeIn w-full">
            <div class="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                <button id="btn-voltar-artistas" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-texto outline-none">
                    <i class="ph ph-arrow-left text-xl"></i>
                </button>
                <div class="flex flex-col">
                    <span class="text-[10px] text-ouro-claro font-bold uppercase tracking-widest">Repertório do Artista</span>
                    <h2 class="text-xl font-bold text-texto">${estadoRepertorio.artistaSelecionado}</h2>
                </div>
            </div>

            <div class="flex flex-col gap-3 mt-2">
                ${musicasDoArtista.length > 0 
                    ? musicasDoArtista.map(m => componenteCartaoMusica(m)).join('') 
                    : '<p class="text-texto/40 text-sm text-center py-8">Nenhuma canção encontrada.</p>'}
            </div>
        </div>
    `;
}

function renderizarTelaDetalhesCancao() {
    // Usando conversão implícita ou toString para garantir equivalência entre UUID string e int
    const musica = musicasCadastradas.find(m => String(m.id) === String(estadoRepertorio.cancaoSelecionadaId));
    if (!musica) return `<p class="text-center text-texto/50 py-10">Canção não encontrada.</p>`;

    const dataFormatada = new Date(musica.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return `
        <div class="w-full max-w-xl flex flex-col gap-4 animate-fadeIn w-full pb-12">
            <div class="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                <div class="flex items-center gap-3">
                    <button id="btn-voltar-detalhes" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-texto outline-none">
                        <i class="ph ph-arrow-left text-xl"></i>
                    </button>
                    <div class="flex flex-col">
                        <h2 class="text-base font-bold text-texto leading-tight">${musica.titulo}</h2>
                        <span class="text-xs text-texto/50">${musica.artista}</span>
                    </div>
                </div>
                
                <div class="flex gap-2">
                    <button id="btn-editar-cancao" class="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-ouro hover:bg-white/10 transition-colors outline-none" title="Editar">
                        <i class="ph ph-pencil-simple text-lg"></i>
                    </button>
                    <button id="btn-deletar-cancao" class="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors outline-none" title="Excluir">
                        <i class="ph ph-trash text-lg"></i>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-ouro/10 text-ouro flex items-center justify-center font-bold">${musica.tom || '-'}</div>
                    <div class="flex flex-col">
                        <span class="text-[9px] font-bold text-texto/40 uppercase tracking-widest">Tom</span>
                        <span class="text-xs font-bold text-texto">Tom Original</span>
                    </div>
                </div>
                <div class="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3">
                    <div class="flex flex-col pl-2">
                        <span class="text-[9px] font-bold text-texto/40 uppercase tracking-widest block mb-1">Estilo</span>
                        ${obterBadgeEstilo(musica.estilo)}
                    </div>
                </div>
            </div>

            <div class="w-full text-right px-2">
                <span class="text-[10px] text-texto/40 font-medium">Adicionado em: ${dataFormatada}</span>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                <h3 class="text-xs font-bold text-ouro uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Letra da Canção</h3>
                <div class="text-sm text-texto/90 leading-relaxed whitespace-pre-line select-text select-all font-sans">
                    ${musica.letra ? musica.letra : '<em class="text-texto/30">Nenhuma letra cadastrada para esta canção.</em>'}
                </div>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                <h3 class="text-xs font-bold text-ouro uppercase tracking-widest mb-2">Informações / Observações</h3>
                <p class="text-xs text-texto/70 leading-relaxed">${musica.info ? musica.info : 'Sem observações adicionais.'}</p>
            </div>

            <div class="flex flex-col gap-2">
                ${musica.link ? `
                    <a href="${musica.link}" target="_blank" class="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 flex items-center justify-between transition-colors">
                        <div class="flex items-center gap-3 text-ouro-claro">
                            <i class="ph-fill ph-play-circle text-xl"></i>
                            <span class="text-xs font-bold text-texto">Link de Referência Externo</span>
                        </div>
                        <i class="ph ph-arrow-square-out text-texto/40"></i>
                    </a>
                ` : ''}

                <div class="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div class="flex items-center gap-3 text-texto/50">
                        <i class="ph ph-paperclip text-xl"></i>
                        <span class="text-xs font-medium text-texto/70">${musica.anexo ? 'Arquivo Anexado' : 'Nenhuma cifra/PDF anexado'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderizarTelaCadastro() {
    return `
        <div class="w-full max-w-xl flex flex-col gap-4 animate-fadeIn w-full pb-10">
            <div class="flex items-center gap-4 mb-2">
                <button id="btn-cancelar-cadastro" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-texto transition-all outline-none">
                    <i class="ph ph-arrow-left text-xl"></i>
                </button>
                <h2 class="text-lg font-bold tracking-wide text-ouro">Nova Canção</h2>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col gap-4 backdrop-blur-md shadow-2xl">
                
                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Título da Canção *</label>
                    <input type="text" id="cad-titulo" placeholder="Ex: Bondade de Deus" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all">
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Artista/Banda *</label>
                    <input type="text" id="cad-artista" placeholder="Ex: Isaías Saad" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all">
                </div>

                <div class="flex gap-4">
                    <div class="flex flex-col gap-1.5 flex-[1]">
                        <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Tom Original *</label>
                        <select id="cad-tom" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-3 text-sm text-texto focus:outline-none focus:border-ouro transition-all font-bold cursor-pointer">
                            <option value="">Selecione...</option>
                            ${listaTonsDisponiveis.map(t => `<option value="${t}">${t}</option>`).join('')}
                        </select>
                    </div>
                    <div class="flex flex-col gap-1.5 flex-[1.5]">
                        <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Estilo Musical *</label>
                        <select id="cad-estilo" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-3 text-sm text-texto focus:outline-none focus:border-ouro transition-all cursor-pointer">
                            <option value="">Selecione...</option>
                            ${listaEstilosDisponiveis.map(e => `<option value="${e}">${e}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Letra da Canção</label>
                    <textarea id="cad-letra" rows="4" placeholder="Cole a letra aqui..." class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all resize-none"></textarea>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Informações / Observações</label>
                    <textarea id="cad-info" rows="2" placeholder="Ex: Entrada suave, bateria apenas no refrão..." class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all resize-none"></textarea>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Link de Referência (YouTube/Spotify)</label>
                    <div class="relative flex items-center">
                        <i class="ph ph-link absolute left-4 text-texto/40"></i>
                        <input type="url" id="cad-link" placeholder="https://" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all">
                    </div>
                </div>

                <div class="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Anexo (Cifra em PDF ou Imagem)</label>
                    <label class="w-full bg-black/40 hover:bg-black/60 border border-white/10 hover:border-ouro/50 border-dashed rounded-xl py-4 px-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
                        <div class="w-10 h-10 rounded-full bg-white/5 group-hover:bg-ouro/10 flex items-center justify-center transition-all">
                            <i class="ph ph-upload-simple text-xl text-texto/50 group-hover:text-ouro"></i>
                        </div>
                        <span class="text-xs text-texto/50 group-hover:text-texto/80" id="txt-arquivo">Toque para selecionar arquivo</span>
                        <input type="file" id="cad-anexo" accept=".pdf,image/*" class="hidden">
                    </label>
                </div>

                <button id="btn-salvar-cancao" class="w-full mt-4 bg-gradient-to-r from-ouro-escuro via-ouro to-ouro-claro hover:from-ouro hover:to-ouro-brilhante text-fundo font-bold text-sm tracking-widest uppercase py-4 rounded-xl shadow-[0_4px_20px_rgba(242,183,5,0.25)] transition-all active:scale-[0.98] outline-none">
                    Adicionar ao Repertório
                </button>
            </div>
        </div>
    `;
}

function renderizarTelaEdicao() {
    const musica = musicasCadastradas.find(m => String(m.id) === String(estadoRepertorio.cancaoSelecionadaId));
    if (!musica) return `<p class="text-center text-texto/50 py-10">Erro ao carregar canção.</p>`;

    return `
        <div class="w-full max-w-xl flex flex-col gap-4 animate-fadeIn w-full pb-10">
            <div class="flex items-center gap-4 mb-2">
                <button id="btn-cancelar-edicao" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-texto transition-all outline-none">
                    <i class="ph ph-arrow-left text-xl"></i>
                </button>
                <h2 class="text-lg font-bold tracking-wide text-ouro">Editar Canção</h2>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col gap-4 backdrop-blur-md shadow-2xl">
                
                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Título da Canção *</label>
                    <input type="text" id="edit-titulo" value="${musica.titulo}" placeholder="Ex: Bondade de Deus" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all">
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Artista/Banda *</label>
                    <input type="text" id="edit-artista" value="${musica.artista}" placeholder="Ex: Isaías Saad" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all">
                </div>

                <div class="flex gap-4">
                    <div class="flex flex-col gap-1.5 flex-[1]">
                        <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Tom Original *</label>
                        <select id="edit-tom" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-3 text-sm text-texto focus:outline-none focus:border-ouro transition-all font-bold cursor-pointer">
                            <option value="">Selecione...</option>
                            ${listaTonsDisponiveis.map(t => `<option value="${t}" ${musica.tom === t ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                    </div>
                    <div class="flex flex-col gap-1.5 flex-[1.5]">
                        <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Estilo Musical *</label>
                        <select id="edit-estilo" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-3 text-sm text-texto focus:outline-none focus:border-ouro transition-all cursor-pointer">
                            <option value="">Selecione...</option>
                            ${listaEstilosDisponiveis.map(e => `<option value="${e}" ${musica.estilo === e ? 'selected' : ''}>${e}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Letra da Canção</label>
                    <textarea id="edit-letra" rows="4" placeholder="Cole a letra aqui..." class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all resize-none">${musica.letra || ''}</textarea>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Informações / Observações</label>
                    <textarea id="edit-info" rows="2" placeholder="Ex: Entrada suave..." class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all resize-none">${musica.info || ''}</textarea>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Link de Referência</label>
                    <div class="relative flex items-center">
                        <i class="ph ph-link absolute left-4 text-texto/40"></i>
                        <input type="url" id="edit-link" value="${musica.link || ''}" placeholder="https://" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all">
                    </div>
                </div>

                <button id="btn-atualizar-cancao" class="w-full mt-4 bg-gradient-to-r from-ouro-escuro via-ouro to-ouro-claro hover:from-ouro hover:to-ouro-brilhante text-fundo font-bold text-sm tracking-widest uppercase py-4 rounded-xl shadow-[0_4px_20px_rgba(242,183,5,0.25)] transition-all active:scale-[0.98] outline-none">
                    Salvar Alterações
                </button>
            </div>
        </div>
    `;
}

// ==========================================
// COMPONENTES & PROCESSAMENTO DE DADOS
// ==========================================

function obterMusicasFiltradas() {
    let lista = [...musicasCadastradas];

    if (estadoRepertorio.termoBusca) {
        const termo = estadoRepertorio.termoBusca.toLowerCase();
        lista = lista.filter(m => m.titulo.toLowerCase().includes(termo) || m.artista.toLowerCase().includes(termo));
    }

    if (estadoRepertorio.filtroEstilo) {
        lista = lista.filter(m => m.estilo === estadoRepertorio.filtroEstilo);
    }
    if (estadoRepertorio.filtroTom) {
        lista = lista.filter(m => m.tom === estadoRepertorio.filtroTom);
    }

    if (estadoRepertorio.filtro === 'az') {
        lista.sort((a, b) => a.titulo.localeCompare(b.titulo));
    } else if (estadoRepertorio.filtro === 'za') {
        lista.sort((a, b) => b.titulo.localeCompare(a.titulo));
    } else if (estadoRepertorio.filtro === 'recente') {
        lista.sort((a, b) => new Date(b.data) - new Date(a.data));
    }

    return lista;
}

function gerarListaCancoes() {
    const lista = obterMusicasFiltradas();
    if (lista.length === 0) {
        return `<div class="text-center py-10"><i class="ph ph-music-notes-simple text-4xl text-texto/20 mb-2"></i><p class="text-texto/40 text-sm">Nenhuma canção encontrada.</p></div>`;
    }
    return lista.map(m => componenteCartaoMusica(m)).join('');
}

function gerarListaArtistas() {
    let lista = [...musicasCadastradas];
    
    if (estadoRepertorio.termoBusca) {
        const termo = estadoRepertorio.termoBusca.toLowerCase();
        lista = lista.filter(m => m.artista.toLowerCase().includes(termo));
    }

    const artistasUnicos = [...new Set(lista.map(m => m.artista))].sort();

    if (artistasUnicos.length === 0) {
        return `<div class="text-center py-10"><i class="ph ph-microphone-stage text-4xl text-texto/20 mb-2"></i><p class="text-texto/40 text-sm">Nenhum artista encontrado.</p></div>`;
    }

    return artistasUnicos.map(artista => {
        const qtdCancoes = musicasCadastradas.filter(m => m.artista === artista).length;
        return `
            <div data-artista="${artista}" class="cartao-artista bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md shadow-md cursor-pointer transition-all active:scale-[0.98]">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-ouro/20 to-black/50 border border-ouro/30 flex items-center justify-center">
                        <i class="ph-fill ph-microphone-stage text-xl text-ouro-claro"></i>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-texto leading-tight">${artista}</h4>
                        <span class="text-[11px] text-ouro-claro font-medium">${qtdCancoes} ${qtdCancoes > 1 ? 'canções' : 'canção'}</span>
                    </div>
                </div>
                <i class="ph ph-caret-right text-texto/40"></i>
            </div>
        `;
    }).join('');
}

function componenteCartaoMusica(musica) {
    const dataFormatada = new Date(musica.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return `
        <div data-id="${musica.id}" class="cartao-musica bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md shadow-md hover:bg-white/[0.07] transition-all cursor-pointer active:scale-[0.99]">
            <div class="flex items-center gap-4 overflow-hidden">
                <div class="w-11 h-11 rounded-xl bg-ouro/10 border border-ouro/20 flex items-center justify-center font-bold text-ouro text-sm shadow-inner shrink-0">${musica.tom || '-'}</div>
                <div class="flex flex-col gap-1.5 overflow-hidden">
                    <h4 class="text-sm font-bold text-texto leading-tight truncate">${musica.titulo}</h4>
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-[11px] text-texto/60">${musica.artista}</span>
                        <span class="text-texto/30 text-[10px]">•</span>
                        ${obterBadgeEstilo(musica.estilo)}
                    </div>
                    <span class="text-[10px] text-texto/40 font-medium flex items-center gap-1 mt-0.5"><i class="ph ph-calendar-plus"></i> ${dataFormatada}</span>
                </div>
            </div>
            <div class="flex gap-2 shrink-0">
                <button class="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-ouro hover:bg-white/10 transition-all outline-none" title="Ver Detalhes">
                    <i class="ph ph-file-text text-lg"></i>
                </button>
            </div>
        </div>
    `;
}

// ==========================================
// EVENTOS & INTERAÇÕES
// ==========================================

function configurarEventosPrincipal() {
    // Alternar Abas
    document.getElementById('tab-cancoes').addEventListener('click', () => {
        estadoRepertorio.abaAtiva = 'cancoes';
        renderizarInterface();
    });
    document.getElementById('tab-artistas').addEventListener('click', () => {
        estadoRepertorio.abaAtiva = 'artistas';
        renderizarInterface();
    });

    const inputBusca = document.getElementById('busca-musica');
    inputBusca.addEventListener('input', (e) => {
        estadoRepertorio.termoBusca = e.target.value;
        renderizarInterface();
        const novoInput = document.getElementById('busca-musica');
        if(novoInput) {
            novoInput.focus();
            novoInput.setSelectionRange(novoInput.value.length, novoInput.value.length);
        }
    });

    const btnFiltro = document.getElementById('btn-filtro');
    btnFiltro.addEventListener('click', (e) => {
        e.stopPropagation();
        estadoRepertorio.menuFiltroAberto = !estadoRepertorio.menuFiltroAberto;
        renderizarInterface();
    });

    document.querySelectorAll('[data-filtro]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            estadoRepertorio.filtro = e.currentTarget.getAttribute('data-filtro');
            estadoRepertorio.menuFiltroAberto = true;
            renderizarInterface();
        });
    });

    const selectEstilo = document.getElementById('filtro-estilo');
    if (selectEstilo) {
        selectEstilo.addEventListener('change', (e) => {
            estadoRepertorio.filtroEstilo = e.target.value;
            estadoRepertorio.menuFiltroAberto = true;
            renderizarInterface();
        });
    }

    const selectTom = document.getElementById('filtro-tom');
    if (selectTom) {
        selectTom.addEventListener('change', (e) => {
            estadoRepertorio.filtroTom = e.target.value;
            estadoRepertorio.menuFiltroAberto = true;
            renderizarInterface();
        });
    }

    document.querySelectorAll('.cartao-artista').forEach(cartao => {
        cartao.addEventListener('click', (e) => {
            estadoRepertorio.artistaSelecionado = e.currentTarget.getAttribute('data-artista');
            estadoRepertorio.abaAtiva = 'detalhes-artista';
            renderizarInterface();
        });
    });

    document.querySelectorAll('.cartao-musica').forEach(cartao => {
        cartao.addEventListener('click', (e) => {
            estadoRepertorio.cancaoSelecionadaId = e.currentTarget.getAttribute('data-id');
            estadoRepertorio.abaAtiva = 'detalhes-cancao';
            renderizarInterface();
        });
    });

    document.getElementById('btn-nova-cancao').addEventListener('click', () => {
        estadoRepertorio.abaAtiva = 'cadastro';
        renderizarInterface();
    });
}

function configurarEventosDetalhesArtista() {
    document.getElementById('btn-voltar-artistas').addEventListener('click', () => {
        estadoRepertorio.artistaSelecionado = null;
        estadoRepertorio.abaAtiva = 'artistas';
        renderizarInterface();
    });

    document.querySelectorAll('.cartao-musica').forEach(cartao => {
        cartao.addEventListener('click', (e) => {
            estadoRepertorio.cancaoSelecionadaId = e.currentTarget.getAttribute('data-id');
            estadoRepertorio.abaAtiva = 'detalhes-cancao';
            renderizarInterface();
        });
    });
}

function configurarEventosDetalhesCancao() {
    document.getElementById('btn-voltar-detalhes').addEventListener('click', () => {
        // Se a requisição de visualizar música veio da página de Agenda, retorna para Agenda
        if (window.RepertorioOrigem === 'agenda') {
            window.RepertorioOrigem = null;
            const btnAbaAgenda = document.querySelector('button[data-aba="agenda"]');
            if (btnAbaAgenda) {
                btnAbaAgenda.click();
                return;
            }
        }

        if (estadoRepertorio.artistaSelecionado) {
            estadoRepertorio.abaAtiva = 'detalhes-artista';
        } else {
            estadoRepertorio.abaAtiva = 'cancoes';
        }
        renderizarInterface();
    });

    document.getElementById('btn-editar-cancao').addEventListener('click', () => {
        estadoRepertorio.abaAtiva = 'edicao';
        renderizarInterface();
    });

    document.getElementById('btn-deletar-cancao').addEventListener('click', async () => {
        if (confirm("Tem certeza de que deseja excluir permanentemente esta canção do repertório?")) {
            
            const btnDeletar = document.getElementById('btn-deletar-cancao');
            btnDeletar.innerHTML = `<i class="ph ph-spinner animate-spin text-lg"></i>`;
            
            const { sucesso, error } = await deletarCancao(estadoRepertorio.cancaoSelecionadaId);
            
            if (sucesso) {
                musicasCadastradas = musicasCadastradas.filter(m => String(m.id) !== String(estadoRepertorio.cancaoSelecionadaId));
                estadoRepertorio.cancaoSelecionadaId = null;
                estadoRepertorio.abaAtiva = 'cancoes';
                renderizarInterface();
            } else {
                alert("Erro ao excluir canção: " + error?.message);
                btnDeletar.innerHTML = `<i class="ph ph-trash text-lg"></i>`;
            }
        }
    });
}

function configurarEventosCadastro() {
    document.getElementById('btn-cancelar-cadastro').addEventListener('click', () => {
        estadoRepertorio.abaAtiva = 'cancoes';
        renderizarInterface();
    });

    const cadAnexo = document.getElementById('cad-anexo');
    const txtArquivo = document.getElementById('txt-arquivo');
    cadAnexo.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            txtArquivo.textContent = e.target.files[0].name;
            txtArquivo.classList.replace('text-texto/50', 'text-ouro');
        } else {
            txtArquivo.textContent = 'Toque para selecionar arquivo';
            txtArquivo.classList.replace('text-ouro', 'text-texto/50');
        }
    });

    document.getElementById('btn-salvar-cancao').addEventListener('click', async () => {
        const titulo = document.getElementById('cad-titulo').value.trim();
        const artista = document.getElementById('cad-artista').value.trim();
        const tom = document.getElementById('cad-tom').value;
        const estilo = document.getElementById('cad-estilo').value;
        const letra = document.getElementById('cad-letra').value.trim();
        const info = document.getElementById('cad-info').value.trim();
        const link = document.getElementById('cad-link').value.trim();
        const anexo = document.getElementById('cad-anexo').files[0] || null;

        if (!titulo || !artista || !tom || !estilo) {
            alert("Por favor, preencha todos os campos obrigatórios (*)");
            return;
        }

        const novaCancao = {
            titulo,
            artista,
            tom,
            estilo,
            letra,
            info,
            link,
            data: new Date().toISOString()
        };

        const btnSalvar = document.getElementById('btn-salvar-cancao');
        btnSalvar.textContent = "Salvando no Banco...";
        
        const { data, error } = await adicionarCancao(novaCancao);
        
        if (data && !error) {
            musicasCadastradas.push(data); // Atualiza cache local
            estadoRepertorio.abaAtiva = 'cancoes';
            estadoRepertorio.termoBusca = ''; 
            estadoRepertorio.filtro = 'recente'; 
            renderizarInterface();
        } else {
            alert("Erro ao salvar: " + error?.message);
            btnSalvar.textContent = "Adicionar ao Repertório";
        }
    });
}

function configurarEventosEdicao() {
    document.getElementById('btn-cancelar-edicao').addEventListener('click', () => {
        estadoRepertorio.abaAtiva = 'detalhes-cancao';
        renderizarInterface();
    });

    document.getElementById('btn-atualizar-cancao').addEventListener('click', async () => {
        const titulo = document.getElementById('edit-titulo').value.trim();
        const artista = document.getElementById('edit-artista').value.trim();
        const tom = document.getElementById('edit-tom').value;
        const estilo = document.getElementById('edit-estilo').value;
        const letra = document.getElementById('edit-letra').value.trim();
        const info = document.getElementById('edit-info').value.trim();
        const link = document.getElementById('edit-link').value.trim();

        if (!titulo || !artista || !tom || !estilo) {
            alert("Por favor, preencha todos os campos obrigatórios (*)");
            return;
        }

        const dadosAtualizados = { titulo, artista, tom, estilo, letra, info, link };

        const btnAtualizar = document.getElementById('btn-atualizar-cancao');
        btnAtualizar.textContent = "Atualizando no Banco...";

        const { data, error } = await atualizarCancao(estadoRepertorio.cancaoSelecionadaId, dadosAtualizados);

        if (data && !error) {
            const index = musicasCadastradas.findIndex(m => String(m.id) === String(estadoRepertorio.cancaoSelecionadaId));
            if (index !== -1) {
                musicasCadastradas[index] = data; // Reflete a alteração no cache local
            }
            estadoRepertorio.abaAtiva = 'detalhes-cancao';
            renderizarInterface();
        } else {
            alert("Erro ao atualizar: " + error?.message);
            btnAtualizar.textContent = "Salvar Alterações";
        }
    });
}
