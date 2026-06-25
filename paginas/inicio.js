export function renderizarInicio() {
    const app = document.getElementById('app');

    // Estado da aba ativa (Controle de navegação interno da SPA)
    let abaAtiva = 'inicio';

    // Simulação de dados do usuário logado (Futuramente integrado ao Supabase)
    const usuarioLogado = {
        nome: "Admin",
        fotoUrl: "" // Deixe vazio para ícone padrão ou insira URL da imagem
    };

    // Definição das Abas da Tab Bar para renderização dinâmica e limpa
    const abas = [
        { id: 'inicio', label: 'Início', iconePadrao: 'ph-house', iconeAtivo: 'ph-fill ph-house' },
        { id: 'agenda', label: 'Agenda', iconePadrao: 'ph-calendar-blank', iconeAtivo: 'ph-fill ph-calendar-blank' },
        { id: 'repertorio', label: 'Repertório', iconePadrao: 'ph-playlist', iconeAtivo: 'ph-fill ph-playlist' },
        { id: 'avisos', label: 'Avisos', iconePadrao: 'ph-bell', iconeAtivo: 'ph-fill ph-bell', temNotificacao: true },
        { id: 'financeiro', label: 'Finanças', iconePadrao: 'ph-currency-dollar', iconeAtivo: 'ph-fill ph-currency-dollar' }
    ];

    // Helper para renderizar a imagem de perfil ou o avatar padrão
    const obterAvatarHtml = () => {
        if (usuarioLogado.fotoUrl) {
            return `<img src="${usuarioLogado.fotoUrl}" alt="Perfil" class="w-full h-full object-cover rounded-full">`;
        }
        return `<i class="ph-fill ph-user text-2xl text-ouro-claro"></i>`;
    };

    // Estrutura Base do Layout (Header, Main de Conteúdo e Nav estrutural fixo)
    app.innerHTML = `
        <div class="min-h-screen bg-fundo relative font-sans text-texto select-none">
            
            <div class="fixed top-[-10%] left-[-10%] w-96 h-96 bg-ouro rounded-full mix-blend-screen filter blur-[150px] opacity-15 pointer-events-none z-0"></div>
            <div class="fixed bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-ouro-escuro rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none z-0"></div>

            <header class="fixed top-0 left-0 w-full z-50 bg-fundo/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-11 h-11 rounded-full border border-ouro/40 p-0.5 bg-black/50 flex items-center justify-center shadow-[0_0_15px_rgba(242,183,5,0.1)]">
                        ${obterAvatarHtml()}
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[10px] text-texto/40 font-bold tracking-widest uppercase">Portal Atalaia</span>
                        <span class="text-base text-texto font-medium leading-tight">Olá, <span class="font-bold text-ouro">${usuarioLogado.nome}</span></span>
                    </div>
                </div>
                
                <button class="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all outline-none">
                    <i class="ph ph-list text-xl text-texto"></i>
                </button>
            </header>

            <main id="container-principal" class="w-full min-h-screen pt-28 pb-32 px-6 flex flex-col items-center justify-center relative z-10">
                </main>

            <nav class="fixed bottom-6 left-0 w-full z-50 px-6 pointer-events-none">
                <div id="tab-bar-container" class="pointer-events-auto max-w-[420px] mx-auto flex justify-between items-end px-2 py-1 bg-transparent">
                    </div>
            </nav>
            
        </div>
    `;

    // Função interna para renderizar o miolo da página baseado na seleção
    function renderizarConteudoAba() {
        const container = document.getElementById('container-principal');
        
        // Renderização limpa do card de desenvolvimento sem propriedades de zoom/escala
        container.innerHTML = `
            <div class="w-full max-w-sm bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] flex flex-col items-center shadow-2xl text-center">
                <div class="w-16 h-16 rounded-2xl bg-ouro/10 flex items-center justify-center mb-6 border border-ouro/20 shadow-[0_0_20px_rgba(242,183,5,0.05)]">
                    <i class="ph ph-layout text-3xl text-ouro"></i>
                </div>
                <h2 class="text-xl font-bold text-texto mb-2 tracking-wide capitalize">Aba ${abaAtiva}</h2>
                <p class="text-ouro-claro font-semibold text-xs tracking-widest uppercase mb-3 bg-ouro-escuro/30 px-3 py-1 rounded-full border border-ouro-escuro/30">Em desenvolvimento</p>
                <p class="text-texto/50 text-sm leading-relaxed">
                    A interface completa desta funcionalidade será estruturada e conectada nas próximas fases do projeto.
                </p>
            </div>
        `;
    }

    // Função interna para renderizar e atualizar os estados visuais da Tab Bar Suspensa
    function renderizarTabBar() {
        const container = document.getElementById('tab-bar-container');
        
        container.innerHTML = abas.map(aba => {
            const isAtiva = aba.id === abaAtiva;
            
            // Definição de classes condicionais baseadas no estado ativo/inativo
            const classeBotao = isAtiva 
                ? 'text-ouro drop-shadow-[0_0_10px_rgba(242,183,5,0.3)] font-bold scale-110' 
                : 'text-texto/40 hover:text-texto/70 font-medium';
                
            const iconeClass = isAtiva ? aba.iconeAtivo : aba.iconePadrao;

            return `
                <button data-aba="${aba.id}" class="flex flex-col items-center justify-center w-14 transition-all duration-300 outline-none select-none ${classeBotao}">
                    <div class="relative flex items-center justify-center w-10 h-10 mb-0.5">
                        <i class="${iconeClass} text-2xl"></i>
                        
                        ${aba.temNotificacao ? `
                            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-fundo"></span>
                        ` : ''}
                    </div>
                    
                    ${isAtiva ? `
                        <span class="text-[10px] tracking-wide transition-all duration-300 animate-fade-in">${aba.label}</span>
                    ` : ''}
                </button>
            `;
        }).join('');

        // Atribuição dos event listeners de clique para navegação da SPA
        container.querySelectorAll('button[data-aba]').forEach(botao => {
            botao.addEventListener('click', (e) => {
                const destino = e.currentTarget.getAttribute('data-aba');
                if (destino !== abaAtiva) {
                    abaAtiva = destino;
                    renderizarTabBar();      // Atualiza o estado visual dos botões
                    renderizarConteudoAba(); // Substitui o conteúdo central do app
                }
            });
        });
    }

    // Execução inicial do ciclo de renderização do componente
    renderizarTabBar();
    renderizarConteudoAba();
}
