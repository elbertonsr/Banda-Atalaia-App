// BANDA ATALAIA APP - Módulo de Avisos
// Arquitetura Reativa Vanilla JS com Tailwind CSS

import { obterUsuarioAtual, obterPerfilMembro } from '../supabase.js';

// Banco de dados em memória (Simulando o Supabase)
let avisosCadastrados = [
    {
        id: 1,
        categoria: 'Geral',
        prioridade: 'Urgente',
        titulo: 'Alteração de Horário do Ensaio',
        descricao: 'Devido à manutenção preventiva do ar-condicionado da igreja, o ensaio deste sábado começará pontualmente às 14:00h e não às 16:00h. Contamos com a pontualidade de todos.',
        dataOpcional: '',
        localOpcional: '',
        autorId: 'sistema',
        autorNome: 'Líder',
        dataPublicacao: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 horas atrás
        lidoPor: [],
        anexo: null
    },
    {
        id: 2,
        categoria: 'Administrativo',
        prioridade: 'Importante',
        titulo: 'Escala de Vestimenta - Julho',
        descricao: 'Ficou definido em reunião que nos cultos de domingo do mês de julho utilizaremos a camiseta oficial preta com detalhes dourados. Jeans escuro liberado.',
        dataOpcional: '2024-07-01',
        localOpcional: 'Nave Central',
        autorId: 'sistema',
        autorNome: 'Coordenação',
        dataPublicacao: new Date(Date.now() - 48 * 3600000).toISOString(), // 2 dias atrás
        lidoPor: ['sistema'], // Simula que já foi lido
        anexo: null
    }
];

const categoriasDisponiveis = [
    'Informativo', 'Geral', 'Administrativo', 'Equipamento', 
    'Financeiro', 'Repertório', 'Agenda'
];

const prioridadesDisponiveis = ['Normal', 'Importante', 'Urgente'];

// Estado atual da tela
let estadoAvisos = {
    abaAtiva: 'lista', // 'lista', 'cadastro', 'edicao', 'detalhes'
    avisoSelecionadoId: null,
    usuarioAtual: null // Será carregado na inicialização
};

export function obterTemplateAba() {
    return `<div id="raiz-avisos" class="w-full h-full flex flex-col items-center relative pb-24"></div>`;
}

export async function inicializarEventosAba() {
    // Injeção de CSS
    if (!document.getElementById('estilos-avisos')) {
        const style = document.createElement('style');
        style.id = 'estilos-avisos';
        style.innerHTML = `
            @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fadeIn { animation: fadeIn 0.3s ease-in-out forwards; }
            .linha-clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        `;
        document.head.appendChild(style);
    }

    // Carregar dados do usuário logado para controle de permissões
    const userAuth = await obterUsuarioAtual();
    if (userAuth) {
        const { perfil } = await obterPerfilMembro(userAuth.id);
        estadoAvisos.usuarioAtual = {
            id: userAuth.id,
            nome: perfil ? perfil.nome : 'Membro Atalaia'
        };
    } else {
        estadoAvisos.usuarioAtual = { id: 'anon', nome: 'Visitante' };
    }

    renderizarInterface();
}

// Motor de Renderização Reativo
function renderizarInterface() {
    const raiz = document.getElementById('raiz-avisos');
    if (!raiz) return;

    atualizarBadgeTabBar();

    switch (estadoAvisos.abaAtiva) {
        case 'cadastro':
            raiz.innerHTML = renderizarTelaFormulario(false);
            configurarEventosFormulario(false);
            break;
        case 'edicao':
            raiz.innerHTML = renderizarTelaFormulario(true);
            configurarEventosFormulario(true);
            break;
        case 'detalhes':
            raiz.innerHTML = renderizarTelaDetalhes();
            configurarEventosDetalhes();
            break;
        default:
            raiz.innerHTML = renderizarTelaPrincipal();
            configurarEventosPrincipal();
            break;
    }
}

// Lógica para injetar o Badge de Notificação na Tab Bar Global
function atualizarBadgeTabBar() {
    const abaAvisos = document.querySelector('button[data-aba="avisos"]');
    if (!abaAvisos || !estadoAvisos.usuarioAtual) return;

    const qtdNaoLidos = avisosCadastrados.filter(a => !a.lidoPor.includes(estadoAvisos.usuarioAtual.id)).length;
    
    // Remove badge antigo se existir
    const badgeAntigo = abaAvisos.querySelector('.badge-notificacao');
    if (badgeAntigo) badgeAntigo.remove();

    if (qtdNaoLidos > 0) {
        const iconeContainer = abaAvisos.querySelector('div');
        if (iconeContainer) {
            iconeContainer.classList.add('relative');
            iconeContainer.innerHTML += `
                <span class="badge-notificacao absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-fundo animate-bounce shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                    ${qtdNaoLidos}
                </span>
            `;
        }
    }
}

function obterEstiloPrioridade(prioridade) {
    switch (prioridade) {
        case 'Urgente': return { cor: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icone: 'ph-fill ph-warning-circle' };
        case 'Importante': return { cor: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icone: 'ph-fill ph-warning' };
        case 'Normal': return { cor: 'text-ouro', bg: 'bg-ouro/10', border: 'border-ouro/20', icone: 'ph-fill ph-info' };
        default: return { cor: 'text-ouro', bg: 'bg-ouro/10', border: 'border-ouro/20', icone: 'ph-fill ph-info' };
    }
}

function obterIconeArquivo(mimeType) {
    if (!mimeType) return 'ph-file';
    if (mimeType.includes('image')) return 'ph-image';
    if (mimeType.includes('pdf')) return 'ph-file-pdf';
    if (mimeType.includes('video')) return 'ph-video';
    if (mimeType.includes('audio')) return 'ph-speaker-high';
    return 'ph-file-text';
}

// ==========================================
// RENDERIZAÇÕES DE TELA
// ==========================================

function renderizarTelaPrincipal() {
    const ordenados = [...avisosCadastrados].sort((a, b) => new Date(b.dataPublicacao) - new Date(a.dataPublicacao));

    const listaHtml = ordenados.length > 0 
        ? ordenados.map(aviso => {
            const estilo = obterEstiloPrioridade(aviso.prioridade);
            const dataPub = new Date(aviso.dataPublicacao);
            const dataFormatada = dataPub.toLocaleDateString('pt-BR') + ' às ' + dataPub.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
            const isNovo = !aviso.lidoPor.includes(estadoAvisos.usuarioAtual?.id);
            const descricaoLonga = aviso.descricao.length > 100;

            return `
                <div class="${estilo.bg} border ${estilo.border} rounded-2xl p-5 flex flex-col gap-2 relative shadow-lg transition-all">
                    ${isNovo ? `<div class="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse">Novo</div>` : ''}
                    
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2 ${estilo.cor} font-bold text-[10px] uppercase tracking-wider">
                            <i class="${estilo.icone} text-sm"></i> ${aviso.prioridade} • ${aviso.categoria}
                        </div>
                        ${aviso.anexo ? `<i class="ph ph-paperclip text-texto/40 text-sm"></i>` : ''}
                    </div>
                    
                    <h3 class="text-sm font-bold text-texto mt-1 leading-tight">${aviso.titulo}</h3>
                    
                    <p class="text-xs text-texto/70 leading-relaxed ${descricaoLonga ? 'linha-clamp' : ''}">
                        ${aviso.descricao}
                    </p>
                    
                    ${descricaoLonga ? `
                        <button data-id-detalhes="${aviso.id}" class="text-ouro hover:text-ouro-brilhante text-xs font-bold text-left mt-1 w-max transition-colors outline-none">
                            Ver detalhes...
                        </button>
                    ` : ''}

                    <div class="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <span class="text-[9px] text-texto/40">Por: <span class="text-texto/60 font-medium">${aviso.autorNome}</span></span>
                        <span class="text-[9px] text-texto/30">${dataFormatada}</span>
                    </div>

                    ${!descricaoLonga ? `
                        <button data-id-detalhes="${aviso.id}" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer outline-none"></button>
                    ` : ''}
                </div>
            `;
        }).join('')
        : `<div class="text-center py-10"><i class="ph ph-bell-slash text-4xl text-texto/20 mb-2"></i><p class="text-texto/40 text-sm">Nenhum aviso no momento.</p></div>`;

return `
        <div class="w-full max-w-xl h-full relative">
            
            <div class="w-full flex flex-col gap-4 animate-fadeIn">
                <div class="flex items-center justify-between mb-2">
                    <h2 class="text-xl font-bold tracking-wide text-ouro">Quadro de Avisos</h2>
                    <i class="ph ph-bell-ringing text-ouro animate-bounce"></i>
                </div>

                <div class="flex flex-col gap-4 pb-36"> ${listaHtml}
                </div>
            </div>

            <button id="btn-novo-aviso" class="fixed bottom-28 right-6 w-14 h-14 bg-ouro hover:bg-ouro-brilhante rounded-full shadow-[0_4px_20px_rgba(242,183,5,0.4)] flex items-center justify-center text-fundo transition-transform hover:scale-105 active:scale-95 outline-none z-50">
                <i class="ph ph-plus text-2xl font-bold"></i>
            </button>
        </div>
    `;
}

function renderizarTelaDetalhes() {
    const aviso = avisosCadastrados.find(a => a.id === estadoAvisos.avisoSelecionadoId);
    if (!aviso) return `<p class="text-center text-texto/50 py-10">Aviso não encontrado.</p>`;

    // Marcar como lido
    if (estadoAvisos.usuarioAtual && !aviso.lidoPor.includes(estadoAvisos.usuarioAtual.id)) {
        aviso.lidoPor.push(estadoAvisos.usuarioAtual.id);
    }

    const estilo = obterEstiloPrioridade(aviso.prioridade);
    const isAutor = aviso.autorId === estadoAvisos.usuarioAtual?.id;
    const dataPub = new Date(aviso.dataPublicacao).toLocaleString('pt-BR');

    return `
        <div class="w-full max-w-xl flex flex-col gap-4 animate-fadeIn pb-12">
            <div class="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                <div class="flex items-center gap-3">
                    <button id="btn-voltar-detalhes" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-texto outline-none">
                        <i class="ph ph-arrow-left text-xl"></i>
                    </button>
                    <div class="flex flex-col">
                        <span class="text-[10px] ${estilo.cor} font-bold uppercase tracking-widest"><i class="${estilo.icone}"></i> ${aviso.prioridade}</span>
                        <h2 class="text-base font-bold text-texto leading-tight mt-0.5">Detalhes do Aviso</h2>
                    </div>
                </div>
                
                ${isAutor ? `
                <div class="flex gap-2">
                    <button id="btn-editar-aviso" class="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-ouro hover:bg-white/10 transition-colors outline-none" title="Editar">
                        <i class="ph ph-pencil-simple text-lg"></i>
                    </button>
                    <button id="btn-deletar-aviso" class="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors outline-none" title="Excluir">
                        <i class="ph ph-trash text-lg"></i>
                    </button>
                </div>
                ` : ''}
            </div>

            <div class="${estilo.bg} border ${estilo.border} rounded-[2rem] p-6 backdrop-blur-md shadow-xl flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                    <span class="text-[10px] text-texto/50 font-bold uppercase tracking-widest border border-white/10 bg-black/20 w-max px-2 py-0.5 rounded-md">${aviso.categoria}</span>
                    <h1 class="text-lg font-bold text-texto mt-1">${aviso.titulo}</h1>
                </div>

                <div class="w-full h-px bg-white/5"></div>

                <p class="text-sm text-texto/90 leading-relaxed whitespace-pre-line font-sans">
                    ${aviso.descricao}
                </p>

                ${(aviso.dataOpcional || aviso.localOpcional) ? `
                    <div class="flex flex-col gap-3 mt-2 p-4 bg-black/20 rounded-xl border border-white/5">
                        ${aviso.dataOpcional ? `
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg bg-ouro/10 text-ouro flex items-center justify-center"><i class="ph-fill ph-calendar-blank"></i></div>
                                <div class="flex flex-col">
                                    <span class="text-[9px] text-texto/40 font-bold uppercase tracking-widest">Data Referente</span>
                                    <span class="text-xs font-semibold text-texto">${new Date(aviso.dataOpcional + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>
                        ` : ''}
                        ${aviso.localOpcional ? `
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg bg-ouro/10 text-ouro flex items-center justify-center"><i class="ph-fill ph-map-pin"></i></div>
                                <div class="flex flex-col">
                                    <span class="text-[9px] text-texto/40 font-bold uppercase tracking-widest">Local</span>
                                    <span class="text-xs font-semibold text-texto">${aviso.localOpcional}</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                ${aviso.anexo ? `
                    <div class="mt-2 pt-4 border-t border-white/5">
                        <span class="text-[10px] text-texto/40 font-bold uppercase tracking-widest block mb-2">Arquivo Anexo</span>
                        <a href="${aviso.anexo.url}" download="${aviso.anexo.nome}" target="_blank" class="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-xl hover:bg-white/5 hover:border-ouro/30 transition-all outline-none">
                            <div class="flex items-center gap-3 overflow-hidden">
                                <div class="w-10 h-10 rounded-lg bg-ouro/10 text-ouro flex items-center justify-center shrink-0">
                                    <i class="ph-fill ${obterIconeArquivo(aviso.anexo.tipo)} text-xl"></i>
                                </div>
                                <div class="flex flex-col overflow-hidden">
                                    <span class="text-xs font-semibold text-texto truncate">${aviso.anexo.nome}</span>
                                    <span class="text-[9px] text-texto/40 uppercase tracking-widest">Toque para baixar/ver</span>
                                </div>
                            </div>
                            <i class="ph ph-download-simple text-texto/50 hover:text-ouro text-lg"></i>
                        </a>
                    </div>
                ` : ''}

                <div class="flex flex-col mt-4 pt-4 border-t border-white/5 gap-1">
                    <span class="text-[10px] text-texto/40 font-medium flex items-center gap-1"><i class="ph ph-user"></i> Publicado por: <strong class="text-texto/70">${aviso.autorNome}</strong></span>
                    <span class="text-[10px] text-texto/40 font-medium flex items-center gap-1"><i class="ph ph-clock"></i> Em: ${dataPub}</span>
                </div>
            </div>
        </div>
    `;
}

function renderizarTelaFormulario(isEdicao) {
    let aviso = { titulo: '', categoria: '', prioridade: 'Normal', descricao: '', dataOpcional: '', localOpcional: '', anexo: null };
    
    if (isEdicao) {
        const existente = avisosCadastrados.find(a => a.id === estadoAvisos.avisoSelecionadoId);
        if (existente) aviso = { ...existente };
    }

    return `
        <div class="w-full max-w-xl flex flex-col gap-4 animate-fadeIn pb-10">
            <div class="flex items-center gap-4 mb-2">
                <button id="btn-cancelar-form" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-texto transition-all outline-none">
                    <i class="ph ph-arrow-left text-xl"></i>
                </button>
                <h2 class="text-lg font-bold tracking-wide text-ouro">${isEdicao ? 'Editar Aviso' : 'Novo Aviso'}</h2>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col gap-4 backdrop-blur-md shadow-2xl">
                
                <div class="flex gap-4">
                    <div class="flex flex-col gap-1.5 flex-[1.5]">
                        <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Categoria *</label>
                        <select id="form-categoria" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-3 text-sm text-texto focus:outline-none focus:border-ouro transition-all cursor-pointer">
                            <option value="">Selecione...</option>
                            ${categoriasDisponiveis.map(c => `<option value="${c}" ${aviso.categoria === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="flex flex-col gap-1.5 flex-[1]">
                        <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Prioridade *</label>
                        <select id="form-prioridade" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-3 text-sm text-texto focus:outline-none focus:border-ouro transition-all cursor-pointer">
                            ${prioridadesDisponiveis.map(p => `<option value="${p}" ${aviso.prioridade === p ? 'selected' : ''}>${p}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Título do Aviso *</label>
                    <input type="text" id="form-titulo" value="${aviso.titulo}" placeholder="Ex: Mudança de horário" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all">
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Descrição / Conteúdo *</label>
                    <textarea id="form-descricao" rows="5" placeholder="Digite todos os detalhes aqui..." class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all resize-none">${aviso.descricao}</textarea>
                </div>

                <div class="h-px w-full bg-white/5 my-2"></div>

                <div class="flex gap-4">
                    <div class="flex flex-col gap-1.5 flex-1">
                        <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Data Referente (Opcional)</label>
                        <input type="date" id="form-data" value="${aviso.dataOpcional}" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all css-color-scheme-dark">
                    </div>
                </div>
                
                <div class="flex flex-col gap-1.5 flex-1">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Local (Opcional)</label>
                    <div class="relative flex items-center">
                        <i class="ph ph-map-pin absolute left-4 text-texto/40"></i>
                        <input type="text" id="form-local" value="${aviso.localOpcional}" placeholder="Ex: Templo Principal" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all">
                    </div>
                </div>

                <div class="flex flex-col gap-1.5 mt-2 pt-4 border-t border-white/5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Anexar Arquivo (Opcional)</label>
                    <label class="w-full bg-black/40 hover:bg-black/60 border border-white/10 hover:border-ouro/50 border-dashed rounded-xl py-4 px-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
                        <div class="w-10 h-10 rounded-full bg-white/5 group-hover:bg-ouro/10 flex items-center justify-center transition-all">
                            <i class="ph ph-upload-simple text-xl text-texto/50 group-hover:text-ouro"></i>
                        </div>
                        <span class="text-xs text-texto/50 group-hover:text-texto/80" id="txt-arquivo-aviso">${aviso.anexo ? aviso.anexo.nome : 'Toque para selecionar arquivo'}</span>
                        <input type="file" id="form-anexo" class="hidden">
                    </label>
                </div>

                <button id="btn-salvar-aviso" class="w-full mt-4 bg-gradient-to-r from-ouro-escuro via-ouro to-ouro-claro hover:from-ouro hover:to-ouro-brilhante text-fundo font-bold text-sm tracking-widest uppercase py-4 rounded-xl shadow-[0_4px_20px_rgba(242,183,5,0.25)] transition-all active:scale-[0.98] outline-none">
                    ${isEdicao ? 'Salvar Alterações' : 'Publicar Aviso'}
                </button>
            </div>
        </div>
    `;
}

// ==========================================
// EVENTOS & INTERAÇÕES
// ==========================================

function configurarEventosPrincipal() {
    // Abrir Form Cadastro
    const btnNovo = document.getElementById('btn-novo-aviso');
    if (btnNovo) {
        btnNovo.addEventListener('click', () => {
            estadoAvisos.abaAtiva = 'cadastro';
            renderizarInterface();
        });
    }

    // Abrir Detalhes do Aviso
    document.querySelectorAll('[data-id-detalhes]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            estadoAvisos.avisoSelecionadoId = parseInt(e.currentTarget.getAttribute('data-id-detalhes'), 10);
            estadoAvisos.abaAtiva = 'detalhes';
            renderizarInterface();
        });
    });
}

function configurarEventosDetalhes() {
    document.getElementById('btn-voltar-detalhes').addEventListener('click', () => {
        estadoAvisos.avisoSelecionadoId = null;
        estadoAvisos.abaAtiva = 'lista';
        renderizarInterface();
    });

    const btnEditar = document.getElementById('btn-editar-aviso');
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            estadoAvisos.abaAtiva = 'edicao';
            renderizarInterface();
        });
    }

    const btnDeletar = document.getElementById('btn-deletar-aviso');
    if (btnDeletar) {
        btnDeletar.addEventListener('click', () => {
            if (confirm("Tem certeza que deseja excluir permanentemente este aviso?")) {
                avisosCadastrados = avisosCadastrados.filter(a => a.id !== estadoAvisos.avisoSelecionadoId);
                estadoAvisos.avisoSelecionadoId = null;
                estadoAvisos.abaAtiva = 'lista';
                renderizarInterface();
            }
        });
    }
}

function configurarEventosFormulario(isEdicao) {
    // Para corrigir a cor do ícone no input date
    const inputDate = document.getElementById('form-data');
    if(inputDate) inputDate.style.colorScheme = 'dark';

    document.getElementById('btn-cancelar-form').addEventListener('click', () => {
        estadoAvisos.abaAtiva = isEdicao ? 'detalhes' : 'lista';
        renderizarInterface();
    });

    let anexoAtual = null;
    if (isEdicao) {
        const existente = avisosCadastrados.find(a => a.id === estadoAvisos.avisoSelecionadoId);
        if (existente && existente.anexo) anexoAtual = { ...existente.anexo };
    }

    const inputAnexo = document.getElementById('form-anexo');
    const txtArquivo = document.getElementById('txt-arquivo-aviso');
    
    if (inputAnexo) {
        inputAnexo.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                txtArquivo.textContent = file.name;
                txtArquivo.classList.replace('text-texto/50', 'text-ouro');
                
                // Cria uma URL temporária para simular o upload e permitir download/visualização no app
                anexoAtual = {
                    nome: file.name,
                    url: URL.createObjectURL(file),
                    tipo: file.type
                };
            } else {
                txtArquivo.textContent = 'Toque para selecionar arquivo';
                txtArquivo.classList.replace('text-ouro', 'text-texto/50');
                anexoAtual = null;
            }
        });
    }

    document.getElementById('btn-salvar-aviso').addEventListener('click', () => {
        const categoria = document.getElementById('form-categoria').value;
        const prioridade = document.getElementById('form-prioridade').value;
        const titulo = document.getElementById('form-titulo').value.trim();
        const descricao = document.getElementById('form-descricao').value.trim();
        const dataOpcional = document.getElementById('form-data').value;
        const localOpcional = document.getElementById('form-local').value.trim();

        if (!categoria || !prioridade || !titulo || !descricao) {
            alert("Por favor, preencha todos os campos obrigatórios (*)");
            return;
        }

        if (isEdicao) {
            const index = avisosCadastrados.findIndex(a => a.id === estadoAvisos.avisoSelecionadoId);
            if (index !== -1) {
                avisosCadastrados[index] = {
                    ...avisosCadastrados[index],
                    categoria,
                    prioridade,
                    titulo,
                    descricao,
                    dataOpcional,
                    localOpcional,
                    anexo: anexoAtual
                };
            }
            estadoAvisos.abaAtiva = 'detalhes';
        } else {
            const novoAviso = {
                id: Date.now(),
                categoria,
                prioridade,
                titulo,
                descricao,
                dataOpcional,
                localOpcional,
                autorId: estadoAvisos.usuarioAtual.id,
                autorNome: estadoAvisos.usuarioAtual.nome,
                dataPublicacao: new Date().toISOString(),
                lidoPor: [estadoAvisos.usuarioAtual.id], // O autor já leu
                anexo: anexoAtual
            };
            avisosCadastrados.push(novoAviso);
            estadoAvisos.abaAtiva = 'lista';
        }

        renderizarInterface();
    });
}
