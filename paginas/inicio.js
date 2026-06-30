// BANDA ATALAIA APP - Módulo de Início (Dashboard)
// Arquitetura Reativa Vanilla JS com Tailwind CSS e Glassmorphism

import { obterUsuarioAtual, obterPerfilMembro, obterTodosPerfis } from '../supabase.js';

export async function renderizarInicio(abaParaAtivar = 'inicio') {
    const app = document.getElementById('app');
    
    let abaAtiva = abaParaAtivar;
    let usuarioLogado = { nome: "Carregando...", fotoUrl: "" };
    
    // Autenticação
    const usuarioAuth = await obterUsuarioAtual();
    if (!usuarioAuth) {
        const modulo = await import('./autenticacao.js');
        modulo.renderizarAutenticacao();
        return;
    }
    
    const { perfil } = await obterPerfilMembro(usuarioAuth.id);
    if (perfil) {
        usuarioLogado.nome = perfil.nome;
        usuarioLogado.fotoUrl = perfil.fotoUrl;
    } else {
        usuarioLogado.nome = "Membro Atalaia";
    }

    // BUSCA TODAS AS CONTAS REAIS CADASTRADAS NO SUPABASE
    const { perfis } = await obterTodosPerfis();
    const todosMembros = perfis || [];
    
    const abas = [
        { id: 'inicio', label: 'Início', iconePadrao: 'ph ph-house', iconeAtivo: 'ph-fill ph-house' },
        { id: 'agenda', label: 'Agenda', iconePadrao: 'ph ph-calendar-blank', iconeAtivo: 'ph-fill ph-calendar-blank' },
        { id: 'repertorio', label: 'Repertório', iconePadrao: 'ph ph-playlist', iconeAtivo: 'ph-fill ph-playlist' },
        { id: 'avisos', label: 'Avisos', iconePadrao: 'ph ph-bell', iconeAtivo: 'ph-fill ph-bell' },
        { id: 'financeiro', label: 'Finanças', iconePadrao: 'ph ph-currency-dollar', iconeAtivo: 'ph-fill ph-currency-dollar' }
    ];
    
    const renderizarAvatar = () => {
        if (usuarioLogado.fotoUrl) {
            return `<img src="${usuarioLogado.fotoUrl}" alt="Perfil" class="w-full h-full object-cover rounded-full">`;
        }
        return `<i class="ph-fill ph-user text-2xl text-ouro-claro"></i>`;
    };
    
    function construirLayoutBase() {
        app.innerHTML = `
            <div class="min-h-screen bg-fundo relative font-sans text-texto select-none overflow-x-hidden">
                
                <div class="fixed top-[-10%] left-[-10%] w-96 h-96 bg-ouro rounded-full filter blur-[120px] opacity-10 pointer-events-none z-0"></div>
                <div class="fixed bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-ouro-escuro rounded-full filter blur-[120px] opacity-10 pointer-events-none z-0"></div>

                <header class="fixed top-0 left-0 w-full z-50 bg-fundo/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    <div id="btn-perfil" class="flex items-center gap-4 cursor-pointer" title="Acessar Perfil">
                        <div class="w-11 h-11 rounded-full border border-ouro/40 p-0.5 overflow-hidden bg-black/50 flex items-center justify-center shadow-[0_0_15px_rgba(242,183,5,0.1)]">
                            ${renderizarAvatar()}
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] text-texto/50 font-bold tracking-widest uppercase">Banda Atalaia App</span>
                            <span class="text-base text-texto font-medium leading-tight">Olá, <span class="font-bold text-ouro">${usuarioLogado.nome}</span></span>
                        </div>
                    </div>
                    <button id="btn-membros-view" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-all outline-none" title="Membros da Banda">
                        <i class="ph ph-users text-xl text-texto"></i>
                    </button>
                </header>

                <main id="conteudo-principal" class="w-full min-h-screen pt-24 pb-32 px-4 md:px-8 flex flex-col items-center relative z-10"></main>

                <nav class="fixed bottom-6 left-0 w-full z-50 px-6 pointer-events-none">
                    <div id="tab-bar-container" class="pointer-events-auto max-w-[450px] mx-auto flex justify-between items-end bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl"></div>
                </nav>
                
            </div>
        `;
        
        document.getElementById('btn-perfil').addEventListener('click', async () => {
            const modulo = await import('./perfil.js');
            modulo.renderizarPerfil();
        });
        
        document.getElementById('btn-membros-view').addEventListener('click', async () => {
            const modulo = await import('./membros.js');
            modulo.renderizarMembros();
        });
        
        renderizarTabBar();
        renderizarConteudoAba();
    }
    
    async function renderizarConteudoAba() {
        const container = document.getElementById('conteudo-principal');
        
        if (abaAtiva === 'inicio') {
            container.innerHTML = obterTemplateDashboardInicio();
            
            // Adicionar Event Listeners para os botões "Ver Todos"
            container.querySelectorAll('button[data-ir-aba]').forEach(b => {
                b.addEventListener('click', (e) => {
                    abaAtiva = e.currentTarget.getAttribute('data-ir-aba');
                    renderizarTabBar();
                    renderizarConteudoAba();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            });
            return;
        }
        
        try {
            const modulo = await import(`./${abaAtiva}.js`);
            if (modulo && modulo.obterTemplateAba) {
                container.innerHTML = modulo.obterTemplateAba();
                if (modulo.inicializarEventosAba) modulo.inicializarEventosAba();
            }
        } catch (err) {
            console.error("Erro ao carregar o módulo da aba:", err);
            container.innerHTML = `<p class="text-red-400 text-sm mt-12">Erro ao carregar o conteúdo.</p>`;
        }
    }
    
    function renderizarTabBar() {
        const container = document.getElementById('tab-bar-container');
        container.innerHTML = abas.map(aba => {
            const isAtiva = aba.id === abaAtiva;
            const corIcone = isAtiva ?
                'text-ouro drop-shadow-[0_0_12px_rgba(242,183,5,0.5)] scale-110' :
                'text-texto/50 hover:text-texto transition-colors scale-100';
            const iconeClass = isAtiva ? aba.iconeAtivo : aba.iconePadrao;
            
            return `
                <button data-aba="${aba.id}" class="flex flex-col items-center justify-center flex-1 h-12 outline-none select-none group transition-all">
                    <div class="flex items-center justify-center ${corIcone}">
                        <i class="${iconeClass} text-2xl"></i> 
                    </div>
                    ${isAtiva ? `<span class="text-[9px] font-bold text-ouro tracking-wide mt-1 animate-[fadeIn_0.2s_ease-in-out]">${aba.label}</span>` : ''}
                </button>
            `;
        }).join('');
        
        container.querySelectorAll('button[data-aba]').forEach(botao => {
            botao.addEventListener('click', (e) => {
                const destino = e.currentTarget.getAttribute('data-aba');
                if (destino !== abaAtiva) {
                    abaAtiva = destino;
                    renderizarTabBar();
                    renderizarConteudoAba();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }
    
    if (!document.getElementById('animacao-tab')) {
        const style = document.createElement('style');
        style.id = 'animacao-tab';
        style.innerHTML = `
            @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
            .animate-\\[fadeIn_0\\.3s_ease-in-out\\] { animation: fadeIn 0.3s ease-in-out forwards; }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            *, *::before, *::after { -webkit-user-select: none !important; user-select: none !important; -webkit-user-drag: none !important; }
            button, a, i, div { -webkit-tap-highlight-color: transparent !important; }
            html, body, #app { touch-action: pan-x pan-y !important; -webkit-text-size-adjust: 100% !important; }
            
            /* Avatar Stack classes reaproveitadas da Agenda */
            .avatar-stack-inicio { display: flex; align-items: center; margin-left: 8px; }
            .avatar-item-inicio { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #0D0D0D; margin-left: -8px; background-color: #1a1a1a; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // HELPERS & TEMPLATES DO DASHBOARD
    // ==========================================

    function obterDevocionalDaSemana() {
        const devocionais = [
            { titulo: "Coração de Adorador", texto: "\"Deus é Espírito, e importa que os que o adoram o adorem em espírito e em verdade.\" (João 4:24). A técnica atrai os ouvidos, mas a adoração verdadeira atrai o coração de Deus." },
            { titulo: "Técnica e Unção", texto: "\"Cantai-lhe um cântico novo; tocai bem e com júbilo.\" (Salmos 33:3). Que a nossa dedicação técnica ande sempre de mãos dadas com a nossa intimidade com o Altar." },
            { titulo: "Unidade no Altar", texto: "\"Oh! quão bom e quão suave é que os irmãos vivam em união.\" (Salmos 133:1). Quando a banda toca em unidade, o som que sobe aos céus é perfeito aos ouvidos do Pai." },
            { titulo: "Instrumentos de Honra", texto: "\"De sorte que, se alguém se purificar destas coisas, será vaso para honra, santificado e idôneo para uso do Senhor.\" (2 Timóteo 2:21). Somos os instrumentos principais." },
            { titulo: "Gratidão em Louvor", texto: "\"Entrai pelas portas dele com gratidão, e em seus átrios com louvor...\" (Salmos 100:4). O nosso talento é um presente de Deus; o nosso louvor é o nosso retorno a Ele." }
        ];

        // Lógica para pegar o devocional baseado na semana do ano (Dinâmico)
        const hoje = new Date();
        const inicioAno = new Date(hoje.getFullYear(), 0, 1);
        const dias = Math.floor((hoje - inicioAno) / (24 * 60 * 60 * 1000));
        const semanaDoAno = Math.ceil(dias / 7);
        
        return devocionais[semanaDoAno % devocionais.length];
    }

    function obterTemplateDashboardInicio() {
        const devocional = obterDevocionalDaSemana();
        
        const ultimoAviso = {
            categoria: 'Geral', prioridade: 'Urgente', titulo: 'Alteração de Horário do Ensaio',
            descricao: 'Devido à manutenção preventiva do ar-condicionado da igreja, o ensaio deste sábado começará pontualmente às 14:00h e não às 16:00h. Contamos com a pontualidade de todos.',
            autorNome: 'Líder', dataPublicacao: new Date().toISOString()
        };

        // Próxima Agenda: Agora extraindo os avatares reais cadastrados
        const hoje = new Date();
        const proximaAgenda = {
            tipo: 'Culto', titulo: 'Culto de Celebração',
            dataStr: `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-15`,
            horaInicio: '18:00', local: 'Nave Central da Igreja',
            confirmados: todosMembros.slice(0, 3).map(m => ({ foto: m.fotoUrl }))
        };

        const ultimasCancoes = [
            { titulo: 'Muro de Fogo', artista: 'Preto no Branco', tom: 'Am', estilo: 'Corinho de Fogo', data: '2023-10-01' },
            { titulo: 'A Casa É Sua', artista: 'Casa Worship', tom: 'E', estilo: 'Worship', data: '2023-09-15' }
        ];

        // Membros Online: Extrai nomes e fotos reais do seu Supabase (Máximo 6 na UI)
        const membrosOnline = todosMembros.slice(0, 6).map(m => ({
            nome: m.id === usuarioAuth.id ? 'Você' : m.nome.split(' ')[0],
            foto: m.fotoUrl
        }));

        return `
            <div class="w-full max-w-xl mt-4 flex flex-col gap-6 animate-[fadeIn_0.4s_ease-in-out]">
                
                <div class="bg-gradient-to-br from-ouro-escuro/40 to-black/40 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-xl relative overflow-hidden">
                    <i class="ph-fill ph-quotes absolute -top-4 -right-2 text-8xl text-white/[0.03] rotate-12"></i>
                    <h2 class="text-[10px] text-ouro-claro font-bold uppercase tracking-widest mb-1">Devocional da Semana</h2>
                    <h3 class="text-xl font-bold text-texto mb-2">${devocional.titulo}</h3>
                    <p class="text-sm text-texto/80 leading-relaxed italic">${devocional.texto}</p>
                </div>
                
                <div class="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md shadow-lg flex flex-col gap-3">
                    <div class="flex items-center gap-2">
                        <div class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        <h3 class="text-sm font-bold text-texto tracking-wide uppercase">Membros Online</h3>
                    </div>
                    <div class="flex gap-4 overflow-x-auto hide-scrollbar pb-2 pt-1">
                        ${membrosOnline.length > 0 ? membrosOnline.map(m => `
                            <div class="flex flex-col items-center gap-1.5 shrink-0">
                                <div class="w-12 h-12 rounded-full border-2 border-green-500/50 p-[2px] relative">
                                    <div class="w-full h-full rounded-full bg-black/50 overflow-hidden flex items-center justify-center">
                                        ${m.foto ? `<img src="${m.foto}" class="w-full h-full object-cover">` : `<i class="ph-fill ph-user text-xl text-ouro-claro"></i>`}
                                    </div>
                                    <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0D0D0D] rounded-full"></div>
                                </div>
                                <span class="text-[10px] text-texto/70 font-medium">${m.nome}</span>
                            </div>
                        `).join('') : '<p class="text-texto/30 text-xs px-2 py-2">Nenhum membro registrado.</p>'}
                    </div>
                </div>

                <div class="flex flex-col gap-3">
                    <div class="flex items-center justify-between px-1">
                        <div class="flex items-center gap-2">
                            <i class="ph-fill ph-bell-ringing text-ouro text-xl animate-bounce"></i>
                            <h3 class="text-base font-bold text-texto tracking-wide">Quadro de Avisos</h3>
                        </div>
                    </div>
                    
                    <div class="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex flex-col gap-2 relative shadow-lg">
                        <div class="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse">Novo</div>
                        
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2 text-red-500 font-bold text-[10px] uppercase tracking-wider">
                                <i class="ph-fill ph-warning-circle text-sm"></i> ${ultimoAviso.prioridade} • ${ultimoAviso.categoria}
                            </div>
                        </div>
                        
                        <h4 class="text-sm font-bold text-texto mt-1 leading-tight">${ultimoAviso.titulo}</h4>
                        <p class="text-xs text-texto/70 leading-relaxed line-clamp-2">${ultimoAviso.descricao}</p>
                        
                        <div class="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                            <span class="text-[9px] text-texto/40">Por: <span class="text-texto/60 font-medium">${ultimoAviso.autorNome}</span></span>
                            <span class="text-[9px] text-texto/30">Agora</span>
                        </div>
                    </div>
                    <button data-ir-aba="avisos" class="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-texto/80 hover:text-texto text-xs font-bold uppercase tracking-widest py-3 rounded-xl transition-all active:scale-[0.98] outline-none">
                        Ver Todos os Avisos
                    </button>
                </div>

                <div class="flex flex-col gap-3 mt-2">
                    <div class="flex items-center justify-between px-1">
                        <div class="flex items-center gap-2">
                            <i class="ph-fill ph-calendar-check text-ouro text-xl"></i>
                            <h3 class="text-base font-bold text-texto tracking-wide">Próxima Agenda</h3>
                        </div>
                    </div>
                    
                    <div class="bg-ouro/10 border border-ouro/20 rounded-2xl p-5 flex flex-col gap-4 backdrop-blur-md shadow-xl relative overflow-hidden">
                        <div class="absolute left-0 top-0 h-full w-1 bg-ouro"></div>
                        
                        <div class="flex justify-between items-start">
                            <div class="flex flex-col gap-1.5">
                                <span class="text-[10px] bg-ouro/20 text-ouro border border-ouro/30 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider w-max flex items-center gap-1">
                                    <i class="ph-church"></i> ${proximaAgenda.tipo}
                                </span>
                                <h4 class="text-base font-bold text-texto leading-tight pr-2">${proximaAgenda.titulo}</h4>
                            </div>
                            <div class="text-right shrink-0 bg-black/40 border border-white/10 rounded-xl p-2 flex flex-col items-center justify-center min-w-[50px]">
                                <span class="text-sm font-extrabold text-ouro block leading-none">15</span>
                                <span class="text-[9px] text-texto/60 font-bold tracking-widest mt-0.5">JUN</span>
                            </div>
                        </div>

                        <div class="flex flex-col gap-1">
                            <p class="text-xs text-texto/70 flex items-center gap-2 font-medium">
                                <i class="ph-fill ph-clock text-ouro"></i> ${proximaAgenda.horaInicio}
                            </p>
                            <p class="text-xs text-texto/70 flex items-center gap-2 font-medium">
                                <i class="ph-fill ph-map-pin text-ouro"></i> ${proximaAgenda.local}
                            </p>
                        </div>

                        <div class="flex flex-col gap-2 border-t border-white/5 pt-3">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <span class="text-[10px] text-texto/40 font-bold uppercase tracking-widest">Confirmados (${proximaAgenda.confirmados.length})</span>
                                    <div class="avatar-stack-inicio">
                                        ${proximaAgenda.confirmados.map(c => `
                                            <div class="avatar-item-inicio">
                                                ${c.foto ? `<img src="${c.foto}" class="w-full h-full object-cover">` : `<i class="ph-fill ph-user text-[10px] text-ouro"></i>`}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button data-ir-aba="agenda" class="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-texto/80 hover:text-texto text-xs font-bold uppercase tracking-widest py-3 rounded-xl transition-all active:scale-[0.98] outline-none">
                        Ver Agenda Completa
                    </button>
                </div>

                <div class="flex flex-col gap-3 mt-2">
                    <div class="flex items-center justify-between px-1">
                        <div class="flex items-center gap-2">
                            <i class="ph-fill ph-playlist text-ouro text-xl"></i>
                            <h3 class="text-base font-bold text-texto tracking-wide">Adições ao Repertório</h3>
                        </div>
                    </div>
                    
                    <div class="flex flex-col gap-3">
                        ${ultimasCancoes.map(m => {
                            let bgClass = 'bg-white/5 border-white/10 text-texto/60';
                            if(m.estilo === 'Worship') bgClass = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
                            else if(m.estilo === 'Corinho de Fogo') bgClass = 'bg-red-500/10 text-orange-400 border-red-500/20';

                            return `
                            <div class="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md shadow-md">
                                <div class="flex items-center gap-4 overflow-hidden">
                                    <div class="w-11 h-11 rounded-xl bg-ouro/10 border border-ouro/20 flex items-center justify-center font-bold text-ouro text-sm shadow-inner shrink-0">${m.tom}</div>
                                    <div class="flex flex-col gap-1.5 overflow-hidden">
                                        <h4 class="text-sm font-bold text-texto leading-tight truncate">${m.titulo}</h4>
                                        <div class="flex items-center gap-2 flex-wrap">
                                            <span class="text-[11px] text-texto/60">${m.artista}</span>
                                            <span class="text-texto/30 text-[10px]">•</span>
                                            <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${bgClass}">${m.estilo}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                    <button data-ir-aba="repertorio" class="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-texto/80 hover:text-texto text-xs font-bold uppercase tracking-widest py-3 rounded-xl transition-all active:scale-[0.98] outline-none">
                        Acessar Repertório
                    </button>
                </div>

            </div>
        `;
    }
    
    construirLayoutBase();
}
