// BANDA ATALAIA APP - Módulo Financeiro
// Arquitetura Reativa Vanilla JS com Tailwind CSS

// Banco de dados em memória (Simulando o Supabase para refletir as alterações em tempo real)
let estadoFinanceiro = {
    abaAtiva: 'lista', // 'lista', 'cadastro', 'relatorios'
    lancamentos: [
        { 
            id: 1, 
            tipo: 'entrada', 
            titulo: 'Oferta Coletiva Espontânea', 
            formaPagamento: 'Pix', 
            valor: 200.00, 
            data: '2026-06-15', 
            observacao: 'Oferta voluntária arrecadada no término do culto de domingo para o fundo de manutenção.', 
            anexo: 'comprovante_oferta.pdf',
            autorNome: 'Arthur Vasconcelos'
        },
        { 
            id: 2, 
            tipo: 'entrada', 
            titulo: 'Contribuição Mensal dos Membros', 
            formaPagamento: 'Dinheiro', 
            valor: 150.00, 
            data: '2026-06-10', 
            observacao: 'Caixinha mensal para manutenção de cordas, peles de bateria e lanches gerais do ensaio. Foram recolhidos os valores de 3 membros.', 
            anexo: null,
            autorNome: 'Sarah Bezerra'
        },
        { 
            id: 3, 
            tipo: 'saida', 
            titulo: 'Cabo XLR P/ Microfone Solo', 
            formaPagamento: 'Pix', 
            valor: 120.00, 
            data: '2026-06-04', 
            observacao: 'Substituição do cabo do microfone principal que estava apresentando ruído e mau contato durante a ministração.', 
            anexo: 'nota_fiscal_cabo.jpg',
            autorNome: 'David Lucas'
        },
        { 
            id: 4, 
            tipo: 'entrada', 
            titulo: 'Saldo Inicial Caixa', 
            formaPagamento: 'Transferência', 
            valor: 1020.00, 
            data: '2026-05-01', 
            observacao: 'Valor residual transferido da gestão do ano anterior.', 
            anexo: null,
            autorNome: 'Sistema'
        }
    ]
};

export function obterTemplateAba() {
    // Injeção de CSS específico da aba (para o text clamp da observação)
    if (!document.getElementById('estilos-financeiro')) {
        const style = document.createElement('style');
        style.id = 'estilos-financeiro';
        style.innerHTML = `
            @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fadeIn { animation: fadeIn 0.3s ease-in-out forwards; }
            .linha-clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        `;
        document.head.appendChild(style);
    }

    let saldoTotal = 0;
    let entradasMes = 0;
    let saidasMes = 0;

    const hoje = new Date();
    const anoMesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

    estadoFinanceiro.lancamentos.forEach(l => {
        if (l.tipo === 'entrada') {
            saldoTotal += l.valor;
            if (l.data.startsWith(anoMesAtual) || l.data.includes('Junho')) {
                entradasMes += l.valor;
            }
        } else {
            saldoTotal -= l.valor;
            if (l.data.startsWith(anoMesAtual) || l.data.includes('Junho')) {
                saidasMes += l.valor;
            }
        }
    });

    if (estadoFinanceiro.abaAtiva === 'cadastro') {
        return obterTemplateCadastro();
    } else if (estadoFinanceiro.abaAtiva === 'relatorios') {
        return obterTemplateRelatorios();
    }

    return obterTemplateLista(saldoTotal, entradasMes, saidasMes);
}

// Template da listagem principal com Glassmorphism e layout responsivo
function obterTemplateLista(saldoTotal, entradasMes, saidasMes) {
    return `
        <div id="modulo-financeiro" class="w-full max-w-xl flex flex-col gap-4 animate-fadeIn h-full relative">
            <div class="bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 p-6 rounded-[2rem] flex flex-col items-center shadow-xl relative overflow-hidden backdrop-blur-md">
                <span class="text-xs text-texto/40 font-bold uppercase tracking-widest mb-1">Caixa Interno da Banda</span>
                <span class="text-3xl font-extrabold text-ouro tracking-tight">R$ ${saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <div class="w-full border-t border-white/5 mt-4 pt-4 flex justify-between text-center">
                    <div class="flex-1 border-r border-white/5">
                        <span class="text-[10px] text-green-400 font-bold block uppercase tracking-wider">Entradas (Mês)</span>
                        <span class="text-sm font-semibold text-texto/90">+ R$ ${entradasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div class="flex-1">
                        <span class="text-[10px] text-red-400 font-bold block uppercase tracking-wider">Saídas (Mês)</span>
                        <span class="text-sm font-semibold text-texto/90">- R$ ${saidasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-md">
                <div class="flex items-center justify-between px-1">
                    <span class="text-xs text-ouro-claro font-bold uppercase tracking-wider flex items-center gap-2">
                        <i class="ph-fill ph-file-pdf text-base"></i> Transparência
                    </span>
                </div>
                <button id="btn-abrir-relatorios" class="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-texto text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] outline-none">
                    <i class="ph ph-printer text-ouro font-bold text-lg"></i> Central de Relatórios Oficiais
                </button>
            </div>

            <span class="text-xs text-texto/40 font-bold uppercase tracking-widest px-1 mt-1">Movimentações Recentes</span>
            <div class="flex flex-col gap-3 pb-36">
                ${estadoFinanceiro.lancamentos.map(l => {
                    const isEntrada = l.tipo === 'entrada';
                    const corIcone = isEntrada ? 'text-green-400' : 'text-red-400';
                    const bgIcone = isEntrada ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20';
                    const sinal = isEntrada ? '+' : '-';
                    const icone = isEntrada ? 'ph ph-arrow-up-right' : 'ph ph-arrow-down-left';
                    const partesData = l.data.split('-');
                    const dataFormatada = partesData.length === 3 ? `${partesData[2]} de ${obterNomeMes(partesData[1])}` : l.data;
                    const observacaoLonga = l.observacao && l.observacao.length > 65;

                    return `
                        <div class="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 backdrop-blur-sm hover:bg-white/[0.07] transition-all">
                            <div class="flex items-start justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl ${bgIcone} border flex items-center justify-center ${corIcone} shrink-0 shadow-inner">
                                        <i class="${icone} font-bold text-lg"></i>
                                    </div>
                                    <div class="flex flex-col">
                                        <h4 class="text-sm font-bold text-texto leading-tight">${l.titulo}</h4>
                                        <div class="flex items-center gap-2 mt-1 flex-wrap">
                                            <span class="text-[10px] text-texto/40 flex items-center gap-1"><i class="ph ph-calendar"></i> ${dataFormatada}</span>
                                            <span class="text-[9px] bg-white/5 text-ouro border border-white/10 px-1.5 py-0.5 rounded font-medium">${l.formaPagamento}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="text-right shrink-0">
                                    <span class="text-sm font-extrabold ${corIcone}">${sinal} R$ ${l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            
                            ${l.observacao ? `
                                <div class="mt-2 pt-2 border-t border-white/5">
                                    <p class="text-xs text-texto/70 leading-relaxed ${observacaoLonga ? 'linha-clamp' : ''}" id="obs-${l.id}">
                                        ${l.observacao}
                                    </p>
                                    ${observacaoLonga ? `
                                        <button class="btn-toggle-obs text-ouro hover:text-ouro-brilhante text-[10px] font-bold text-left mt-1 w-max transition-colors outline-none" data-target="obs-${l.id}">
                                            Ver detalhes...
                                        </button>
                                    ` : ''}
                                </div>
                            ` : ''}

                            <div class="mt-2 flex items-center justify-between border-t border-white/5 pt-2">
                                <span class="text-[9px] text-texto/40 font-medium flex items-center gap-1"><i class="ph ph-user"></i> Lançado por: <span class="text-texto/60">${l.autorNome}</span></span>
                                ${l.anexo ? `
                                    <a href="#" download="${l.anexo}" class="text-[9px] font-bold text-ouro hover:text-ouro-brilhante flex items-center gap-1 outline-none transition-colors" title="${l.anexo}">
                                        <i class="ph ph-download-simple text-sm"></i> Baixar Anexo
                                    </a>
                                ` : '<span class="text-[9px] text-texto/30"><i class="ph ph-prohibit-inset"></i> Sem anexo</span>'}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <button id="btn-novo-lancamento" class="fixed bottom-28 right-6 w-14 h-14 bg-ouro hover:bg-ouro-brilhante text-fundo rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(242,183,5,0.4)] hover:scale-105 active:scale-95 transition-transform outline-none z-50">
                <i class="ph ph-plus text-2xl font-bold"></i>
            </button>
        </div>
    `;
}

// Template padronizado do Formulário (Igual ao de Avisos e Repertório)
function obterTemplateCadastro() {
    return `
        <div id="modulo-financeiro" class="w-full max-w-xl flex flex-col gap-4 animate-fadeIn w-full pb-10">
            <div class="flex items-center gap-4 mb-2">
                <button id="btn-cancelar-cadastro" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-texto transition-all outline-none">
                    <i class="ph ph-arrow-left text-xl"></i>
                </button>
                <h2 class="text-lg font-bold tracking-wide text-ouro">Novo Lançamento</h2>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col gap-4 backdrop-blur-md shadow-2xl">
                
                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Fluxo de Caixa *</label>
                    <select id="fin-tipo" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all cursor-pointer">
                        <option value="entrada">Entrada (Receita / Oferta / Doação)</option>
                        <option value="saida">Saída (Despesa / Compra / Pagamento)</option>
                    </select>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Título / Identificação *</label>
                    <input type="text" id="fin-titulo" placeholder="Ex: Manutenção da Caixa de Retorno" required class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all" />
                </div>

                <div class="flex gap-4">
                    <div class="flex flex-col gap-1.5 flex-[1.2]">
                        <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Valor (R$) *</label>
                        <div class="relative flex items-center">
                            <span class="absolute left-4 text-texto/40 text-sm">R$</span>
                            <input type="number" id="fin-valor" step="0.01" min="0.01" placeholder="0.00" required class="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-1.5 flex-[1]">
                        <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Data *</label>
                        <input type="date" id="fin-data" required class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-3 text-sm text-texto focus:outline-none focus:border-ouro transition-all css-color-scheme-dark" style="color-scheme: dark;" />
                    </div>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Forma de Pagamento *</label>
                    <select id="fin-forma" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all cursor-pointer">
                        <option value="Pix">Pix</option>
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Cartão de Débito">Cartão de Débito</option>
                        <option value="Transferência">Transferência Bancária</option>
                    </select>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Observação (Opcional)</label>
                    <textarea id="fin-obs" rows="3" placeholder="Insira detalhes adicionais sobre esta movimentação..." class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all resize-none"></textarea>
                </div>

                <div class="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Comprovante / Nota Fiscal</label>
                    <label class="w-full bg-black/40 hover:bg-black/60 border border-white/10 hover:border-ouro/50 border-dashed rounded-xl py-4 px-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
                        <div class="w-10 h-10 rounded-full bg-white/5 group-hover:bg-ouro/10 flex items-center justify-center transition-all">
                            <i class="ph ph-upload-simple text-xl text-texto/50 group-hover:text-ouro"></i>
                        </div>
                        <span class="text-xs text-texto/50 group-hover:text-texto/80" id="label-nome-anexo">Toque para anexar arquivo</span>
                        <input type="file" id="fin-anexo" accept=".pdf,image/*" class="hidden" />
                    </label>
                </div>

                <button id="btn-salvar-lancamento" class="w-full mt-4 bg-gradient-to-r from-ouro-escuro via-ouro to-ouro-claro hover:from-ouro hover:to-ouro-brilhante text-fundo font-bold text-sm tracking-widest uppercase py-4 rounded-xl shadow-[0_4px_20px_rgba(242,183,5,0.25)] transition-all active:scale-[0.98] outline-none">
                    Confirmar Lançamento
                </button>
            </div>
        </div>
    `;
}

// Template da Central de Relatórios
function obterTemplateRelatorios() {
    return `
        <div id="modulo-financeiro" class="w-full max-w-xl flex flex-col gap-4 animate-fadeIn w-full pb-10">
            <div class="flex items-center gap-4 mb-2">
                <button id="btn-voltar-relatorios" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-texto transition-all outline-none">
                    <i class="ph ph-arrow-left text-xl"></i>
                </button>
                <div class="flex flex-col">
                    <h2 class="text-lg font-bold tracking-wide text-ouro leading-tight">Central de Relatórios</h2>
                    <span class="text-[10px] text-texto/40 font-bold uppercase tracking-widest">Emissão de PDF</span>
                </div>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col gap-5 backdrop-blur-md shadow-2xl">
                
                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Tipo de Relatório *</label>
                    <select id="rel-tipo" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all cursor-pointer">
                        <option value="transparencia">Prestação de Contas (Transparência)</option>
                        <option value="geral">Balanço Geral Completo</option>
                        <option value="entradas">Apenas Entradas (Receitas)</option>
                        <option value="saidas">Apenas Saídas (Despesas)</option>
                    </select>
                </div>

                <div class="flex gap-4">
                    <div class="flex flex-col gap-1.5 flex-1">
                        <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Data Início</label>
                        <input type="date" id="rel-data-inicio" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-3 text-sm text-texto focus:outline-none focus:border-ouro transition-all css-color-scheme-dark" style="color-scheme: dark;" />
                    </div>
                    <div class="flex flex-col gap-1.5 flex-1">
                        <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Data Fim</label>
                        <input type="date" id="rel-data-fim" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-3 text-sm text-texto focus:outline-none focus:border-ouro transition-all css-color-scheme-dark" style="color-scheme: dark;" />
                    </div>
                </div>
                <p class="text-[9px] text-texto/40 italic pl-1 -mt-3">* Deixe as datas em branco para emitir de todo o período.</p>

                <div class="flex flex-col gap-1.5 border-t border-white/5 pt-4">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Filtrar Forma de Pagamento</label>
                    <select id="rel-forma" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all cursor-pointer">
                        <option value="todos">Todas as Formas</option>
                        <option value="Pix">Apenas Pix</option>
                        <option value="Dinheiro">Apenas Dinheiro</option>
                        <option value="Cartão de Crédito">Apenas Cartão de Crédito</option>
                        <option value="Cartão de Débito">Apenas Cartão de Débito</option>
                        <option value="Transferência">Apenas Transferência Bancária</option>
                    </select>
                </div>

                <button id="btn-gerar-pdf" class="w-full mt-4 bg-white/5 border border-white/10 hover:bg-ouro hover:border-ouro hover:text-fundo text-ouro font-bold text-sm tracking-widest uppercase py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] outline-none flex items-center justify-center gap-2">
                    <i class="ph-fill ph-file-pdf text-xl"></i> Gerar e Baixar PDF
                </button>
            </div>
        </div>
    `;
}

// =========================================================================
// SISTEMA AUTOMÁTICO DE ESCUTA DE EVENTOS (DELEGAÇÃO GLOBAL VANILLA JS)
// =========================================================================
if (!window.financeiroListenersInjetados) {
    window.financeiroListenersInjetados = true;

    document.addEventListener('click', function (e) {
        // Navegação
        if (e.target.closest('#btn-novo-lancamento')) {
            estadoFinanceiro.abaAtiva = 'cadastro';
            forcarAtualizacaoInterface();
            return;
        }

        if (e.target.closest('#btn-cancelar-cadastro') || e.target.closest('#btn-voltar-relatorios')) {
            estadoFinanceiro.abaAtiva = 'lista';
            forcarAtualizacaoInterface();
            return;
        }

        if (e.target.closest('#btn-abrir-relatorios')) {
            estadoFinanceiro.abaAtiva = 'relatorios';
            forcarAtualizacaoInterface();
            return;
        }

        // Expandir/Retrair Observações da Lista
        const btnToggleObs = e.target.closest('.btn-toggle-obs');
        if (btnToggleObs) {
            const targetId = btnToggleObs.getAttribute('data-target');
            const p = document.getElementById(targetId);
            if (p) {
                p.classList.toggle('linha-clamp');
                btnToggleObs.innerText = p.classList.contains('linha-clamp') ? 'Ver detalhes...' : 'Ocultar detalhes';
            }
            return;
        }

        // Salvar Novo Lançamento
        if (e.target.closest('#btn-salvar-lancamento')) {
            const tipo = document.getElementById('fin-tipo').value;
            const titulo = document.getElementById('fin-titulo').value.trim();
            const valorStr = document.getElementById('fin-valor').value;
            const valor = parseFloat(valorStr);
            const data = document.getElementById('fin-data').value;
            const formaPagamento = document.getElementById('fin-forma').value;
            const observacao = document.getElementById('fin-obs').value.trim();
            const fileInput = document.getElementById('fin-anexo');

            if (!titulo || isNaN(valor) || !data) {
                alert("Por favor, preencha todos os campos obrigatórios (*)");
                return;
            }

            let anexoNome = null;
            if (fileInput && fileInput.files && fileInput.files[0]) {
                anexoNome = fileInput.files[0].name;
            }

            const novoLancamento = {
                id: Date.now(),
                tipo,
                titulo,
                formaPagamento,
                valor,
                data,
                observacao,
                anexo: anexoNome,
                autorNome: 'Membro Atalaia' // Idealmente buscaria do usuário logado via Supabase
            };

            estadoFinanceiro.lancamentos.unshift(novoLancamento);
            estadoFinanceiro.abaAtiva = 'lista';
            forcarAtualizacaoInterface();
            return;
        }

        // Gerar Relatório Dinâmico PDF
        if (e.target.closest('#btn-gerar-pdf')) {
            const config = {
                tipo: document.getElementById('rel-tipo').value,
                dataInicio: document.getElementById('rel-data-inicio').value,
                dataFim: document.getElementById('rel-data-fim').value,
                forma: document.getElementById('rel-forma').value
            };
            gerarRelatorioPdfProfissional(config);
            return;
        }
    });

    // Alteração do input de arquivos no formulário
    document.addEventListener('change', function (e) {
        const fileInput = e.target.closest('#fin-anexo');
        if (fileInput) {
            const label = document.getElementById('label-nome-anexo');
            if (label && fileInput.files && fileInput.files[0]) {
                label.innerText = fileInput.files[0].name;
                label.classList.replace('text-texto/50', 'text-ouro-claro');
                label.classList.add('font-bold');
            } else if (label) {
                label.innerText = 'Toque para anexar arquivo';
                label.classList.replace('text-ouro-claro', 'text-texto/50');
                label.classList.remove('font-bold');
            }
        }
    });
}

function forcarAtualizacaoInterface() {
    const container = document.getElementById('modulo-financeiro');
    if (container) {
        container.outerHTML = obterTemplateAba();
    }
}

function obterNomeMes(numStr) {
    const meses = {
        '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
        '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
        '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
    };
    return meses[numStr] || '';
}

// =========================================================================
// GERADOR DINÂMICO DE RELATÓRIOS PDF
// =========================================================================
function gerarRelatorioPdfProfissional(config) {
    const hoje = new Date();
    
    // FILTRAGEM DE DADOS BASEADA NA CONFIGURAÇÃO DA CENTRAL
    let filtrados = [...estadoFinanceiro.lancamentos];

    // Filtro por Tipo Principal
    if (config.tipo === 'entradas') filtrados = filtrados.filter(l => l.tipo === 'entrada');
    if (config.tipo === 'saidas') filtrados = filtrados.filter(l => l.tipo === 'saida');
    
    // Filtro por Data
    if (config.dataInicio) filtrados = filtrados.filter(l => new Date(l.data) >= new Date(config.dataInicio));
    if (config.dataFim) filtrados = filtrados.filter(l => new Date(l.data) <= new Date(config.dataFim));

    // Filtro por Forma de Pagamento
    if (config.forma !== 'todos') filtrados = filtrados.filter(l => l.formaPagamento === config.forma);

    // Ordenação Cronológica Estrita (Do mais antigo para o mais novo no relatório)
    filtrados.sort((a, b) => new Date(a.data) - new Date(b.data));

    // Cálculos
    let totalEntradas = 0;
    let totalSaidas = 0;
    filtrados.forEach(l => {
        if (l.tipo === 'entrada') totalEntradas += l.valor;
        else totalSaidas += l.valor;
    });
    let saldoPeriodo = totalEntradas - totalSaidas;

    // Definição de Título Baseado no Filtro
    let subTitulo = "Balanço Patrimonial Geral";
    if (config.tipo === 'transparencia') subTitulo = "Relatório de Prestação de Contas (Transparência)";
    else if (config.tipo === 'entradas') subTitulo = "Relatório Exclusivo de Receitas (Entradas)";
    else if (config.tipo === 'saidas') subTitulo = "Relatório Exclusivo de Despesas (Saídas)";

    let periodoText = "Período: Todo o Histórico";
    if (config.dataInicio || config.dataFim) {
        const dI = config.dataInicio ? new Date(config.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR') : 'Início';
        const dF = config.dataFim ? new Date(config.dataFim + 'T12:00:00').toLocaleDateString('pt-BR') : 'Hoje';
        periodoText = `Período: ${dI} a ${dF}`;
    }

    const dataImpressao = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Construção do Documento (Usando paleta #0D0D0D, #111, #333 e acentos em #F2B705)
    const win = window.open('', '_blank');
    win.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório Financeiro - Banda Atalaia</title>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; padding: 0; font-size: 12px; line-height: 1.5; background-color: #fff; }
                
                /* Cabeçalho Oficial */
                .header-main { border-bottom: 3px solid #F2B705; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
                .church-info h1 { margin: 0; font-size: 16px; font-weight: 800; text-transform: uppercase; color: #0D0D0D; letter-spacing: 0.5px; }
                .church-info p { margin: 3px 0 0 0; font-size: 11px; color: #555; }
                .report-meta { text-align: right; }
                .report-meta h2 { margin: 0; font-size: 14px; color: #0D0D0D; font-weight: bold; text-transform: uppercase; }
                .report-meta p { margin: 4px 0 0 0; font-size: 11px; color: #666; }
                
                /* Cartões de Resumo */
                .cards-summary { display: flex; width: 100%; gap: 15px; margin-bottom: 30px; }
                .card-box { flex: 1; border: 1px solid #eee; background-color: #fafafa; border-radius: 8px; padding: 15px; text-align: center; border-top: 3px solid #0D0D0D; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
                .card-box.sld { border-top-color: #F2B705; }
                .card-box.ent { border-top-color: #2e7d32; }
                .card-box.sdi { border-top-color: #c62828; }
                .card-box .lbl { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #777; margin-bottom: 5px; }
                .card-box .val { font-size: 18px; font-weight: 800; color: #0D0D0D; }
                .card-box.ent .val { color: #2e7d32; }
                .card-box.sdi .val { color: #c62828; }
                
                /* Tabela de Lançamentos */
                .table-title { font-size: 12px; text-transform: uppercase; color: #0D0D0D; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                th { background-color: #0D0D0D; color: #F2B705; text-align: left; padding: 10px 12px; font-weight: bold; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; border-bottom: 2px solid #F2B705; }
                td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 11px; vertical-align: top; color: #333; }
                tr:nth-child(even) td { background-color: #fcfcfc; }
                
                .badge-type { display: inline-block; padding: 3px 6px; font-size: 9px; font-weight: bold; border-radius: 4px; text-transform: uppercase; }
                .badge-type.in { background-color: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
                .badge-type.out { background-color: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
                
                .item-title { font-weight: bold; color: #0D0D0D; font-size: 12px; display: block; margin-bottom: 3px; }
                .item-obs { font-size: 10px; color: #666; font-style: italic; line-height: 1.4; margin-bottom: 3px; }
                .item-meta { font-size: 9px; color: #888; margin-top: 4px; }
                
                /* Assinaturas */
                .signatures-area { display: flex; justify-content: space-around; margin-top: 70px; page-break-inside: avoid; }
                .sig-block { border-top: 1px solid #0D0D0D; width: 250px; text-align: center; padding-top: 8px; }
                .sig-block strong { font-size: 12px; color: #0D0D0D; display: block; }
                .sig-block span { font-size: 10px; color: #666; }
                
                /* Rodapé */
                .footer-report { text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 15px; position: fixed; bottom: 20px; left: 40px; right: 40px; }
                
                @media print {
                    body { margin: 20px; }
                    .footer-report { position: fixed; bottom: 10px; }
                    .card-box { border: 1px solid #ccc; }
                    th { background-color: #f2f2f2 !important; color: #000 !important; border-bottom: 2px solid #000; }
                }
            </style>
        </head>
        <body>
            <div class="header-main">
                <div class="church-info">
                    <h1>Igreja Evangélica Pentecostal Atalaia Cristã</h1>
                    <p>Rua Antônio Alves Corrêa, 17, São Pedro</p>
                    <p>Ministério de Louvor - Banda Atalaia</p>
                </div>
                <div class="report-meta">
                    <h2>${subTitulo}</h2>
                    <p>${periodoText}</p>
                    <p>Emissão: ${dataImpressao}</p>
                </div>
            </div>

            <div class="cards-summary">
                <div class="card-box sld">
                    <div class="lbl">Saldo Líquido no Período</div>
                    <div class="val">R$ ${saldoPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div class="card-box ent">
                    <div class="lbl">Total Arrecadado</div>
                    <div class="val">+ R$ ${totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div class="card-box sdi">
                    <div class="lbl">Total de Despesas</div>
                    <div class="val">- R$ ${totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
            </div>

            <div class="table-title">Detalhamento das Movimentações</div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 12%;">Data</th>
                        <th style="width: 45%;">Descrição / Histórico</th>
                        <th style="width: 13%;">Classificação</th>
                        <th style="width: 15%;">Pagamento</th>
                        <th style="width: 15%; text-align: right;">Valor (R$)</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtrados.length > 0 ? filtrados.map(l => {
                        const dt = l.data.split('-');
                        const dataExibivel = dt.length === 3 ? `${dt[2]}/${dt[1]}/${dt[0]}` : l.data;
                        return `
                            <tr>
                                <td>${dataExibivel}</td>
                                <td>
                                    <span class="item-title">${l.titulo}</span>
                                    ${l.observacao ? `<div class="item-obs">${l.observacao}</div>` : ''}
                                    <div class="item-meta">
                                        Lançado por: ${l.autorNome} ${l.anexo ? `| Doc: ${l.anexo}` : ''}
                                    </div>
                                </td>
                                <td><span class="badge-type ${l.tipo === 'entrada' ? 'in' : 'out'}">${l.tipo === 'entrada' ? 'Entrada' : 'Saída'}</span></td>
                                <td>${l.formaPagamento}</td>
                                <td style="text-align: right; font-weight: bold; color: ${l.tipo === 'entrada' ? '#2e7d32' : '#c62828'}; font-size: 12px;">
                                    ${l.tipo === 'entrada' ? '+' : '-'} ${l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        `;
                    }).join('') : `<tr><td colspan="5" style="text-align:center; padding:20px; color:#999;">Nenhuma movimentação encontrada para os filtros selecionados.</td></tr>`}
                </tbody>
            </table>

            <div class="signatures-area">
                <div class="sig-block">
                    <strong>Liderança / Tesouraria</strong>
                    <span>Assinatura do Responsável</span>
                </div>
                <div class="sig-block">
                    <strong>Parecer do Conselho / Pastor</strong>
                    <span>Conferência e Aprovação</span>
                </div>
            </div>

            <div class="footer-report">
                Relatório Oficial - Documento gerado automaticamente pelo Sistema Banda Atalaia App.
            </div>

            <script>
                window.onload = function() {
                    // Aciona a caixa de diálogo de impressão nativa do navegador (Permite Salvar como PDF)
                    setTimeout(function() { window.print(); }, 300);
                };
            <\/script>
        </body>
        </html>
    `);
    win.document.close();
}
