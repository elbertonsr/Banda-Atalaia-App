import { renderizarInicio } from './inicio.js';

export function renderizarPerfil() {
    const app = document.getElementById('app');

    // Estado interno reativo do usuário
    let usuario = {
        nome: "Admin Teste",
        fotoUrl: "", // Será preenchido com Base64 temporário até integrar o Storage do Supabase
        senha: "admin",
        funcoes: [
            'Líder', 'Vice Líder', 'Vocalista', 'Guitarrista', 
            'Contrabaixista', 'Baterista', 'Tecladista', 'Diretor Musical'
        ],
        arquivoFoto: null // Novo estado: Guardará o arquivo real para enviar ao Supabase depois
    };

    const funcoesDisponiveis = [
        { nome: 'Líder', icone: 'ph-fill ph-crown' },
        { nome: 'Vice Líder', icone: 'ph-fill ph-star' },
        { nome: 'Vocalista', icone: 'ph-fill ph-microphone-stage' },
        { nome: 'Guitarrista', icone: 'ph-fill ph-guitar' },
        { nome: 'Contrabaixista', icone: 'ph-fill ph-music-notes-plus' },
        { nome: 'Baterista', icone: 'ph-fill ph-drum' },
        { nome: 'Tecladista', icone: 'ph-fill ph-piano' },
        { nome: 'Diretor Musical', icone: 'ph-fill ph-sliders' }
    ];

    let menuFotoAberto = false;
    let modoEdicaoAberto = false;

    function exibirTelaPrincipal() {
        app.innerHTML = `
            <div class="min-h-screen bg-fundo relative font-sans text-texto select-none overflow-x-hidden pt-24 pb-12 px-6 flex flex-col items-center">
                
                <div class="fixed top-[-10%] left-[-10%] w-96 h-96 bg-ouro rounded-full mix-blend-screen filter blur-[150px] opacity-15 pointer-events-none z-0"></div>
                <div class="fixed bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-ouro-escuro rounded-full mix-blend-screen filter blur-[150px] opacity-15 pointer-events-none z-0"></div>

                <header class="fixed top-0 left-0 w-full z-50 bg-fundo/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    <button id="btn-voltar-inicio" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-all outline-none">
                        <i class="ph ph-arrow-left text-xl text-texto"></i>
                    </button>
                    <span class="text-sm font-bold text-ouro tracking-widest uppercase">Perfil do Membro</span>
                    <div class="w-10 h-10"></div>
                </header>

                <div class="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] flex flex-col items-center shadow-2xl relative z-10">
                    
                    <div class="relative mb-6">
                        <div class="w-28 h-28 rounded-full border-2 border-ouro p-1 bg-black/40 flex items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(242,183,5,0.2)] relative group">
                            ${usuario.fotoUrl 
                                ? `<img src="${usuario.fotoUrl}" alt="Foto de Perfil" class="w-full h-full object-cover rounded-full">`
                                : `<i class="ph-fill ph-user text-5xl text-ouro-claro"></i>`
                            }
                            
                            <div id="overlay-loading-foto" class="hidden absolute inset-0 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm transition-all">
                                <i class="ph ph-spinner-gap text-2xl text-ouro animate-spin"></i>
                            </div>
                        </div>
                        
                        <button id="btn-menu-foto" class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-ouro hover:bg-ouro-brilhante text-fundo flex items-center justify-center shadow-lg border border-fundo transition-all outline-none active:scale-95">
                            <i class="ph-fill ph-camera text-base"></i>
                        </button>

                        <div id="dropdown-foto" class="${menuFotoAberto ? 'flex' : 'hidden'} absolute top-full right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl flex-col p-2 shadow-2xl z-50 animate-[fadeIn_0.2s_ease-in-out]">
                            <button id="opt-ver-foto" class="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-left text-texto hover:bg-white/5 transition-colors outline-none">
                                <i class="ph ph-eye text-base text-ouro"></i> Visualizar Foto
                            </button>
                            
                            <input type="file" id="input-upload-foto" accept="image/png, image/jpeg, image/webp" class="hidden" />
                            
                            <button id="opt-importar-foto" class="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-left text-texto hover:bg-white/5 transition-colors outline-none">
                                <i class="ph ph-upload-simple text-base text-ouro"></i> Alterar Foto
                            </button>
                            
                            <button id="opt-remover-foto" class="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-left text-red-400 hover:bg-red-500/10 transition-colors outline-none">
                                <i class="ph ph-trash text-base"></i> Remover Foto
                            </button>
                        </div>
                    </div>

                    <h2 class="text-2xl font-bold text-texto text-center tracking-wide mb-1">${usuario.nome}</h2>
                    <span class="text-[11px] text-ouro-claro font-bold tracking-widest uppercase bg-ouro-escuro/30 px-4 py-1 rounded-full border border-ouro-escuro/40 mb-8">
                        Banda Atalaia
                    </span>

                    <div class="w-full border-t border-white/5 pt-6 mb-8">
                        <h3 class="text-xs font-bold text-texto/40 uppercase tracking-widest mb-4">Funções e Ministérios</h3>
                        <div class="grid grid-cols-2 gap-3">
                            ${funcoesDisponiveis.map(f => {
                                const possuiFuncao = usuario.funcoes.includes(f.nome);
                                if (!possuiFuncao) return ''; 
                                return `
                                    <div class="flex items-center gap-3 bg-white/[0.03] border border-white/5 p-3 rounded-xl shadow-inner">
                                        <div class="w-8 h-8 rounded-lg bg-ouro/10 flex items-center justify-center border border-ouro/20">
                                            <i class="${f.icone} text-base text-ouro"></i>
                                        </div>
                                        <span class="text-xs font-medium text-texto/80 tracking-wide">${f.nome}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <button id="btn-abrir-edicao" class="w-full bg-ouro hover:bg-ouro-brilhante text-fundo font-bold text-sm tracking-widest uppercase py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(242,183,5,0.2)] active:scale-[0.98] outline-none">
                        Editar Perfil
                    </button>

                </div>
            </div>
        `;
        configurarEventosPrincipais();
    }

    function exibirTelaEdicao() {
        app.innerHTML = `
            <div class="min-h-screen bg-fundo relative font-sans text-texto select-none overflow-x-hidden pt-24 pb-12 px-6 flex flex-col items-center">
                
                <div class="fixed top-[-10%] right-[-10%] w-96 h-96 bg-ouro rounded-full mix-blend-screen filter blur-[150px] opacity-15 pointer-events-none z-0"></div>

                <header class="fixed top-0 left-0 w-full z-50 bg-fundo/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    <button id="btn-cancelar-edicao" class="text-sm font-medium text-texto/50 hover:text-texto transition-colors outline-none">
                        Cancelar
                    </button>
                    <span class="text-sm font-bold text-ouro tracking-widest uppercase">Modo Edição</span>
                    <button id="btn-salvar-edicao" class="text-sm font-bold text-ouro hover:text-ouro-brilhante transition-colors outline-none">
                        Salvar
                    </button>
                </header>

                <div class="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] flex flex-col shadow-2xl relative z-10">
                    
                    <div class="flex flex-col gap-2 mb-5">
                        <label class="text-xs font-bold text-texto/40 uppercase tracking-widest">Nome do Usuário</label>
                        <div class="relative flex items-center">
                            <i class="ph ph-user absolute left-4 text-lg text-texto/40"></i>
                            <input type="text" id="input-nome" value="${usuario.nome}" class="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-texto focus:border-ouro/50 outline-none transition-all">
                        </div>
                    </div>

                    <div class="flex flex-col gap-2 mb-6">
                        <label class="text-xs font-bold text-texto/40 uppercase tracking-widest">Senha de Acesso</label>
                        <div class="relative flex items-center">
                            <i class="ph ph-lock absolute left-4 text-lg text-texto/40"></i>
                            <input type="password" id="input-senha" value="${usuario.senha}" class="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-texto focus:border-ouro/50 outline-none transition-all">
                        </div>
                    </div>

                    <div class="flex flex-col gap-2 border-t border-white/5 pt-5">
                        <label class="text-xs font-bold text-texto/40 uppercase tracking-widest mb-2">Gerenciar Funções</label>
                        <div class="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                            ${funcoesDisponiveis.map(f => {
                                const marcado = usuario.funcoes.includes(f.nome) ? 'checked' : '';
                                return `
                                    <label class="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                                <i class="${f.icone} text-base text-ouro-claro"></i>
                                            </div>
                                            <span class="text-xs font-medium text-texto">${f.nome}</span>
                                        </div>
                                        <input type="checkbox" value="${f.nome}" ${marcado} class="w-4 h-4 rounded accent-ouro cursor-pointer input-funcao-check">
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>

                </div>
            </div>
        `;
        configurarEventosEdicao();
    }

    function configurarEventosPrincipais() {
        document.getElementById('btn-voltar-inicio').addEventListener('click', () => {
            renderizarInicio();
        });

        const btnMenuFoto = document.getElementById('btn-menu-foto');
        const dropdownFoto = document.getElementById('dropdown-foto');
        const inputUploadFoto = document.getElementById('input-upload-foto');

        // Toggle do Menu Suspenso
        btnMenuFoto.addEventListener('click', (e) => {
            e.stopPropagation();
            menuFotoAberto = !menuFotoAberto;
            dropdownFoto.classList.toggle('hidden', !menuFotoAberto);
            dropdownFoto.classList.toggle('flex', menuFotoAberto);
        });

        document.addEventListener('click', () => {
            if (menuFotoAberto) {
                menuFotoAberto = false;
                dropdownFoto.classList.add('hidden');
                dropdownFoto.classList.remove('flex');
            }
        });

        document.getElementById('opt-ver-foto').addEventListener('click', () => {
            if(usuario.fotoUrl) {
                // Futuramente abrir em modal Full Screen. Por hora, Feedback simples.
                alert("Abrindo foto do perfil...");
            } else {
                alert("Nenhuma foto de perfil cadastrada.");
            }
        });

        // ==========================================
        // NOVO: LÓGICA DE IMPORTAÇÃO DE FOTO DO DISPOSITIVO
        // ==========================================
        
        // 1. O botão "Alterar Foto" dispara o clique no <input type="file"> oculto
        document.getElementById('opt-importar-foto').addEventListener('click', () => {
            inputUploadFoto.click();
        });

        // 2. Quando o usuário escolhe a foto na galeria do celular/PC
        inputUploadFoto.addEventListener('change', (e) => {
            const file = e.target.files[0];
            
            if (!file) return;

            // Validação de segurança UX (Limite de 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("A imagem selecionada é muito grande. O limite máximo é 5MB.");
                return;
            }

            // Exibe um loading na foto para UX fluida
            const overlay = document.getElementById('overlay-loading-foto');
            if(overlay) {
                overlay.classList.remove('hidden');
            }

            // Converte a imagem física em Base64 (DataURL) para preview imediato
            const reader = new FileReader();
            
            reader.onload = (eventoDeLeitura) => {
                // Guarda o arquivo original para o Supabase (Fase 4)
                usuario.arquivoFoto = file; 
                
                // Atualiza a UI imediatamente com o preview
                usuario.fotoUrl = eventoDeLeitura.target.result;
                
                // Simula um pequeno delay de processamento para UX
                setTimeout(() => {
                    exibirTelaPrincipal();
                }, 400); 
            };

            // Inicia a leitura do arquivo
            reader.readAsDataURL(file);
        });

        document.getElementById('opt-remover-foto').addEventListener('click', () => {
            if(confirm("Deseja realmente remover sua foto de perfil?")) {
                usuario.fotoUrl = "";
                usuario.arquivoFoto = null; // Limpa o cache de upload
                exibirTelaPrincipal();
            }
        });

        document.getElementById('btn-abrir-edicao').addEventListener('click', () => {
            modoEdicaoAberto = true;
            exibirTelaEdicao();
        });
    }

    function configurarEventosEdicao() {
        document.getElementById('btn-cancelar-edicao').addEventListener('click', () => {
            modoEdicaoAberto = false;
            exibirTelaPrincipal();
        });

        document.getElementById('btn-salvar-edicao').addEventListener('click', () => {
            const novoNome = document.getElementById('input-nome').value.trim();
            const novaSenha = document.getElementById('input-senha').value.trim();
            
            if(!novoNome) {
                alert("O nome de usuário não pode ficar em branco.");
                return;
            }

            const checkboxes = document.querySelectorAll('.input-funcao-check:checked');
            const novasFuncoes = Array.from(checkboxes).map(cb => cb.value);

            usuario.nome = novoNome;
            usuario.senha = novaSenha;
            usuario.funcoes = novasFuncoes;

            modoEdicaoAberto = false;
            exibirTelaPrincipal();
        });
    }

    if (!document.getElementById('estilos-perfil')) {
        const style = document.createElement('style');
        style.id = 'estilos-perfil';
        style.innerHTML = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
            }
            *, *::before, *::after {
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
                -webkit-user-drag: none !important;
            }
            input {
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                user-select: text !important;
            }
            button, a, i, div, label {
                -webkit-tap-highlight-color: transparent !important;
            }
            html, body, #app {
                touch-action: pan-x pan-y !important;
                -webkit-text-size-adjust: 100% !important;
            }
            ::-webkit-scrollbar {
                width: 4px;
            }
            ::-webkit-scrollbar-track {
                background: transparent;
            }
            ::-webkit-scrollbar-thumb {
                background: rgba(252, 183, 5, 0.2);
                border-radius: 99px;
            }
        `;
        document.head.appendChild(style);
    }

    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });

    let ultimoToque = 0;
    document.addEventListener('touchend', (e) => {
        const agora = new Date().getTime();
        if (agora - ultimoToque <= 300) e.preventDefault();
        ultimoToque = agora;
    }, { passive: false });

    exibirTelaPrincipal();
}
