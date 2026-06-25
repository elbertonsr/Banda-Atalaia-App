export function renderizarInicio() {
    const app = document.getElementById('app');

    // Estado para controlar qual aba está selecionada
    let abaAtiva = 'inicio';

    // Simulação de dados do usuário logado
    const usuarioLogado = {
        nome: "Admin", 
        fotoUrl: "" 
    };

    // Definição estruturada das abas para facilitar a renderização limpa
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

    // Estrutura Principal da Tela (Header Fixo + Container + NavBar Suspensa)
    app.innerHTML = `
        <div class="min-h-screen bg-fundo relative font-sans text-texto select-none overflow-x-hidden">
            
            <div class="fixed top-[-10%] left-[-10%] w-96 h-96 bg-ouro rounded-full mix-blend-screen filter blur-[150px] opacity-15 pointer-events-none z-0"></div>
            <div class="fixed bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-ouro-escuro rounded-full mix-blend-screen filter blur-[150px] opacity-15 pointer-events-none z-0"></div>

            <header class="fixed top-0 left-0 w-full z-50 bg-fundo/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div class="flex items-center gap-4 cursor-pointer" title="Acessar Perfil">
                    
                    <div class="w-11 h-11 rounded-full border border-ouro/40 p-0.5 overflow-hidden bg-black/50 flex items-center justify-center shadow-[0_0_15px_rgba(242,183,5,0.1)]">
                        ${renderizarAvatar()}
                    </div>
                    
                    <div class="flex flex-col">
                        <span class="text-[10px] text-texto/50 font-bold tracking-widest uppercase">Banda Atalaia App</span>
                        <span class="text-base text-texto font-medium leading-tight">Olá, <span class="font-bold text-ouro">${usuarioLogado.nome}</span></span>
                    </div>

                </div>
                
                <button class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-all outline-none">
                    <i class="ph ph-list text-xl text-texto"></i>
                </button>
            </header>

            <main id="conteudo-principal" class="w-full min-h-screen pt-28 pb-32 px-6 flex flex-col items-center justify-center relative z-10">
            </main>

            <nav class="fixed bottom-6 left-0 w-full z-50 px-6 pointer-events-none">
                <div id="tab-bar-container" class="pointer-events-auto max-w-[400px] mx-auto flex justify-between items-end bg-transparent">
                </div>
            </nav>
            
        </div>
    `;

    // Função que atualiza o meio da tela dependendo do ícone clicado
    function renderizarConteudoAba() {
        const container = document.getElementById('conteudo-principal');
        
        container.innerHTML = `
            <div class="w-full max-w-sm bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] flex flex-col items-center shadow-2xl text-center">
                <div class="w-16 h-16 rounded-2xl bg-ouro/10 flex items-center justify-center mb-6 border border-ouro/20 shadow-[0_0_20px_rgba(242,183,5,0.05)]">
                    <i class="ph-duotone ph-hammer text-3xl text-ouro"></i>
                </div>
                <h2 class="text-xl font-bold text-texto mb-2 tracking-wide capitalize">${abaAtiva}</h2>
                <p class="text-ouro-claro font-semibold text-xs tracking-widest uppercase mb-3 bg-ouro-escuro/30 px-3 py-1 rounded-full border border-ouro-escuro/30">Em desenvolvimento</p>
                <p class="text-texto/60 text-sm leading-relaxed">
                    A interface completa desta funcionalidade será estruturada nas próximas fases.
                </p>
            </div>
        `;
    }

    // Função que constrói e gerencia o estado da Tab Bar
    function renderizarTabBar() {
        const container = document.getElementById('tab-bar-container');
        
        container.innerHTML = abas.map(aba => {
            const isAtiva = aba.id === abaAtiva;
            
            const corIcone = isAtiva 
                ? 'text-ouro drop-shadow-[0_0_12px_rgba(242,183,5,0.5)] scale-110' 
                : 'text-texto/70 hover:text-texto transition-colors scale-100';
                
            const iconeClass = isAtiva ? aba.iconeAtivo : aba.iconePadrao;

            return `
                <button data-aba="${aba.id}" class="flex flex-col items-center justify-end w-14 h-14 outline-none select-none group">
                    
                    <div class="flex items-center justify-center transition-all duration-300 ${corIcone}">
                        <i class="${iconeClass} text-[28px]"></i> 
                    </div>
                    
                    ${isAtiva ? `
                        <span class="text-[10px] font-bold text-ouro tracking-wide mt-1 animate-[fadeIn_0.3s_ease-in-out]">
                            ${aba.label}
                        </span>
                    ` : ''}
                    
                </button>
            `;
        }).join('');

        // Adiciona a ação de clique em cada botão
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

    // Adiciona uma pequena animação CSS global injetada via JS (para o surgimento do texto, bloqueio de zoom e seleção)
    if (!document.getElementById('animacao-tab')) {
        const style = document.createElement('style');
        style.id = 'animacao-tab';
        style.innerHTML = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(4px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-\\[fadeIn_0\\.3s_ease-in-out\\] {
                animation: fadeIn 0.3s ease-in-out forwards;
            }
            /* Bloqueio Absoluto de Seleção de Textos e Elementos */
            *, *::before, *::after {
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
                -webkit-user-drag: none !important;
            }
            /* Desativa o realce cinza de toque nativo do webkit (smartphones) */
            button, a, i, div {
                -webkit-tap-highlight-color: transparent !important;
            }
            /* Força comportamento de scroll e barra o zoom nativo via CSS */
            html, body, #app {
                touch-action: pan-x pan-y !important;
                -webkit-text-size-adjust: 100% !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Interceptação Programática via JS contra gestos de zoom em Smartphones
    // 1. Bloqueia Pinch-to-zoom (Zoom de pinça com dois dedos)
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });

    // 2. Bloqueia Double-tap to zoom (Zoom automático por duplo toque na tela)
    let ultimoToque = 0;
    document.addEventListener('touchend', (e) => {
        const agora = new Date().getTime();
        if (agora - ultimoToque <= 300) {
            e.preventDefault();
        }
        ultimoToque = agora;
    }, { passive: false });

    // Executa a primeira renderização
    renderizarTabBar();
    renderizarConteudoAba();
}
