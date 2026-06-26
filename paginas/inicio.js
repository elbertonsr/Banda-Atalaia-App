import { obterUsuarioAtual, obterPerfilMembro } from '../supabase.js';

export async function renderizarInicio(abaParaAtivar = 'inicio') {
    const app = document.getElementById('app');
    
    let abaAtiva = abaParaAtivar;
    let usuarioLogado = { nome: "Carregando...", fotoUrl: "" };
    
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
            container.innerHTML = `
                <div class="w-full max-w-xl mt-6 flex flex-col gap-6 animate-[fadeIn_0.4s_ease-in-out]">
                    <div class="bg-gradient-to-br from-ouro-escuro/40 to-black/40 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-xl">
                        <h2 class="text-xl font-bold text-ouro mb-2 flex items-center gap-2"><i class="ph ph-sparkle"></i> Devocional da Banda</h2>
                        <p class="text-sm text-texto/80 leading-relaxed italic">"Cantai-lhe um cântico novo; tocai bem e com júbilo." (Salmos 33:3). Que a nossa dedicação técnica ande sempre de mãos dadas com a nossa intimidade com o Altar.</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <button data-ir-aba="agenda" class="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col items-center text-center gap-3 active:scale-95 transition-all">
                            <div class="w-12 h-12 rounded-xl bg-ouro/10 flex items-center justify-center text-ouro text-2xl border border-ouro/20"><i class="ph ph-calendar"></i></div>
                            <span class="text-sm font-semibold">Próximo Ensaio</span>
                        </button>
                        <button data-ir-aba="repertorio" class="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col items-center text-center gap-3 active:scale-95 transition-all">
                            <div class="w-12 h-12 rounded-xl bg-ouro/10 flex items-center justify-center text-ouro text-2xl border border-ouro/20"><i class="ph ph-music-notes"></i></div>
                            <span class="text-sm font-semibold">Músicas do Culto</span>
                        </button>
                    </div>

                    <div class="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col gap-4 shadow-xl backdrop-blur-md relative overflow-hidden">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <i class="ph-fill ph-bell-ringing text-ouro text-xl animate-bounce"></i>
                                <h3 class="text-base font-bold text-texto tracking-wide">Quadro de Avisos</h3>
                            </div>
                            <span class="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse">1 Novo</span>
                        </div>
                        
                        <div class="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
                            <div class="absolute left-0 top-0 h-full w-1 bg-red-500"></div>
                            <div class="flex items-center justify-between pl-2">
                                <span class="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1"><i class="ph-fill ph-warning-circle"></i> Urgente • Geral</span>
                                <span class="text-[10px] text-texto/40">Recente</span>
                            </div>
                            <h4 class="text-sm font-bold text-texto pl-2 leading-tight">Alteração de Horário do Ensaio</h4>
                            <p class="text-xs text-texto/60 pl-2 leading-relaxed line-clamp-2">Devido à manutenção preventiva do ar-condicionado da igreja, o ensaio deste sábado começará pontualmente às 14:00h e não às 16:00h.</p>
                        </div>

                        <button data-ir-aba="avisos" class="w-full bg-ouro/10 hover:bg-ouro/20 text-ouro border border-ouro/20 font-bold text-xs tracking-widest uppercase py-3 rounded-xl transition-all active:scale-[0.98] outline-none mt-1">
                            Ver todos os avisos...
                        </button>
                    </div>
                </div>
            `;
            container.querySelectorAll('button[data-ir-aba]').forEach(b => {
                b.addEventListener('click', (e) => {
                    abaAtiva = e.currentTarget.getAttribute('data-ir-aba');
                    renderizarTabBar();
                    renderizarConteudoAba();
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
            *, *::before, *::after { -webkit-user-select: none !important; user-select: none !important; -webkit-user-drag: none !important; }
            button, a, i, div { -webkit-tap-highlight-color: transparent !important; }
            html, body, #app { touch-action: pan-x pan-y !important; -webkit-text-size-adjust: 100% !important; }
        `;
        document.head.appendChild(style);
    }
    
    construirLayoutBase();
}
