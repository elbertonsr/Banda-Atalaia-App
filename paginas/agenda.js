// BANDA ATALAIA APP - Módulo de Agenda
// Arquitetura Reativa Vanilla JS com Tailwind CSS e Glassmorphism

// Helpers para manipulação de datas
const hoje = new Date();
let estadoAgenda = {
    mesAtual: hoje.getMonth(),
    anoAtual: hoje.getFullYear(),
    usuarioAtual: { id: 'user1', nome: 'Você', foto: '' }, // Simulação do usuário logado
    
    // Banco de dados em memória (Simulando o Supabase)
    agendas: [
        {
            id: 1,
            tipo: 'Culto',
            titulo: 'Culto de Celebração',
            dataStr: `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-15`, // Dia 15 do mês atual
            horaInicio: '18:00',
            horaFim: '20:30',
            local: 'Nave Central da Igreja',
            informacoes: 'Traje: Camiseta oficial preta. Por favor, chegar com 30 minutos de antecedência para passagem de som rápida.',
            repertorio: [
                { id: 1, titulo: 'Bondade de Deus', artista: 'Isaías Saad', tom: 'G', estilo: 'Worship' },
                { id: 2, titulo: 'A Casa É Sua', artista: 'Casa Worship', tom: 'E', estilo: 'Worship' }
            ],
            confirmados: [
                { id: 'user1', nome: 'Você', foto: '' },
                { id: 'u2', nome: 'Sarah', foto: 'https://i.pravatar.cc/150?u=sarah' },
                { id: 'u3', nome: 'David', foto: 'https://i.pravatar.cc/150?u=david' }
            ],
            ausentes: [
                { id: 'u4', nome: 'Matheus', foto: 'https://i.pravatar.cc/150?u=matheus' }
            ]
        },
        {
            id: 2,
            tipo: 'Ensaio',
            titulo: 'Ensaio Geral (Banda e Vocal)',
            dataStr: `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-20`, // Dia 20
            horaInicio: '19:30',
            horaFim: '',
            local: 'Galeria do Som (Templo)',
            informacoes: 'Focaremos na nova música do congresso. Tragam suas garrafas de água.',
            repertorio: [
                { id: 3, titulo: 'Muro de Fogo', artista: 'Preto no Branco', tom: 'Am', estilo: 'Corinho de Fogo' }
            ],
            confirmados: [
                { id: 'u2', nome: 'Sarah', foto: 'https://i.pravatar.cc/150?u=sarah' }
            ],
            ausentes: []
        },
        {
            id: 3,
            tipo: 'Evento',
            titulo: 'Congresso de Jovens',
            dataStr: `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-25`, // Dia 25
            horaInicio: '19:00',
            horaFim: '22:00',
            local: 'Igreja Sede',
            informacoes: '',
            repertorio: [],
            confirmados: [],
            ausentes: []
        },
        {
            id: 4,
            tipo: 'Reunião',
            titulo: 'Alinhamento Ministério',
            dataStr: `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-10`, // Dia 10
            horaInicio: '20:00',
            horaFim: '21:00',
            local: 'Sala de Reuniões',
            informacoes: 'Reunião rápida para definir escalas do próximo mês.',
            repertorio: [],
            confirmados: [
                { id: 'user1', nome: 'Você', foto: '' }
            ],
            ausentes: []
        }
    ]
};

// Configuração Visual dos Tipos de Agenda
const configTipos = {
    'Culto': { corTexto: 'text-ouro', corBg: 'bg-ouro/20', corBorda: 'border-ouro/30', icone: 'ph-church' },
    'Ensaio': { corTexto: 'text-blue-400', corBg: 'bg-blue-500/20', corBorda: 'border-blue-500/30', icone: 'ph-music-notes' },
    'Evento': { corTexto: 'text-emerald-400', corBg: 'bg-emerald-500/20', corBorda: 'border-emerald-500/30', icone: 'ph-confetti' },
    'Reunião': { corTexto: 'text-fuchsia-400', corBg: 'bg-fuchsia-500/20', corBorda: 'border-fuchsia-500/30', icone: 'ph-users-three' }
};

export function obterTemplateAba() {
    if (!document.getElementById('estilos-agenda')) {
        const style = document.createElement('style');
        style.id = 'estilos-agenda';
        style.innerHTML = `
            /* O 'transform: none' no 100% resolve o bug do position: fixed do botão flutuante */
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

    // Ordenar agendas cronologicamente
    const agendasOrdenadas = [...estadoAgenda.agendas].sort((a, b) => new Date(a.dataStr) - new Date(b.dataStr));
    
    // Filtrar apenas agendas do mês selecionado para a lista
    const prefixoMesAtual = `${estadoAgenda.anoAtual}-${String(estadoAgenda.mesAtual + 1).padStart(2, '0')}`;
    const agendasDoMes = agendasOrdenadas.filter(a => a.dataStr.startsWith(prefixoMesAtual));

    return `
        <div id="modulo-agenda" class="w-full max-w-xl flex flex-col gap-6 animate-fadeIn h-full relative pb-32">
            
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

            <button id="btn-nova-agenda" class="fixed bottom-28 right-6 w-14 h-14 bg-ouro hover:bg-ouro-brilhante rounded-full shadow-[0_4px_20px_rgba(242,183,5,0.4)] flex items-center justify-center text-fundo transition-transform hover:scale-105 active:scale-95 outline-none z-50">
                <i class="ph ph-plus text-2xl font-bold"></i>
            </button>
        </div>
    `;
}

// Renderiza um Card Individual de Agenda
function renderizarCardAgenda(agenda) {
    const config = configTipos[agenda.tipo] || { corTexto: 'text-texto', corBg: 'bg-white/10', corBorda: 'border-white/20', icone: 'ph-calendar-blank' };
    
    // Formatação da Data (Ex: 28 Jun)
    const partesData = agenda.dataStr.split('-');
    const diaNum = partesData[2];
    const mesAbrev = obterNomeMes(parseInt(partesData[1]) - 1).substring(0, 3).toUpperCase();
    
    // Identificar status de presença do usuário logado
    const isConfirmado = agenda.confirmados.some(u => u.id === estadoAgenda.usuarioAtual.id);
    const isAusente = agenda.ausentes.some(u => u.id === estadoAgenda.usuarioAtual.id);

    return `
        <div id="agenda-card-${agenda.id}" class="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 backdrop-blur-md shadow-xl relative overflow-hidden transition-all">
            <div class="absolute left-0 top-0 h-full w-1 ${config.corBg.replace('/20', '')}"></div>
            
            <div class="flex justify-between items-start">
                <div class="flex flex-col gap-1.5">
                    <span class="text-[10px] ${config.corBg} ${config.corTexto} border ${config.corBorda} px-2 py-0.5 rounded-md font-bold uppercase tracking-wider w-max flex items-center gap-1">
                        <i class="${config.icone}"></i> ${agenda.tipo}
                    </span>
                    <h3 class="text-base font-bold text-texto leading-tight pr-2">${agenda.titulo}</h3>
                </div>
                <div class="text-right shrink-0 bg-black/40 border border-white/10 rounded-xl p-2 flex flex-col items-center justify-center min-w-[50px]">
                    <span class="text-sm font-extrabold text-ouro block leading-none">${diaNum}</span>
                    <span class="text-[9px] text-texto/60 font-bold tracking-widest mt-0.5">${mesAbrev}</span>
                </div>
            </div>

            <div class="flex flex-col gap-1">
                <p class="text-xs text-texto/70 flex items-center gap-2 font-medium">
                    <i class="ph-fill ph-clock text-ouro"></i> 
                    ${agenda.horaInicio} ${agenda.horaFim ? `às ${agenda.horaFim}` : ''}
                </p>
                <p class="text-xs text-texto/70 flex items-center gap-2 font-medium">
                    <i class="ph-fill ph-map-pin text-ouro"></i> 
                    ${agenda.local}
                </p>
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
                        <span class="text-[10px] text-texto/40 font-bold uppercase tracking-widest">Confirmados (${agenda.confirmados.length})</span>
                        <div class="avatar-stack">
                            ${gerarAvatares(agenda.confirmados)}
                        </div>
                    </div>
                </div>
                ${agenda.ausentes.length > 0 ? `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] text-red-400/60 font-bold uppercase tracking-widest">Ausentes (${agenda.ausentes.length})</span>
                        <div class="avatar-stack">
                            ${gerarAvatares(agenda.ausentes)}
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>

            ${agenda.repertorio.length > 0 ? `
                <div class="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col gap-2 mt-1">
                    <span class="text-[10px] text-ouro font-bold uppercase tracking-widest flex items-center gap-1 mb-1"><i class="ph-fill ph-playlist"></i> Repertório Definido</span>
                    <div class="flex flex-col gap-2">
                        ${agenda.repertorio.map(musica => renderizarMiniCardMusica(musica)).join('')}
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
    const diaSemanaInicio = dataPrimeiroDia.getDay(); // 0 (Dom) a 6 (Sáb)
    
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
            // Destaca o dia de hoje fortemente com dourado e sombra
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

// Gerador de Avatares (Limitado a 4)
function gerarAvatares(listaUsuarios) {
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

// =========================================================================
// INICIALIZAÇÃO E DELEGAÇÃO DE EVENTOS
// =========================================================================
export function inicializarEventosAba() {
    if (!window.agendaListenersInjetados) {
        window.agendaListenersInjetados = true;
        
        document.addEventListener('click', (e) => {
            // Controle do Calendário (Passar meses)
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

            // Rolar a tela até o evento clicado no calendário
            const diaCalendario = e.target.closest('[data-scroll-to]');
            if (diaCalendario) {
                const targetId = diaCalendario.getAttribute('data-scroll-to');
                const element = document.getElementById(targetId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Efeito sutil de piscar para mostrar ao usuário onde a tela parou
                    element.classList.add('ring-2', 'ring-ouro', 'ring-offset-2', 'ring-offset-[#0D0D0D]');
                    setTimeout(() => element.classList.remove('ring-2', 'ring-ouro', 'ring-offset-2', 'ring-offset-[#0D0D0D]'), 1500);
                }
                return;
            }

            // Redirecionar para Detalhes da Canção (Integração com Repertório)
            const cardMusica = e.target.closest('.mini-card-musica');
            if (cardMusica) {
                const idMusica = parseInt(cardMusica.getAttribute('data-musica-id'), 10);
                window.RepertorioOrigem = 'agenda'; 
                window.RepertorioMusicaId = idMusica;
                // Dispara o clique na Tab Bar para trocar a aba ativa para repertório
                const btnAbaRepertorio = document.querySelector('button[data-aba="repertorio"]');
                if (btnAbaRepertorio) btnAbaRepertorio.click();
                return;
            }

            // Ações de Presença
            const btnPresenca = e.target.closest('.btn-presenca');
            if (btnPresenca) {
                const idAgenda = parseInt(btnPresenca.getAttribute('data-id'), 10);
                const acao = btnPresenca.getAttribute('data-acao'); // 'confirmar' ou 'ausente'
                const agenda = estadoAgenda.agendas.find(a => a.id === idAgenda);
                
                if (agenda) {
                    agenda.confirmados = agenda.confirmados.filter(u => u.id !== estadoAgenda.usuarioAtual.id);
                    agenda.ausentes = agenda.ausentes.filter(u => u.id !== estadoAgenda.usuarioAtual.id);
                    
                    if (acao === 'confirmar') {
                        agenda.confirmados.push(estadoAgenda.usuarioAtual);
                    } else if (acao === 'ausente') {
                        agenda.ausentes.push(estadoAgenda.usuarioAtual);
                    }
                    
                    forcarAtualizacaoAgenda();
                }
                return;
            }
            
            if (e.target.closest('#btn-nova-agenda')) {
                alert('A tela de Cadastro de Nova Agenda será implementada aqui.');
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
