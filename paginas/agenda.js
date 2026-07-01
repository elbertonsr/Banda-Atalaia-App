// BANDA ATALAIA APP - Módulo de Agenda Integrado ao Supabase
// Arquitetura Reativa Vanilla JS com Tailwind CSS e Glassmorphism

import { supabase } from '../supabase.js';

// Helpers para manipulação de datas
const hoje = new Date();
let estadoAgenda = {
    abaAtiva: 'lista', // 'lista', 'cadastro', 'edicao'
    agendaSelecionadaId: null,
    mesAtual: hoje.getMonth(),
    anoAtual: hoje.getFullYear(),
    usuarioAtual: null, // Será preenchido via Supabase Auth
    
    // Banco de Dados Vazio - Os dados virão do Supabase
    cancoesCadastradas: [],
    agendas: [],
    
    // Controle de estado de requisição
    carregando: true 
};

let controleCarregamento = { iniciado: false };

// Configuração Visual dos Tipos de Agenda
const configTipos = {
    'Culto': { corTexto: 'text-ouro', corBg: 'bg-ouro/20', corBorda: 'border-ouro/30', icone: 'ph-church' },
    'Ensaio': { corTexto: 'text-blue-400', corBg: 'bg-blue-500/20', corBorda: 'border-blue-500/30', icone: 'ph-music-notes' },
    'Evento': { corTexto: 'text-emerald-400', corBg: 'bg-emerald-500/20', corBorda: 'border-emerald-500/30', icone: 'ph-confetti' },
    'Reunião': { corTexto: 'text-fuchsia-400', corBg: 'bg-fuchsia-500/20', corBorda: 'border-fuchsia-500/30', icone: 'ph-users-three' }
};

// =========================================================================
// FUNÇÕES ASSÍNCRONAS - COMUNICAÇÃO COM O SUPABASE
// =========================================================================
async function carregarDadosSupabase() {
    try {
        estadoAgenda.carregando = true;
        forcarAtualizacaoAgenda();

        // 1. Obter Usuário Logado
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
            const user = authData.user;
            // Busca dados do perfil se existir a tabela 'perfil', caso contrário usa o email
            const { data: perfil } = await supabase.from('perfil').select('*').eq('id', user.id).single();
            estadoAgenda.usuarioAtual = {
                id: user.id,
                nome: perfil?.nome || user.email.split('@')[0],
                foto: perfil?.foto || ''
            };
        } else {
            // Fallback de segurança caso teste localmente sem login
            estadoAgenda.usuarioAtual = { id: 'local_user', nome: 'Usuário', foto: '' };
        }

        // 2. Buscar Repertório (Canções cadastradas pelo usuário/banda)
        const { data: cancoes, error: errCancoes } = await supabase.from('repertorio').select('*');
        if (!errCancoes && cancoes) {
            estadoAgenda.cancoesCadastradas = cancoes;
        }

        // 3. Buscar Agendas Cadastradas
        const { data: agendasBd, error: errAgendas } = await supabase.from('agendas').select('*');
        if (!errAgendas && agendasBd) {
            estadoAgenda.agendas = agendasBd;
        }

    } catch (error) {
        console.error("Erro ao carregar dados do Supabase:", error);
        mostrarToast("Erro ao sincronizar com o servidor.");
    } finally {
        estadoAgenda.carregando = false;
        forcarAtualizacaoAgenda();
    }
}

// =========================================================================
// RENDERIZAÇÃO PRINCIPAL DO MÓDULO
// =========================================================================
export function obterTemplateAba() {
    // Inicia o carregamento apenas na primeira vez que a aba é acessada
    if (!controleCarregamento.iniciado) {
        controleCarregamento.iniciado = true;
        carregarDadosSupabase(); // Chama de forma assíncrona
    }

    if (!document.getElementById('estilos-agenda')) {
        const style = document.createElement('style');
        style.id = 'estilos-agenda';
        style.innerHTML = `
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: none; } }
            .animate-fadeIn { animation: fadeIn 0.4s ease-in-out forwards; }
            .avatar-stack { display: flex; align-items: center; margin-left: 8px; }
            .avatar-item { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #0D0D0D; margin-left: -8px; background-color: #1a1a1a; display: flex; align-items: center; justify-content: center; overflow: hidden; }
            .calendario-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; text-align: center; }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `;
        document.head.appendChild(style);
    }
    
    let conteudo = '';
    
    // Renderização baseada no estado
    if (estadoAgenda.carregando) conteudo = renderizarSkeletonLoading();
    else if (estadoAgenda.abaAtiva === 'cadastro') conteudo = renderizarFormularioAgenda(false);
    else if (estadoAgenda.abaAtiva === 'edicao') conteudo = renderizarFormularioAgenda(true);
    else conteudo = renderizarTelaPrincipal();
    
    return `<div id="modulo-agenda" class="w-full h-full relative">${conteudo}</div>`;
}

// =========================================================================
// RENDERIZAÇÃO: SKELETON LOADING (ESTADO DE CARREGANDO)
// =========================================================================
function renderizarSkeletonLoading() {
    return `
        <div class="w-full max-w-xl flex flex-col gap-6 animate-fadeIn pb-32">
            <div class="bg-white/5 border border-white/10 rounded-[2rem] p-5 flex flex-col items-center justify-center gap-4 backdrop-blur-md shadow-2xl min-h-[300px]">
                <i class="ph ph-spinner-gap text-4xl text-ouro animate-spin"></i>
                <p class="text-xs text-texto/50 font-bold uppercase tracking-widest mt-2">Sincronizando Agenda...</p>
            </div>
            <div class="flex flex-col gap-4">
                <div class="bg-white/5 border border-white/10 rounded-2xl p-5 h-32 animate-pulse"></div>
                <div class="bg-white/5 border border-white/10 rounded-2xl p-5 h-32 animate-pulse delay-75"></div>
            </div>
        </div>
    `;
}

// =========================================================================
// RENDERIZAÇÃO: TELA PRINCIPAL (CALENDÁRIO E LISTA)
// =========================================================================
function renderizarTelaPrincipal() {
    // Ordenar agendas cronologicamente
    const agendasOrdenadas = [...estadoAgenda.agendas].sort((a, b) => new Date(a.dataStr) - new Date(b.dataStr));
    
    // Filtrar apenas agendas do mês selecionado para a lista
    const prefixoMesAtual = `${estadoAgenda.anoAtual}-${String(estadoAgenda.mesAtual + 1).padStart(2, '0')}`;
    const agendasDoMes = agendasOrdenadas.filter(a => a.dataStr.startsWith(prefixoMesAtual));

    return `
        <div class="w-full max-w-xl flex flex-col gap-6 animate-fadeIn pb-32">
            <div class="bg-white/5 border border-white/10 rounded-[2rem] p-5 flex flex-col gap-4 backdrop-blur-md shadow-2xl">
                <div class="flex items-center justify-between">
                    <button id="btn-mes-ant" class="w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-texto/60 hover:text-ouro transition-colors outline-none"><i class="ph ph-caret-left text-lg"></i></button>
                    <div class="flex flex-col items-center">
                        <span class="text-[10px] text-texto/40 font-bold uppercase tracking-widest">Calendário</span>
                        <h2 class="text-base font-bold text-ouro tracking-wide capitalize">${obterNomeMes(estadoAgenda.mesAtual)} ${estadoAgenda.anoAtual}</h2>
                    </div>
                    <button id="btn-mes-prox" class="w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-texto/60 hover:text-ouro transition-colors outline-none"><i class="ph ph-caret-right text-lg"></i></button>
                </div>
                
                <div class="w-full bg-black/20 rounded-xl p-4 border border-white/5">
                    <div class="calendario-grid mb-2">
                        ${['D','S','T','Q','Q','S','S'].map(dia => `<div class="text-[10px] font-bold text-texto/30 uppercase">${dia}</div>`).join('')}
                    </div>
                    <div class="calendario-grid">
                        ${gerarDiasCalendarioHTML()}
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-2 px-1">
                <i class="ph-fill ph-calendar-check text-ouro text-xl"></i>
                <h3 class="text-lg font-bold text-texto tracking-wide">Compromissos</h3>
            </div>

            <div class="flex flex-col gap-4">
                ${agendasDoMes.length > 0 
                    ? agendasDoMes.map(agenda => renderizarCardAgenda(agenda)).join('') 
                    : `<div class="text-center py-10 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm"><i class="ph ph-calendar-slash text-4xl text-texto/20 mb-2"></i><p class="text-texto/40 text-sm">Nenhum compromisso para este mês.</p></div>`
                }
            </div>
        </div>

        <button id="btn-nova-agenda" class="fixed bottom-28 right-6 w-14 h-14 bg-ouro hover:bg-ouro-brilhante rounded-full shadow-[0_4px_20px_rgba(242,183,5,0.4)] flex items-center justify-center text-fundo transition-transform hover:scale-105 active:scale-95 outline-none z-50">
            <i class="ph ph-plus text-2xl font-bold"></i>
        </button>
    `;
}

// =========================================================================
// RENDERIZAÇÃO: FORMULÁRIO DE AGENDA (CRIAR / EDITAR)
// =========================================================================
function renderizarFormularioAgenda(isEdicao) {
    let agenda = { tipo: 'Culto', titulo: '', dataStr: '', horaInicio: '', horaFim: '', local: '', informacoes: '', link: '', repertorio: [] };
    
    if (isEdicao) {
        const existente = estadoAgenda.agendas.find(a => a.id === estadoAgenda.agendaSelecionadaId);
        if (existente) agenda = { ...existente };
    }

    return `
        <div class="w-full max-w-xl flex flex-col gap-4 animate-fadeIn pb-12">
            <div class="flex items-center gap-4 mb-2">
                <button id="btn-cancelar-agenda" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-texto transition-all outline-none">
                    <i class="ph ph-arrow-left text-xl"></i>
                </button>
                <h2 class="text-lg font-bold tracking-wide text-ouro">${isEdicao ? 'Editar Compromisso' : 'Nova Agenda'}</h2>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col gap-4 backdrop-blur-md shadow-2xl">
                
                <div class="flex gap-4">
                    <div class="flex flex-col gap-1.5 flex-[1.5]">
                        <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Tipo de Agenda *</label>
                        <select id="form-tipo" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-3 text-sm text-texto focus:outline-none focus:border-ouro transition-all cursor-pointer">
                            <option value="Culto" ${agenda.tipo === 'Culto' ? 'selected' : ''}>Culto</option>
                            <option value="Ensaio" ${agenda.tipo === 'Ensaio' ? 'selected' : ''}>Ensaio</option>
                            <option value="Evento" ${agenda.tipo === 'Evento' ? 'selected' : ''}>Evento</option>
                            <option value="Reunião" ${agenda.tipo === 'Reunião' ? 'selected' : ''}>Reunião</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-1.5 flex-[1]">
                        <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Data *</label>
                        <input type="date" id="form-data" value="${agenda.dataStr}" required class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-3 text-sm text-texto focus:outline-none focus:border-ouro transition-all css-color-scheme-dark" style="color-scheme: dark;">
                    </div>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Título da Agenda *</label>
                    <input type="text" id="form-titulo" value="${agenda.titulo}" placeholder="Ex: Culto de Celebração" required class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all">
                </div>

                <div class="flex gap-4">
                    <div class="flex flex-col gap-1.5 flex-1">
                        <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Início *</label>
                        <input type="time" id="form-hora-inicio" value="${agenda.horaInicio}" required class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all css-color-scheme-dark" style="color-scheme: dark;">
                    </div>
                    <div class="flex flex-col gap-1.5 flex-1">
                        <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Término (Opcional)</label>
                        <input type="time" id="form-hora-fim" value="${agenda.horaFim}" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all css-color-scheme-dark" style="color-scheme: dark;">
                    </div>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Local *</label>
                    <div class="relative flex items-center">
                        <i class="ph ph-map-pin absolute left-4 text-texto/40"></i>
                        <input type="text" id="form-local" value="${agenda.local}" placeholder="Ex: Nave Central da Igreja" required class="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all">
                    </div>
                </div>
                
                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Link (Opcional)</label>
                    <div class="relative flex items-center">
                        <i class="ph ph-link absolute left-4 text-texto/40"></i>
                        <input type="url" id="form-link" value="${agenda.link || ''}" placeholder="Ex: URL do Google Maps, YouTube..." class="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all">
                    </div>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Repertório (Obrigatório) *</label>
                    <div class="flex flex-col gap-2 max-h-48 overflow-y-auto bg-black/20 p-3 rounded-xl border border-white/5 hide-scrollbar">
                        ${estadoAgenda.cancoesCadastradas.length > 0 
                            ? estadoAgenda.cancoesCadastradas.map(cancao => {
                                const isSelected = agenda.repertorio.some(r => r.id === cancao.id);
                                return `
                                    <label class="flex items-center gap-3 cursor-pointer group hover:bg-white/5 p-2 rounded-lg border border-transparent hover:border-white/10 transition-colors">
                                        <div class="relative flex items-center justify-center">
                                            <input type="checkbox" value="${cancao.id}" class="chk-repertorio peer appearance-none w-5 h-5 rounded border border-white/20 bg-black/40 checked:bg-ouro checked:border-ouro transition-all cursor-pointer" ${isSelected ? 'checked' : ''}>
                                            <i class="ph-bold ph-check absolute text-fundo text-xs opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></i>
                                        </div>
                                        <div class="flex flex-col">
                                            <span class="text-xs font-bold text-texto group-hover:text-ouro transition-colors">${cancao.titulo}</span>
                                            <span class="text-[9px] text-texto/50">${cancao.artista} • Tom: ${cancao.tom}</span>
                                        </div>
                                    </label>
                                `;
                            }).join('')
                            : `<div class="text-center p-4 text-texto/40 text-xs">Nenhuma canção encontrada no banco de dados. Cadastre no módulo Repertório.</div>`
                        }
                    </div>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Informações / Observações (Opcional)</label>
                    <textarea id="form-info" rows="3" placeholder="Trajes, equipamentos, recados gerais..." class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all resize-none">${agenda.informacoes}</textarea>
                </div>

                <button id="btn-salvar-agenda" class="w-full mt-4 bg-gradient-to-r from-ouro-escuro via-ouro to-ouro-claro hover:from-ouro hover:to-ouro-brilhante text-fundo font-bold text-sm tracking-widest uppercase py-4 rounded-xl shadow-[0_4px_20px_rgba(242,183,5,0.25)] transition-all active:scale-[0.98] outline-none flex justify-center items-center gap-2">
                    ${isEdicao ? 'Salvar Alterações' : 'Criar Nova Agenda'}
                </button>
            </div>
        </div>
    `;
}

// =========================================================================
// RENDERIZAÇÃO: CARD E MINICARD
// =========================================================================
function renderizarCardAgenda(agenda) {
    const config = configTipos[agenda.tipo] || { corTexto: 'text-texto', corBg: 'bg-white/10', corBorda: 'border-white/20', icone: 'ph-calendar-blank' };
    
    const partesData = agenda.dataStr.split('-');
    const diaNum = partesData[2];
    const mesAbrev = obterNomeMes(parseInt(partesData[1]) - 1).substring(0, 3).toUpperCase();
    
    // Garantir que os arrays existam mesmo se vierem vazios do DB
    const confirmados = agenda.confirmados || [];
    const ausentes = agenda.ausentes || [];
    const repertorio = agenda.repertorio || [];

    const isConfirmado = estadoAgenda.usuarioAtual ? confirmados.some(u => u.id === estadoAgenda.usuarioAtual.id) : false;
    const isAusente = estadoAgenda.usuarioAtual ? ausentes.some(u => u.id === estadoAgenda.usuarioAtual.id) : false;

    return `
        <div id="agenda-card-${agenda.id}" class="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 backdrop-blur-md shadow-xl relative overflow-hidden transition-all">
            <div class="absolute left-0 top-0 h-full w-1 ${config.corBg.replace('/20', '')}"></div>
            
            <div class="flex justify-between items-start">
                <div class="flex flex-col gap-1.5 w-full pr-2">
                    <span class="text-[10px] ${config.corBg} ${config.corTexto} border ${config.corBorda} px-2 py-0.5 rounded-md font-bold uppercase tracking-wider w-max flex items-center gap-1">
                        <i class="${config.icone}"></i> ${agenda.tipo}
                    </span>
                    <h3 class="text-base font-bold text-texto leading-tight">${agenda.titulo}</h3>
                </div>
                
                <div class="flex flex-col items-end gap-2 shrink-0">
                    <div class="text-right bg-black/40 border border-white/10 rounded-xl p-2 flex flex-col items-center justify-center min-w-[50px]">
                        <span class="text-sm font-extrabold text-ouro block leading-none">${diaNum}</span>
                        <span class="text-[9px] text-texto/60 font-bold tracking-widest mt-0.5">${mesAbrev}</span>
                    </div>
                    <div class="flex items-center gap-1.5 mt-1">
                        <button class="btn-editar outline-none text-texto/40 hover:text-ouro transition-colors p-1" data-id="${agenda.id}" title="Editar">
                            <i class="ph ph-pencil-simple text-base"></i>
                        </button>
                        <button class="btn-excluir outline-none text-texto/40 hover:text-red-400 transition-colors p-1" data-id="${agenda.id}" title="Excluir">
                            <i class="ph ph-trash text-base"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-1.5">
                <p class="text-xs text-texto/70 flex items-center gap-2 font-medium">
                    <i class="ph-fill ph-clock text-ouro"></i> 
                    ${agenda.horaInicio} ${agenda.horaFim ? `às ${agenda.horaFim}` : ''}
                </p>
                <p class="text-xs text-texto/70 flex items-center gap-2 font-medium">
                    <i class="ph-fill ph-map-pin text-ouro"></i> 
                    ${agenda.local}
                </p>
                ${agenda.link ? `
                    <a href="${agenda.link}" target="_blank" class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 mt-1 bg-blue-500/10 border border-blue-500/20 w-max px-3 py-1.5 rounded-lg transition-all">
                        <i class="ph-bold ph-link text-sm"></i> Acessar Link
                    </a>
                ` : ''}
            </div>

            ${agenda.informacoes ? `
                <div class="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col gap-1 mt-1">
                    <span class="text-[10px] text-ouro/70 font-bold uppercase tracking-widest flex items-center gap-1"><i class="ph-fill ph-info"></i> Informações</span>
                    <p class="text-xs text-texto/80 leading-relaxed">${agenda.informacoes}</p>
                </div>
            ` : ''}

            <div class="flex flex-col gap-2 border-t border-white/5 pt-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] text-texto/40 font-bold uppercase tracking-widest">Confirmados (${confirmados.length})</span>
                        <div class="avatar-stack">
                            ${gerarAvatares(confirmados)}
                        </div>
                    </div>
                </div>
                ${ausentes.length > 0 ? `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] text-red-400/60 font-bold uppercase tracking-widest">Ausentes (${ausentes.length})</span>
                        <div class="avatar-stack">
                            ${gerarAvatares(ausentes)}
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>

            ${repertorio.length > 0 ? `
                <div class="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col gap-2 mt-1">
                    <span class="text-[10px] text-ouro font-bold uppercase tracking-widest flex items-center gap-1 mb-1"><i class="ph-fill ph-playlist"></i> Repertório Definido</span>
                    <div class="flex flex-col gap-2">
                        ${repertorio.map(musica => renderizarMiniCardMusica(musica)).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="flex gap-2 mt-2 pt-3 border-t border-white/5">
                <button class="btn-presenca flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all outline-none flex items-center justify-center gap-1.5 ${isConfirmado ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-white/5 border border-white/10 text-texto/60 hover:text-green-400'}" data-acao="confirmar" data-id="${agenda.id}">
                    <i class="ph-fill ${isConfirmado ? 'ph-check-circle' : 'ph-check'} text-base"></i> ${isConfirmado ? 'Confirmado' : 'Confirmar'}
                </button>
                <button class="btn-presenca flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all outline-none flex items-center justify-center gap-1.5 ${isAusente ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-white/5 border border-white/10 text-texto/60 hover:text-red-400'}" data-acao="ausente" data-id="${agenda.id}">
                    <i class="ph-fill ${isAusente ? 'ph-x-circle' : 'ph-x'} text-base"></i> ${isAusente ? 'Ausente' : 'Marcar Ausência'}
                </button>
            </div>
        </div>
    `;
}

// Mini Card para o Repertório
function renderizarMiniCardMusica(musica) {
    let coresEstilo = 'bg-white/5 text-texto/60 border-white/10';
    switch (musica.estilo) {
        case 'Worship': coresEstilo = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'; break;
        case 'Corinho de Fogo': coresEstilo = 'bg-red-500/10 text-orange-400 border-red-500/20'; break;
        case 'Celebração': coresEstilo = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'; break;
    }

    return `
        <div data-musica-id="${musica.id}" class="mini-card-musica cursor-pointer hover:bg-white/10 border border-white/10 rounded-lg p-2.5 flex items-center gap-3 backdrop-blur-sm transition-all active:scale-[0.98]">
            <div class="w-8 h-8 rounded-lg bg-ouro/10 border border-ouro/20 flex items-center justify-center font-bold text-ouro text-xs shadow-inner shrink-0">${musica.tom || '-'}</div>
            <div class="flex flex-col overflow-hidden w-full">
                <h4 class="text-xs font-bold text-texto leading-tight truncate">${musica.titulo}</h4>
                <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span class="text-[10px] text-texto/50">${musica.artista}</span>
                    <span class="text-texto/30 text-[8px]">•</span>
                    <span class="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded border ${coresEstilo}">${musica.estilo || 'Geral'}</span>
                </div>
            </div>
            <i class="ph ph-caret-right text-texto/30 mr-1"></i>
        </div>
    `;
}

// Lógica de Renderização do Grid do Calendário
function gerarDiasCalendarioHTML() {
    const dataPrimeiroDia = new Date(estadoAgenda.anoAtual, estadoAgenda.mesAtual, 1);
    const dataUltimoDia = new Date(estadoAgenda.anoAtual, estadoAgenda.mesAtual + 1, 0);
    
    const diasNoMes = dataUltimoDia.getDate();
    const diaSemanaInicio = dataPrimeiroDia.getDay(); // 0 a 6
    
    let html = '';
    
    for (let i = 0; i < diaSemanaInicio; i++) {
        html += `<div class="p-2"></div>`;
    }
    
    for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataFormatadaStr = `${estadoAgenda.anoAtual}-${String(estadoAgenda.mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        
        const hojeReal = new Date();
        const isHoje = hojeReal.getDate() === dia && hojeReal.getMonth() === estadoAgenda.mesAtual && hojeReal.getFullYear() === estadoAgenda.anoAtual;
        
        const agendasNoDia = estadoAgenda.agendas.filter(a => a.dataStr === dataFormatadaStr);
        const temAgenda = agendasNoDia.length > 0;
        
        let classesBg = 'bg-transparent text-texto/80 hover:bg-white/10 cursor-default';
        let badgeIndicador = '';
        let acaoClick = '';

        if (temAgenda) {
            const config = configTipos[agendasNoDia[0].tipo] || configTipos['Culto'];
            classesBg = `${config.corBg} border ${config.corBorda} font-bold ${config.corTexto} cursor-pointer hover:scale-105 z-10`;
            acaoClick = `data-scroll-to="agenda-card-${agendasNoDia[0].id}"`;
            
            if (agendasNoDia.length > 1) {
                badgeIndicador = `<div class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0D0D0D]"></div>`;
            }
        }

        if (isHoje) {
            classesBg = `bg-ouro text-fundo font-extrabold shadow-[0_0_15px_rgba(242,183,5,0.6)] ${temAgenda ? 'cursor-pointer hover:scale-105 z-10' : 'cursor-default'}`;
        }
        
        html += `
            <div ${acaoClick} class="relative flex items-center justify-center w-full aspect-square rounded-xl transition-all text-xs ${classesBg}">
                ${dia}
                ${badgeIndicador}
            </div>
        `;
    }
    
    return html;
}

function gerarAvatares(listaUsuarios) {
    if (!listaUsuarios || listaUsuarios.length === 0) return '';
    const limite = 4;
    let html = '';
    
    listaUsuarios.slice(0, limite).forEach(u => {
        if (u.foto) {
            html += `<div class="avatar-item"><img src="${u.foto}" class="w-full h-full object-cover"></div>`;
        } else {
            html += `<div class="avatar-item bg-ouro/20 text-ouro text-[10px]"><i class="ph-fill ph-user"></i></div>`;
        }
    });
    
    if (listaUsuarios.length > limite) {
        html += `<div class="avatar-item bg-white/10 text-texto/60 text-[9px] font-bold text-center">+${listaUsuarios.length - limite}</div>`;
    }
    
    return html;
}

function obterNomeMes(indice) {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return meses[indice];
}

function mostrarToast(mensagem) {
    let toast = document.getElementById('agenda-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'agenda-toast';
        toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-ouro text-fundo text-xs font-bold px-5 py-2.5 rounded-full shadow-[0_4px_20px_rgba(242,183,5,0.5)] transition-all duration-300 z-[999] opacity-0 pointer-events-none transform translate-y-4 flex items-center gap-2 whitespace-nowrap';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="ph-fill ph-check-circle text-lg"></i> ${mensagem}`;
    toast.classList.remove('opacity-0', 'translate-y-4');
    
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
    }, 2500);
}

// =========================================================================
// INICIALIZAÇÃO E DELEGAÇÃO DE EVENTOS (ASSÍNCRONOS DB)
// =========================================================================
export function inicializarEventosAba() {
    if (!window.agendaListenersInjetados) {
        window.agendaListenersInjetados = true;
        
        document.addEventListener('click', async (e) => {
            // Controle do Calendário
            if (e.target.closest('#btn-mes-ant')) {
                estadoAgenda.mesAtual--;
                if (estadoAgenda.mesAtual < 0) {
                    estadoAgenda.mesAtual = 11;
                    estadoAgenda.anoAtual--;
                }
                forcarAtualizacaoAgenda();
                return;
            }
            if (e.target.closest('#btn-mes-prox')) {
                estadoAgenda.mesAtual++;
                if (estadoAgenda.mesAtual > 11) {
                    estadoAgenda.mesAtual = 0;
                    estadoAgenda.anoAtual++;
                }
                forcarAtualizacaoAgenda();
                return;
            }

            // Scroll Calendário > Evento
            const diaCalendario = e.target.closest('[data-scroll-to]');
            if (diaCalendario) {
                const targetId = diaCalendario.getAttribute('data-scroll-to');
                const element = document.getElementById(targetId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('ring-2', 'ring-ouro', 'ring-offset-2', 'ring-offset-[#0D0D0D]');
                    setTimeout(() => element.classList.remove('ring-2', 'ring-ouro', 'ring-offset-2', 'ring-offset-[#0D0D0D]'), 1500);
                }
                return;
            }

            // Redirecionamento Integração Repertório
            const cardMusica = e.target.closest('.mini-card-musica');
            if (cardMusica && estadoAgenda.abaAtiva === 'lista') {
                const idMusica = cardMusica.getAttribute('data-musica-id');
                window.RepertorioOrigem = 'agenda'; 
                window.RepertorioMusicaId = idMusica;
                const btnAbaRepertorio = document.querySelector('button[data-aba="repertorio"]');
                if (btnAbaRepertorio) btnAbaRepertorio.click();
                return;
            }

            // Navegação e Formulário
            if (e.target.closest('#btn-nova-agenda')) {
                estadoAgenda.abaAtiva = 'cadastro';
                estadoAgenda.agendaSelecionadaId = null;
                forcarAtualizacaoAgenda();
                return;
            }

            if (e.target.closest('#btn-cancelar-agenda')) {
                estadoAgenda.abaAtiva = 'lista';
                estadoAgenda.agendaSelecionadaId = null;
                forcarAtualizacaoAgenda();
                return;
            }

            // Ações de Presença (Integrado ao Supabase)
            const btnPresenca = e.target.closest('.btn-presenca');
            if (btnPresenca && estadoAgenda.usuarioAtual) {
                const idAgenda = btnPresenca.getAttribute('data-id');
                const acao = btnPresenca.getAttribute('data-acao');
                const agenda = estadoAgenda.agendas.find(a => String(a.id) === idAgenda);
                
                if (agenda) {
                    // Prepara UI Loading local
                    const iconeAntigo = btnPresenca.innerHTML;
                    btnPresenca.innerHTML = '<i class="ph ph-spinner animate-spin text-base"></i> Processando...';
                    
                    const isConfirmado = agenda.confirmados?.some(u => u.id === estadoAgenda.usuarioAtual.id);
                    const isAusente = agenda.ausentes?.some(u => u.id === estadoAgenda.usuarioAtual.id);
                    
                    // Limpa de ambas listas para estado limpo
                    let novosConfirmados = (agenda.confirmados || []).filter(u => u.id !== estadoAgenda.usuarioAtual.id);
                    let novosAusentes = (agenda.ausentes || []).filter(u => u.id !== estadoAgenda.usuarioAtual.id);
                    
                    let toastMsg = "";

                    if (acao === 'confirmar') {
                        if (isConfirmado) toastMsg = "Sua confirmação foi removida.";
                        else {
                            novosConfirmados.push(estadoAgenda.usuarioAtual);
                            toastMsg = "Presença confirmada com sucesso!";
                        }
                    } else if (acao === 'ausente') {
                        if (isAusente) toastMsg = "Marcação de ausência removida.";
                        else {
                            novosAusentes.push(estadoAgenda.usuarioAtual);
                            toastMsg = "Ausência registrada.";
                        }
                    }

                    // Atualiza no banco
                    try {
                        const { error } = await supabase.from('agendas')
                            .update({ confirmados: novosConfirmados, ausentes: novosAusentes })
                            .eq('id', idAgenda);

                        if (!error) {
                            agenda.confirmados = novosConfirmados;
                            agenda.ausentes = novosAusentes;
                            mostrarToast(toastMsg);
                        } else {
                            mostrarToast("Erro ao registrar presença no banco.");
                        }
                    } catch (error) {
                        mostrarToast("Falha de conexão com o servidor.");
                    }
                    
                    forcarAtualizacaoAgenda();
                }
                return;
            }

            // Editar Agenda Existente
            const btnEditar = e.target.closest('.btn-editar');
            if (btnEditar) {
                const idAgenda = btnEditar.getAttribute('data-id');
                estadoAgenda.agendaSelecionadaId = idAgenda; // Se for UUID, manter String
                estadoAgenda.abaAtiva = 'edicao';
                forcarAtualizacaoAgenda();
                return;
            }

            // Excluir Agenda do DB
            const btnExcluir = e.target.closest('.btn-excluir');
            if (btnExcluir) {
                const idAgenda = btnExcluir.getAttribute('data-id');
                if (confirm('Tem certeza de que deseja excluir permanentemente esta agenda?')) {
                    const elBotao = e.target.closest('.btn-excluir');
                    elBotao.innerHTML = '<i class="ph ph-spinner animate-spin"></i>';
                    
                    try {
                        const { error } = await supabase.from('agendas').delete().eq('id', idAgenda);
                        if (!error) {
                            estadoAgenda.agendas = estadoAgenda.agendas.filter(a => String(a.id) !== idAgenda);
                            mostrarToast('Agenda excluída com sucesso!');
                        } else {
                            mostrarToast('Erro ao excluir agenda.');
                        }
                    } catch (error) {
                        mostrarToast('Falha na conexão ao excluir.');
                    }
                    forcarAtualizacaoAgenda();
                }
                return;
            }

            // Salvar Agenda (Criar ou Atualizar no DB)
            const btnSalvar = e.target.closest('#btn-salvar-agenda');
            if (btnSalvar) {
                const tipo = document.getElementById('form-tipo').value;
                const titulo = document.getElementById('form-titulo').value.trim();
                const dataStr = document.getElementById('form-data').value;
                const horaInicio = document.getElementById('form-hora-inicio').value;
                const horaFim = document.getElementById('form-hora-fim').value;
                const local = document.getElementById('form-local').value.trim();
                const link = document.getElementById('form-link').value.trim();
                const informacoes = document.getElementById('form-info').value.trim();
                
                // Pega ID das músicas selecionadas
                const chks = document.querySelectorAll('.chk-repertorio:checked');
                const cancoesIds = Array.from(chks).map(cb => cb.value); // Assume que ID pode ser UUID
                const repertorio = estadoAgenda.cancoesCadastradas.filter(c => cancoesIds.includes(String(c.id)));

                if (!tipo || !titulo || !dataStr || !horaInicio || !local) {
                    alert('Por favor, preencha todos os campos obrigatórios (marcados com *).');
                    return;
                }

                if (repertorio.length === 0) {
                    alert('O Repertório é obrigatório. Por favor, adicione pelo menos uma canção à agenda.');
                    return;
                }

                // UI Loading Button
                btnSalvar.disabled = true;
                const textoOriginal = btnSalvar.innerHTML;
                btnSalvar.innerHTML = '<i class="ph ph-spinner animate-spin text-xl"></i> Salvando no Banco...';

                const dadosAgenda = {
                    tipo, titulo, dataStr, horaInicio, horaFim, local, link, informacoes, repertorio
                };

                try {
                    if (estadoAgenda.abaAtiva === 'edicao') {
                        // Atualizar existente
                        const { data, error } = await supabase.from('agendas')
                            .update(dadosAgenda)
                            .eq('id', estadoAgenda.agendaSelecionadaId)
                            .select();
                            
                        if (!error && data) {
                            const idx = estadoAgenda.agendas.findIndex(a => String(a.id) === String(estadoAgenda.agendaSelecionadaId));
                            if (idx !== -1) estadoAgenda.agendas[idx] = data[0];
                            mostrarToast('Alterações salvas com sucesso!');
                        } else throw error;
                    } else {
                        // Criar nova
                        dadosAgenda.confirmados = estadoAgenda.usuarioAtual ? [estadoAgenda.usuarioAtual] : [];
                        dadosAgenda.ausentes = [];
                        
                        const { data, error } = await supabase.from('agendas')
                            .insert([dadosAgenda])
                            .select();
                            
                        if (!error && data) {
                            estadoAgenda.agendas.push(data[0]);
                            mostrarToast('Nova agenda salva no banco com sucesso!');
                        } else throw error;
                    }
                } catch (error) {
                    console.error(error);
                    mostrarToast('Erro ao salvar no banco de dados.');
                    btnSalvar.disabled = false;
                    btnSalvar.innerHTML = textoOriginal;
                    return;
                }

                estadoAgenda.abaAtiva = 'lista';
                estadoAgenda.agendaSelecionadaId = null;
                forcarAtualizacaoAgenda();
                return;
            }
        });
    }
}

function forcarAtualizacaoAgenda() {
    const container = document.getElementById('modulo-agenda');
    if (container) {
        container.outerHTML = obterTemplateAba();
    }
}
