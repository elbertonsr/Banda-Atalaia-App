export function renderizarAutenticacao() {
    const app = document.getElementById('app');

    // Construção do Layout (HTML + Tailwind CSS inline nas classes)
    const html = `
        <div class="min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden bg-fundo">
            
            <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-ouro rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>
            <div class="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-ouro-escuro rounded-full mix-blend-screen filter blur-[150px] opacity-30 pointer-events-none"></div>

            <div class="relative w-full max-w-[400px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-2xl z-10 flex flex-col items-center transform transition-all duration-500">

                <div class="w-28 h-28 sm:w-32 sm:h-32 mb-6 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden border border-ouro/30 shadow-[0_0_20px_rgba(242,183,5,0.15)]">
                    <img src="./logo.png" alt="Logo Banda Atalaia" 
                         class="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                         onerror="this.src='https://via.placeholder.com/4000?text=LOGO';">
                </div>

                <div class="text-center mb-8 w-full">
                    <h1 class="text-2xl sm:text-3xl font-bold text-ouro mb-2 tracking-wide">Portal Atalaia</h1>
                    <p class="text-sm text-texto/70 italic leading-relaxed">
                        "E, sobre tudo isto, revesti-vos de amor, que é o vínculo da perfeição." <br>
                        <span class="text-xs text-ouro-claro opacity-80">(Colossenses 3:14)</span>
                    </p>
                </div>

                <form id="login-form" class="w-full flex flex-col gap-4">
                    
                    <div class="relative group">
                        <i class="ph ph-user absolute left-4 top-1/2 -translate-y-1/2 text-ouro text-xl transition-colors group-focus-within:text-ouro-brilhante"></i>
                        <input type="text" id="usuario" placeholder="Usuário" required
                            class="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-texto placeholder-texto/40 focus:outline-none focus:border-ouro focus:ring-1 focus:ring-ouro transition-all">
                    </div>

                    <div class="relative group">
                        <i class="ph ph-lock-key absolute left-4 top-1/2 -translate-y-1/2 text-ouro text-xl transition-colors group-focus-within:text-ouro-brilhante"></i>
                        <input type="password" id="senha" placeholder="Senha" required
                            class="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-texto placeholder-texto/40 focus:outline-none focus:border-ouro focus:ring-1 focus:ring-ouro transition-all">
                        
                        <button type="button" id="toggle-senha" class="absolute right-4 top-1/2 -translate-y-1/2 text-texto/50 hover:text-ouro transition-colors outline-none focus:text-ouro">
                            <i class="ph ph-eye text-xl" id="icone-senha"></i>
                        </button>
                    </div>

                    <div class="flex justify-between items-center text-sm px-1 mt-1 mb-2">
                        <label class="flex items-center gap-2 cursor-pointer group">
                            <div class="relative flex items-center justify-center">
                                <input type="checkbox" id="lembrar" class="peer appearance-none w-4 h-4 rounded border border-white/20 bg-black/40 checked:bg-ouro checked:border-ouro transition-all cursor-pointer">
                                <i class="ph-bold ph-check absolute text-fundo text-xs opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></i>
                            </div>
                            <span class="text-texto/70 group-hover:text-texto transition-colors">Salvar usuário</span>
                        </label>
                        <a href="#" class="text-ouro-claro hover:text-ouro-brilhante transition-colors">Recuperar senha</a>
                    </div>

                    <button type="submit"
                        class="w-full bg-gradient-to-r from-ouro-escuro via-ouro to-ouro-claro hover:from-ouro hover:via-ouro-claro hover:to-ouro-brilhante text-fundo font-bold text-lg py-3.5 rounded-2xl shadow-[0_4px_20px_rgba(242,183,5,0.25)] hover:shadow-[0_4px_25px_rgba(242,183,5,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-0">
                        Acessar Sistema
                    </button>
                </form>

                <div id="msg-erro" class="mt-4 text-red-400 text-sm hidden font-medium text-center bg-red-500/10 py-3 px-4 rounded-xl w-full border border-red-500/20 backdrop-blur-md flex items-center justify-center gap-2">
                    <i class="ph-fill ph-warning-circle text-lg"></i>
                    <span>Usuário ou senha inválidos.</span>
                </div>

            </div>

            <div class="mt-8 text-center text-texto/30 text-xs tracking-wider z-10">
                <p>USO EXCLUSIVO BANDA ATALAIA</p>
                <p class="mt-1">&copy; ${new Date().getFullYear()} Ministério de Louvor</p>
            </div>
        </div>
    `;

    // Injeta a estrutura na div #app
    app.innerHTML = html;

    // ----- LÓGICA E COMPORTAMENTOS (UX) ----- //

    const form = document.getElementById('login-form');
    const toggleSenhaBtn = document.getElementById('toggle-senha');
    const senhaInput = document.getElementById('senha');
    const iconeSenha = document.getElementById('icone-senha');
    const msgErro = document.getElementById('msg-erro');
    const usuarioInput = document.getElementById('usuario');

    // Recupera usuário salvo anteriormente (se houver)
    const usuarioSalvo = localStorage.getItem('atalaia_user_saved');
    if(usuarioSalvo) {
        usuarioInput.value = usuarioSalvo;
        document.getElementById('lembrar').checked = true;
    }

    // Ação: Mostrar/Esconder Senha
    toggleSenhaBtn.addEventListener('click', () => {
        if (senhaInput.type === 'password') {
            senhaInput.type = 'text';
            iconeSenha.classList.replace('ph-eye', 'ph-eye-slash');
            iconeSenha.classList.add('text-ouro-brilhante');
        } else {
            senhaInput.type = 'password';
            iconeSenha.classList.replace('ph-eye-slash', 'ph-eye');
            iconeSenha.classList.remove('text-ouro-brilhante');
        }
    });

    // Ação: Submeter Formulário de Login
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o recarregamento da página
        
        const usuario = usuarioInput.value.trim();
        const senha = senhaInput.value;
        const lembrar = document.getElementById('lembrar').checked;

        // Limpa erro anterior
        msgErro.classList.add('hidden');

        // Validando Credenciais de Teste (Admin)
        if (usuario === 'admin' && senha === 'admin123') {
            
            // Gerencia o "Salvar usuário"
            if (lembrar) {
                localStorage.setItem('atalaia_user_saved', usuario);
            } else {
                localStorage.removeItem('atalaia_user_saved');
            }

            // UI de Sucesso Visual
            form.innerHTML = `
                <div class="flex flex-col items-center justify-center py-6 animate-pulse">
                    <i class="ph-fill ph-check-circle text-6xl text-ouro-claro mb-4 drop-shadow-[0_0_15px_rgba(242,203,5,0.5)]"></i>
                    <p class="text-xl font-bold text-texto tracking-wide">Acesso Liberado</p>
                    <p class="text-texto/60 text-sm mt-2 flex items-center gap-2">
                        <i class="ph ph-spinner animate-spin"></i> Preparando ambiente...
                    </p>
                </div>
            `;

            // Simula o tempo de rede e redireciona para inicio.js
            setTimeout(() => {
                console.log("Redirecionando para a Dashboard...");
                // FUTURO: Aqui importaremos e executaremos inicio.js
                // import('./inicio.js').then(modulo => modulo.renderizarInicio());
                
                // Mensagem temporária para você enquanto as outras páginas não existem
                app.innerHTML = `<div class="min-h-screen flex items-center justify-center text-ouro text-2xl font-bold bg-fundo">Página "inicio.js" será carregada aqui!</div>`;
            }, 2000);

        } else {
            // Falha na Autenticação
            msgErro.innerHTML = `
                <i class="ph-fill ph-warning-circle text-lg"></i>
                <span>Credenciais incorretas. Tente <b>admin</b> e <b>admin123</b>.</span>
            `;
            msgErro.classList.remove('hidden');

            // Efeito visual de tremor (shake) no erro
            const card = document.querySelector('.max-w-\\[400px\\]');
            card.classList.add('translate-x-2');
            setTimeout(() => card.classList.replace('translate-x-2', '-translate-x-2'), 100);
            setTimeout(() => card.classList.replace('-translate-x-2', 'translate-x-2'), 200);
            setTimeout(() => card.classList.replace('translate-x-2', 'translate-x-0'), 300);
        }
    });
}

// Inicializa o módulo automaticamente ao ser carregado
renderizarAutenticacao();
