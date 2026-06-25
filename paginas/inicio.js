export function renderizarInicio() {
    const app = document.getElementById('app');

    // Simulação de dados do usuário logado (Futuramente virá do Supabase)
    const usuarioLogado = {
        nome: "Admin", // Você pode alterar para testar
        fotoUrl: ""    // Deixe vazio para testar o ícone padrão, ou insira um link de imagem real
    };

    // Renderizando a foto ou o ícone padrão
    const renderizarAvatar = () => {
        if (usuarioLogado.fotoUrl) {
            return `<img src="${usuarioLogado.fotoUrl}" alt="Perfil" class="w-full h-full object-cover rounded-full">`;
        }
        return `<i class="ph-fill ph-user text-2xl text-ouro-claro"></i>`;
    };

    // Construção do Layout (HTML + Tailwind CSS inline)
    const html = `
        <div class="min-h-screen flex flex-col bg-fundo relative overflow-hidden font-sans">
            
            <div class="fixed top-[-10%] left-[-10%] w-96 h-96 bg-ouro rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none z-0"></div>
            <div class="fixed bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-ouro-escuro rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none z-0"></div>

            <header class="fixed top-0 left-0 w-full z-50 bg-fundo/70 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" title="Acessar Perfil">
                    
                    <div class="w-12 h-12 rounded-full border-[2px] border-ouro p-0.5 overflow-hidden bg-black/40 flex items-center justify-center shadow-[0_0_15px_rgba(242,183,5,0.15)] relative">
                        ${renderizarAvatar()}
                    </div>
                    
                    <div class="flex flex-col">
                        <span class="text-[11px] text-texto/50 font-semibold tracking-widest uppercase">Bem-vindo(a)</span>
                        <span class="text-lg text-texto font-medium leading-tight">Olá, <span class="font-bold text-ouro">${usuarioLogado.nome}</span></span>
                    </div>

                </div>
                
                <button class="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all focus:ring-2 focus:ring-ouro/50 outline-none">
                    <i class="ph ph-list text-xl text-texto"></i>
                </button>
            </header>

            <main class="flex-grow pt-28 pb-32 px-6 flex flex-col items-center justify-center z-10">
                <div class="w-full max-w-sm bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-[2rem] flex flex-col items-center shadow-2xl text-center transform transition-transform duration-500 hover:scale-105">
                    
                    <div class="w-20 h-20 rounded-full bg-ouro/10 flex items-center justify-center mb-6 border border-ouro/20">
                        <i class="ph-duotone ph-hammer text-4xl text-ouro animate-bounce"></i>
                    </div>
                    
                    <h2 class="text-2xl font-bold text-texto mb-3 tracking-wide">Em desenvolvimento</h2>
                    <p class="text-texto/60 text-sm leading-relaxed">
                        Este é o painel principal do <b>Banda Atalaia App</b>. Em breve, os atalhos e resumos das atividades estarão disponíveis aqui.
                    </p>
                </div>
            </main>

            <nav class="fixed bottom-0 left-0 w-full z-50 px-4 pb-4 pt-2 pointer-events-none">
                <div class="pointer-events-auto bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl max-w-[450px] mx-auto flex justify-between items-center px-4 py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                    
                    <button class="flex flex-col items-center gap-1 w-14 group outline-none">
                        <div class="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-ouro/20 border border-ouro/30 text-ouro transition-all">
                            <i class="ph-fill ph-house text-2xl drop-shadow-[0_0_8px_rgba(242,183,5,0.6)]"></i>
                        </div>
                        <span class="text-[10px] font-bold text-ouro transition-colors">Início</span>
                    </button>

                    <button class="flex flex-col items-center gap-1 w-14 group hover:-translate-y-1 transition-transform duration-300 outline-none">
                        <div class="relative flex items-center justify-center w-11 h-11 rounded-2xl text-texto/40 group-hover:bg-white/5 group-hover:text-ouro-claro transition-all">
                            <i class="ph ph-calendar-blank text-2xl"></i>
                        </div>
                        <span class="text-[10px] font-medium text-texto/40 group-hover:text-ouro-claro transition-colors">Agenda</span>
                    </button>

                    <button class="flex flex-col items-center gap-1 w-14 group hover:-translate-y-1 transition-transform duration-300 outline-none">
                        <div class="relative flex items-center justify-center w-11 h-11 rounded-2xl text-texto/40 group-hover:bg-white/5 group-hover:text-ouro-claro transition-all">
                            <i class="ph ph-playlist text-2xl"></i>
                        </div>
                        <span class="text-[10px] font-medium text-texto/40 group-hover:text-ouro-claro transition-colors">Repertório</span>
                    </button>

                    <button class="flex flex-col items-center gap-1 w-14 group hover:-translate-y-1 transition-transform duration-300 outline-none">
                        <div class="relative flex items-center justify-center w-11 h-11 rounded-2xl text-texto/40 group-hover:bg-white/5 group-hover:text-ouro-claro transition-all">
                            <i class="ph ph-megaphone text-2xl"></i>
                            <span class="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-fundo"></span>
                        </div>
                        <span class="text-[10px] font-medium text-texto/40 group-hover:text-ouro-claro transition-colors">Avisos</span>
                    </button>

                    <button class="flex flex-col items-center gap-1 w-14 group hover:-translate-y-1 transition-transform duration-300 outline-none">
                        <div class="relative flex items-center justify-center w-11 h-11 rounded-2xl text-texto/40 group-hover:bg-white/5 group-hover:text-ouro-claro transition-all">
                            <i class="ph ph-currency-dollar text-2xl"></i>
                        </div>
                        <span class="text-[10px] font-medium text-texto/40 group-hover:text-ouro-claro transition-colors">Finanças</span>
                    </button>
                    
                </div>
            </nav>
            
        </div>
    `;

    // Injeta a página renderizada na div #app
    app.innerHTML = html;
}