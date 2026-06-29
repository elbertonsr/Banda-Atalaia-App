// BANDA ATALAIA APP - Módulo Financeiro
// Arquitetura Reativa Vanilla JS com Tailwind CSS

import { obterUsuarioAtual, obterPerfilMembro } from '../supabase.js';

// Banco de dados em memória (Simulando o Supabase para refletir as alterações em tempo real)
let estadoFinanceiro = {
    abaAtiva: 'lista', // 'lista', 'cadastro', 'edicao', 'detalhes', 'relatorios'
    lancamentoSelecionadoId: null,
    usuarioAtual: null,
    lancamentos: [
        { 
            id: 1, 
            tipo: 'entrada', 
            titulo: 'Oferta Coletiva Espontânea', 
            formaPagamento: 'Pix', 
            valor: 200.00, 
            data: '2026-06-15', 
            observacao: 'Oferta voluntária arrecadada no término do culto de domingo para o fundo de manutenção.', 
            anexo: { nome: 'comprovante_oferta.pdf', url: '#', tipo: 'application/pdf' },
            autorId: 'sistema',
            autorNome: 'Arthur Vasconcelos',
            dataCriacao: new Date(Date.now() - 5 * 86400000).toISOString() // 5 dias atrás
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
            autorId: 'sistema',
            autorNome: 'Sarah Bezerra',
            dataCriacao: new Date(Date.now() - 10 * 86400000).toISOString()
        },
        { 
            id: 3, 
            tipo: 'saida', 
            titulo: 'Cabo XLR P/ Microfone Solo', 
            formaPagamento: 'Pix', 
            valor: 120.00, 
            data: '2026-06-04', 
            observacao: 'Substituição do cabo do microfone principal que estava apresentando ruído e mau contato durante a ministração do último domingo.', 
            anexo: { nome: 'nota_fiscal_cabo.jpg', url: '#', tipo: 'image/jpeg' },
            autorId: 'sistema',
            autorNome: 'David Lucas',
            dataCriacao: new Date(Date.now() - 15 * 86400000).toISOString()
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
            autorId: 'sistema',
            autorNome: 'Sistema',
            dataCriacao: new Date('2026-05-01T12:00:00Z').toISOString()
        }
    ]
};

export function obterTemplateAba() {
    return `<div id="raiz-financeiro" class="w-full h-full flex flex-col items-center relative pb-24"></div>`;
}

export async function inicializarEventosAba() {
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

    // Carregar dados do usuário logado para controle de permissões e auditoria
    const userAuth = await obterUsuarioAtual();
    if (userAuth) {
        const { perfil } = await obterPerfilMembro(userAuth.id);
        estadoFinanceiro.usuarioAtual = {
            id: userAuth.id,
            nome: perfil ? perfil.nome : 'Membro Atalaia'
        };
    } else {
        estadoFinanceiro.usuarioAtual = { id: 'anon', nome: 'Visitante' };
    }

    renderizarInterface();
}

// Motor de Renderização Reativo
function renderizarInterface() {
    const raiz = document.getElementById('raiz-financeiro');
    if (!raiz) return;

    switch (estadoFinanceiro.abaAtiva) {
        case 'cadastro':
            raiz.innerHTML = obterTemplateFormulario(false);
            configurarEventosFormulario(false);
            break;
        case 'edicao':
            raiz.innerHTML = obterTemplateFormulario(true);
            configurarEventosFormulario(true);
            break;
        case 'detalhes':
            raiz.innerHTML = obterTemplateDetalhes();
            configurarEventosDetalhes();
            break;
        case 'relatorios':
            raiz.innerHTML = obterTemplateRelatorios();
            configurarEventosRelatorios();
            break;
        default:
            raiz.innerHTML = obterTemplateLista();
            configurarEventosLista();
            break;
    }
}

function obterIconeArquivo(mimeType) {
    if (!mimeType) return 'ph-file';
    if (mimeType.includes('image')) return 'ph-image';
    if (mimeType.includes('pdf')) return 'ph-file-pdf';
    return 'ph-file-text';
}

// ==========================================
// RENDERIZAÇÕES DE TELA
// ==========================================

function obterTemplateLista() {
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

    // Ordenar do mais recente para o mais antigo (pela data de criação)
    const ordenados = [...estadoFinanceiro.lancamentos].sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));

    return `
        <div class="w-full max-w-xl flex flex-col gap-4 animate-fadeIn h-full relative">
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
                ${ordenados.map(l => {
                    const isEntrada = l.tipo === 'entrada';
                    const corIcone = isEntrada ? 'text-green-400' : 'text-red-400';
                    const bgIcone = isEntrada ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20';
                    const sinal = isEntrada ? '+' : '-';
                    const icone = isEntrada ? 'ph ph-arrow-up-right' : 'ph ph-arrow-down-left';
                    const partesData = l.data.split('-');
                    const dataReferente = partesData.length === 3 ? `${partesData[2]} de ${obterNomeMes(partesData[1])}` : l.data;
                    
                    const observacaoLonga = l.observacao && l.observacao.length > 100;
                    
                    const dataPub = new Date(l.dataCriacao);
                    const dataFormatada = dataPub.toLocaleDateString('pt-BR') + ' às ' + dataPub.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

                    return `
                        <div class="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 backdrop-blur-sm hover:bg-white/[0.07] transition-all relative">
                            <div class="flex items-start justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl ${bgIcone} border flex items-center justify-center ${corIcone} shrink-0 shadow-inner">
                                        <i class="${icone} font-bold text-lg"></i>
                                    </div>
                                    <div class="flex flex-col">
                                        <h4 class="text-sm font-bold text-texto leading-tight">${l.titulo}</h4>
                                        <div class="flex items-center gap-2 mt-1 flex-wrap">
                                            <span class="text-[10px] text-texto/40 flex items-center gap-1"><i class="ph ph-calendar"></i> Ref: ${dataReferente}</span>
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
                                    <p class="text-xs text-texto/70 leading-relaxed ${observacaoLonga ? 'linha-clamp' : ''}">
                                        ${l.observacao}
                                    </p>
                                    ${observacaoLonga ? `
                                        <button data-id-detalhes="${l.id}" class="text-ouro hover:text-ouro-brilhante text-xs font-bold text-left mt-1 w-max transition-colors outline-none z-10 relative">
                                            Ver detalhes...
                                        </button>
                                    ` : ''}
                                </div>
                            ` : ''}

                            <div class="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                                <span class="text-[9px] text-texto/40">Por: <span class="text-texto/60 font-medium">${l.autorNome}</span></span>
                                <span class="text-[9px] text-texto/30">${dataFormatada}</span>
                            </div>

                            ${!observacaoLonga ? `
                                <button data-id-detalhes="${l.id}" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer outline-none"></button>
                            ` : ''}
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

function obterTemplateDetalhes() {
    const lancamento = estadoFinanceiro.lancamentos.find(l => l.id === estadoFinanceiro.lancamentoSelecionadoId);
    if (!lancamento) return `<p class="text-center text-texto/50 py-10">Lançamento não encontrado.</p>`;

    const isEntrada = lancamento.tipo === 'entrada';
    const corClass = isEntrada ? 'text-green-400' : 'text-red-400';
    const bgClass = isEntrada ? 'bg-green-500/10' : 'bg-red-500/10';
    const borderClass = isEntrada ? 'border-green-500/20' : 'border-red-500/20';
    const iconeSinal = isEntrada ? 'ph-arrow-up-right' : 'ph-arrow-down-left';

    const isAutor = lancamento.autorId === estadoFinanceiro.usuarioAtual?.id;
    const dataCriacao = new Date(lancamento.dataCriacao).toLocaleString('pt-BR');
    const partesDataRef = lancamento.data.split('-');
    const dataRefFormatada = partesDataRef.length === 3 ? `${partesDataRef[2]}/${partesDataRef[1]}/${partesDataRef[0]}` : lancamento.data;

    return `
        <div class="w-full max-w-xl flex flex-col gap-4 animate-fadeIn pb-12">
            <div class="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                <div class="flex items-center gap-3">
                    <button id="btn-voltar-detalhes" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-texto outline-none">
                        <i class="ph ph-arrow-left text-xl"></i>
                    </button>
                    <div class="flex flex-col">
                        <span class="text-[10px] ${corClass} font-bold uppercase tracking-widest"><i class="ph ${iconeSinal}"></i> Lançamento de ${isEntrada ? 'Entrada' : 'Saída'}</span>
                        <h2 class="text-base font-bold text-texto leading-tight mt-0.5">Detalhes Financeiros</h2>
                    </div>
                </div>
                
                ${isAutor ? `
                <div class="flex gap-2">
                    <button id="btn-editar-lancamento" class="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-ouro hover:bg-white/10 transition-colors outline-none" title="Editar">
                        <i class="ph ph-pencil-simple text-lg"></i>
                    </button>
                    <button id="btn-deletar-lancamento" class="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors outline-none" title="Excluir">
                        <i class="ph ph-trash text-lg"></i>
                    </button>
                </div>
                ` : ''}
            </div>

            <div class="${bgClass} border ${borderClass} rounded-[2rem] p-6 backdrop-blur-md shadow-xl flex flex-col gap-4">
                
                <div class="flex flex-col items-center justify-center text-center gap-1 mb-2">
                    <h1 class="text-lg font-bold text-texto">${lancamento.titulo}</h1>
                    <span class="text-3xl font-extrabold ${corClass} tracking-tight">${isEntrada ? '+' : '-'} R$ ${lancamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>

                <div class="w-full h-px bg-white/10"></div>

                <div class="grid grid-cols-2 gap-3 mt-2">
                    <div class="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                        <div class="w-8 h-8 rounded-lg bg-ouro/10 text-ouro flex items-center justify-center"><i class="ph-fill ph-wallet"></i></div>
                        <div class="flex flex-col">
                            <span class="text-[9px] text-texto/40 font-bold uppercase tracking-widest">Pagamento</span>
                            <span class="text-xs font-semibold text-texto">${lancamento.formaPagamento}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                        <div class="w-8 h-8 rounded-lg bg-ouro/10 text-ouro flex items-center justify-center"><i class="ph-fill ph-calendar-blank"></i></div>
                        <div class="flex flex-col">
                            <span class="text-[9px] text-texto/40 font-bold uppercase tracking-widest">Referente a</span>
                            <span class="text-xs font-semibold text-texto">${dataRefFormatada}</span>
                        </div>
                    </div>
                </div>

                ${lancamento.observacao ? `
                    <div class="mt-2">
                        <span class="text-[10px] text-texto/40 font-bold uppercase tracking-widest block mb-1">Observações Históricas</span>
                        <p class="text-sm text-texto/90 leading-relaxed whitespace-pre-line font-sans p-4 bg-black/20 rounded-xl border border-white/5">
                            ${lancamento.observacao}
                        </p>
                    </div>
                ` : ''}

                ${lancamento.anexo ? `
                    <div class="mt-2 pt-4 border-t border-white/5">
                        <span class="text-[10px] text-texto/40 font-bold uppercase tracking-widest block mb-2">Comprovante / Nota Fiscal</span>
                        <a href="${lancamento.anexo.url}" download="${lancamento.anexo.nome}" target="_blank" class="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-xl hover:bg-white/5 hover:border-ouro/30 transition-all outline-none">
                            <div class="flex items-center gap-3 overflow-hidden">
                                <div class="w-10 h-10 rounded-lg bg-ouro/10 text-ouro flex items-center justify-center shrink-0">
                                    <i class="ph-fill ${obterIconeArquivo(lancamento.anexo.tipo)} text-xl"></i>
                                </div>
                                <div class="flex flex-col overflow-hidden">
                                    <span class="text-xs font-semibold text-texto truncate">${lancamento.anexo.nome}</span>
                                    <span class="text-[9px] text-texto/40 uppercase tracking-widest">Toque para baixar/ver</span>
                                </div>
                            </div>
                            <i class="ph ph-download-simple text-texto/50 hover:text-ouro text-lg"></i>
                        </a>
                    </div>
                ` : ''}

                <div class="flex flex-col mt-4 pt-4 border-t border-white/5 gap-1">
                    <span class="text-[10px] text-texto/40 font-medium flex items-center gap-1"><i class="ph ph-user"></i> Lançado por: <strong class="text-texto/70">${lancamento.autorNome}</strong></span>
                    <span class="text-[10px] text-texto/40 font-medium flex items-center gap-1"><i class="ph ph-clock"></i> Sistema: ${dataCriacao}</span>
                </div>
            </div>
        </div>
    `;
}

function obterTemplateFormulario(isEdicao) {
    let lancamento = { tipo: 'entrada', titulo: '', valor: '', data: '', formaPagamento: 'Pix', observacao: '', anexo: null };
    
    if (isEdicao) {
        const existente = estadoFinanceiro.lancamentos.find(l => l.id === estadoFinanceiro.lancamentoSelecionadoId);
        if (existente) lancamento = { ...existente };
    }

    return `
        <div class="w-full max-w-xl flex flex-col gap-4 animate-fadeIn w-full pb-10">
            <div class="flex items-center gap-4 mb-2">
                <button id="btn-cancelar-cadastro" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-texto transition-all outline-none">
                    <i class="ph ph-arrow-left text-xl"></i>
                </button>
                <h2 class="text-lg font-bold tracking-wide text-ouro">${isEdicao ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col gap-4 backdrop-blur-md shadow-2xl">
                
                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Fluxo de Caixa *</label>
                    <select id="fin-tipo" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all cursor-pointer">
                        <option value="entrada" ${lancamento.tipo === 'entrada' ? 'selected' : ''}>Entrada (Receita / Oferta / Doação)</option>
                        <option value="saida" ${lancamento.tipo === 'saida' ? 'selected' : ''}>Saída (Despesa / Compra / Pagamento)</option>
                    </select>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Título / Identificação *</label>
                    <input type="text" id="fin-titulo" value="${lancamento.titulo}" placeholder="Ex: Manutenção da Caixa de Retorno" required class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all" />
                </div>

                <div class="flex gap-4">
                    <div class="flex flex-col gap-1.5 flex-[1.2]">
                        <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Valor (R$) *</label>
                        <div class="relative flex items-center">
                            <span class="absolute left-4 text-texto/40 text-sm">R$</span>
                            <input type="number" id="fin-valor" value="${lancamento.valor}" step="0.01" min="0.01" placeholder="0.00" required class="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-1.5 flex-[1]">
                        <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Data Referente *</label>
                        <input type="date" id="fin-data" value="${lancamento.data}" required class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-3 text-sm text-texto focus:outline-none focus:border-ouro transition-all css-color-scheme-dark" style="color-scheme: dark;" />
                    </div>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Forma de Pagamento *</label>
                    <select id="fin-forma" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all cursor-pointer">
                        <option value="Pix" ${lancamento.formaPagamento === 'Pix' ? 'selected' : ''}>Pix</option>
                        <option value="Dinheiro" ${lancamento.formaPagamento === 'Dinheiro' ? 'selected' : ''}>Dinheiro</option>
                        <option value="Cartão de Crédito" ${lancamento.formaPagamento === 'Cartão de Crédito' ? 'selected' : ''}>Cartão de Crédito</option>
                        <option value="Cartão de Débito" ${lancamento.formaPagamento === 'Cartão de Débito' ? 'selected' : ''}>Cartão de Débito</option>
                        <option value="Transferência" ${lancamento.formaPagamento === 'Transferência' ? 'selected' : ''}>Transferência Bancária</option>
                    </select>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Observação (Opcional)</label>
                    <textarea id="fin-obs" rows="3" placeholder="Insira detalhes adicionais sobre esta movimentação..." class="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-texto focus:outline-none focus:border-ouro transition-all resize-none">${lancamento.observacao}</textarea>
                </div>

                <div class="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                    <label class="text-[10px] font-bold text-texto/50 uppercase tracking-widest pl-1">Comprovante / Nota Fiscal</label>
                    <label class="w-full bg-black/40 hover:bg-black/60 border border-white/10 hover:border-ouro/50 border-dashed rounded-xl py-4 px-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
                        <div class="w-10 h-10 rounded-full bg-white/5 group-hover:bg-ouro/10 flex items-center justify-center transition-all">
                            <i class="ph ph-upload-simple text-xl text-texto/50 group-hover:text-ouro"></i>
                        </div>
                        <span class="text-xs text-texto/50 group-hover:text-texto/80" id="label-nome-anexo">${lancamento.anexo ? lancamento.anexo.nome : 'Toque para anexar arquivo'}</span>
                        <input type="file" id="fin-anexo" accept=".pdf,image/*" class="hidden" />
                    </label>
                </div>

                <button id="btn-salvar-lancamento" class="w-full mt-4 bg-gradient-to-r from-ouro-escuro via-ouro to-ouro-claro hover:from-ouro hover:to-ouro-brilhante text-fundo font-bold text-sm tracking-widest uppercase py-4 rounded-xl shadow-[0_4px_20px_rgba(242,183,5,0.25)] transition-all active:scale-[0.98] outline-none">
                    ${isEdicao ? 'Salvar Alterações' : 'Confirmar Lançamento'}
                </button>
            </div>
        </div>
    `;
}

function obterTemplateRelatorios() {
    return `
        <div class="w-full max-w-xl flex flex-col gap-4 animate-fadeIn w-full pb-10">
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

// ==========================================
// EVENTOS & INTERAÇÕES
// ==========================================

function configurarEventosLista() {
    const btnNovo = document.getElementById('btn-novo-lancamento');
    if (btnNovo) {
        btnNovo.addEventListener('click', () => {
            estadoFinanceiro.abaAtiva = 'cadastro';
            renderizarInterface();
        });
    }

    const btnRelatorios = document.getElementById('btn-abrir-relatorios');
    if (btnRelatorios) {
        btnRelatorios.addEventListener('click', () => {
            estadoFinanceiro.abaAtiva = 'relatorios';
            renderizarInterface();
        });
    }

    document.querySelectorAll('[data-id-detalhes]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            estadoFinanceiro.lancamentoSelecionadoId = parseInt(e.currentTarget.getAttribute('data-id-detalhes'), 10);
            estadoFinanceiro.abaAtiva = 'detalhes';
            renderizarInterface();
        });
    });
}

function configurarEventosDetalhes() {
    document.getElementById('btn-voltar-detalhes').addEventListener('click', () => {
        estadoFinanceiro.lancamentoSelecionadoId = null;
        estadoFinanceiro.abaAtiva = 'lista';
        renderizarInterface();
    });

    const btnEditar = document.getElementById('btn-editar-lancamento');
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            estadoFinanceiro.abaAtiva = 'edicao';
            renderizarInterface();
        });
    }

    const btnDeletar = document.getElementById('btn-deletar-lancamento');
    if (btnDeletar) {
        btnDeletar.addEventListener('click', () => {
            if (confirm("Tem certeza que deseja excluir permanentemente este lançamento?")) {
                estadoFinanceiro.lancamentos = estadoFinanceiro.lancamentos.filter(l => l.id !== estadoFinanceiro.lancamentoSelecionadoId);
                estadoFinanceiro.lancamentoSelecionadoId = null;
                estadoFinanceiro.abaAtiva = 'lista';
                renderizarInterface();
            }
        });
    }
}

function configurarEventosFormulario(isEdicao) {
    document.getElementById('btn-cancelar-cadastro').addEventListener('click', () => {
        estadoFinanceiro.abaAtiva = isEdicao ? 'detalhes' : 'lista';
        renderizarInterface();
    });

    let anexoAtual = null;
    if (isEdicao) {
        const existente = estadoFinanceiro.lancamentos.find(l => l.id === estadoFinanceiro.lancamentoSelecionadoId);
        if (existente && existente.anexo) anexoAtual = { ...existente.anexo };
    }

    const inputAnexo = document.getElementById('fin-anexo');
    const labelAnexo = document.getElementById('label-nome-anexo');
    
    if (inputAnexo) {
        inputAnexo.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                labelAnexo.innerText = file.name;
                labelAnexo.classList.replace('text-texto/50', 'text-ouro-claro');
                labelAnexo.classList.add('font-bold');

                anexoAtual = {
                    nome: file.name,
                    url: URL.createObjectURL(file),
                    tipo: file.type
                };
            } else {
                labelAnexo.innerText = 'Toque para anexar arquivo';
                labelAnexo.classList.replace('text-ouro-claro', 'text-texto/50');
                labelAnexo.classList.remove('font-bold');
                anexoAtual = null;
            }
        });
    }

    document.getElementById('btn-salvar-lancamento').addEventListener('click', () => {
        const tipo = document.getElementById('fin-tipo').value;
        const titulo = document.getElementById('fin-titulo').value.trim();
        const valorStr = document.getElementById('fin-valor').value;
        const valor = parseFloat(valorStr);
        const data = document.getElementById('fin-data').value;
        const formaPagamento = document.getElementById('fin-forma').value;
        const observacao = document.getElementById('fin-obs').value.trim();

        if (!titulo || isNaN(valor) || !data) {
            alert("Por favor, preencha todos os campos obrigatórios (*)");
            return;
        }

        if (isEdicao) {
            const index = estadoFinanceiro.lancamentos.findIndex(l => l.id === estadoFinanceiro.lancamentoSelecionadoId);
            if (index !== -1) {
                estadoFinanceiro.lancamentos[index] = {
                    ...estadoFinanceiro.lancamentos[index],
                    tipo,
                    titulo,
                    formaPagamento,
                    valor,
                    data,
                    observacao,
                    anexo: anexoAtual
                };
            }
            estadoFinanceiro.abaAtiva = 'detalhes';
        } else {
            const novoLancamento = {
                id: Date.now(),
                tipo,
                titulo,
                formaPagamento,
                valor,
                data,
                observacao,
                anexo: anexoAtual,
                autorId: estadoFinanceiro.usuarioAtual.id,
                autorNome: estadoFinanceiro.usuarioAtual.nome,
                dataCriacao: new Date().toISOString()
            };
            estadoFinanceiro.lancamentos.push(novoLancamento);
            estadoFinanceiro.abaAtiva = 'lista';
        }

        renderizarInterface();
    });
}

function configurarEventosRelatorios() {
    document.getElementById('btn-voltar-relatorios').addEventListener('click', () => {
        estadoFinanceiro.abaAtiva = 'lista';
        renderizarInterface();
    });

    document.getElementById('btn-gerar-pdf').addEventListener('click', () => {
        const config = {
            tipo: document.getElementById('rel-tipo').value,
            dataInicio: document.getElementById('rel-data-inicio').value,
            dataFim: document.getElementById('rel-data-fim').value,
            forma: document.getElementById('rel-forma').value
        };
        gerarRelatorioPdfProfissional(config);
    });
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
    
    // Filtro por Data Referente
    if (config.dataInicio) filtrados = filtrados.filter(l => new Date(l.data) >= new Date(config.dataInicio));
    if (config.dataFim) filtrados = filtrados.filter(l => new Date(l.data) <= new Date(config.dataFim));

    // Filtro por Forma de Pagamento
    if (config.forma !== 'todos') filtrados = filtrados.filter(l => l.formaPagamento === config.forma);

    // Ordenação Cronológica Estrita (Do mais antigo para o mais novo no relatório - base na data de referência)
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

    // Resolução segura de Caminho Absoluto para a Logomarca
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/paginas\/.*$|\/index\.html$/, '');
    const logoUrl = baseUrl.endsWith('/') ? baseUrl + 'logo.png' : baseUrl + '/logo.png';

    // Construção do Documento
    const win = window.open('', '_blank');
    win.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório Financeiro - Banda Atalaia</title>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; padding: 0; font-size: 13px; line-height: 1.5; background-color: #fff; }
                
                /* Cabeçalho Oficial com Logo Integrada */
                .header-main { border-bottom: 3px solid #F2B705; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
                .church-header-container { display: flex; align-items: center; gap: 20px; }
                .church-logo { width: 80px; height: auto; object-fit: contain; }
                .church-info h1 { margin: 0; font-size: 18px; font-weight: 800; text-transform: uppercase; color: #0D0D0D; letter-spacing: 0.5px; }
                .church-info p.igreja-nome { font-size: 14px; font-weight: bold; margin: 5px 0 2px 0; color: #333; }
                .church-info p.igreja-end { margin: 0; font-size: 12px; color: #555; }
                
                .report-meta { text-align: right; }
                .report-meta h2 { margin: 0; font-size: 15px; color: #0D0D0D; font-weight: bold; text-transform: uppercase; }
                .report-meta p { margin: 4px 0 0 0; font-size: 12px; color: #666; }
                
                /* Cartões de Resumo */
                .cards-summary { display: flex; width: 100%; gap: 15px; margin-bottom: 35px; }
                .card-box { flex: 1; border: 1px solid #eee; background-color: #fafafa; border-radius: 8px; padding: 18px; text-align: center; border-top: 3px solid #0D0D0D; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
                .card-box.sld { border-top-color: #F2B705; }
                .card-box.ent { border-top-color: #2e7d32; }
                .card-box.sdi { border-top-color: #c62828; }
                .card-box .lbl { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #777; margin-bottom: 6px; }
                .card-box .val { font-size: 20px; font-weight: 800; color: #0D0D0D; }
                .card-box.ent .val { color: #2e7d32; }
                .card-box.sdi .val { color: #c62828; }
                
                /* Tabela de Lançamentos */
                .table-title { font-size: 14px; text-transform: uppercase; color: #0D0D0D; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 6px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                th { background-color: #0D0D0D; color: #F2B705; text-align: left; padding: 12px 14px; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; border-bottom: 2px solid #F2B705; }
                td { padding: 12px 14px; border-bottom: 1px solid #eee; font-size: 12px; vertical-align: top; color: #333; }
                tr:nth-child(even) td { background-color: #fcfcfc; }
                
                .badge-type { display: inline-block; padding: 4px 7px; font-size: 10px; font-weight: bold; border-radius: 4px; text-transform: uppercase; }
                .badge-type.in { background-color: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
                .badge-type.out { background-color: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
                
                .item-title { font-weight: bold; color: #0D0D0D; font-size: 13px; display: block; margin-bottom: 4px; }
                .item-obs { font-size: 11px; color: #666; font-style: italic; line-height: 1.4; margin-bottom: 4px; }
                .item-meta { font-size: 10px; color: #888; margin-top: 5px; }
                
                /* Assinaturas */
                .signatures-area { display: flex; justify-content: space-around; margin-top: 70px; page-break-inside: avoid; }
                .sig-block { border-top: 1px solid #0D0D0D; width: 250px; text-align: center; padding-top: 8px; }
                .sig-block strong { font-size: 13px; color: #0D0D0D; display: block; }
                .sig-block span { font-size: 11px; color: #666; }
                
                /* Rodapé */
                .footer-report { text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 15px; position: fixed; bottom: 20px; left: 40px; right: 40px; }
                
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
                <div class="church-header-container">
                    <img src="${logoUrl}" alt="Logo Atalaia" class="church-logo" onerror="this.style.display='none'">
                    <div class="church-info">
                        <h1>Ministério de Louvor - Banda Atalaia</h1>
                        <p class="igreja-nome">Igreja Evangélica Pentecostal Atalaia Cristã</p>
                        <p class="igreja-end">Rua Antônio Alves Corrêa, 17, São Pedro</p>
                    </div>
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
                        <th style="width: 12%;">Data Ref.</th>
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
                        const nomeAnexo = l.anexo ? l.anexo.nome : null;

                        return `
                            <tr>
                                <td>${dataExibivel}</td>
                                <td>
                                    <span class="item-title">${l.titulo}</span>
                                    ${l.observacao ? `<div class="item-obs">${l.observacao}</div>` : ''}
                                    <div class="item-meta">
                                        Lançado por: ${l.autorNome} ${nomeAnexo ? `| Doc: ${nomeAnexo}` : ''}
                                    </div>
                                </td>
                                <td><span class="badge-type ${l.tipo === 'entrada' ? 'in' : 'out'}">${l.tipo === 'entrada' ? 'Entrada' : 'Saída'}</span></td>
                                <td>${l.formaPagamento}</td>
                                <td style="text-align: right; font-weight: bold; color: ${l.tipo === 'entrada' ? '#2e7d32' : '#c62828'}; font-size: 14px;">
                                    ${l.tipo === 'entrada' ? '+' : '-'} ${l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        `;
                    }).join('') : `<tr><td colspan="5" style="text-align:center; padding:20px; color:#999; font-size:13px;">Nenhuma movimentação encontrada para os filtros selecionados.</td></tr>`}
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
                    setTimeout(function() { window.print(); }, 500);
                };
            </script>
        </body>
        </html>
    `);
    win.document.close();
}
