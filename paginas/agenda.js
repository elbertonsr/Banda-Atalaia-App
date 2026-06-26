export function obterTemplateAba() {
  return `
        <div class="w-full max-w-xl flex flex-col gap-4 animate-[fadeIn_0.3s_ease-in-out]">
            <div class="flex items-center justify-between mb-2">
                <h2 class="text-xl font-bold tracking-wide text-ouro">Agenda de Atividades</h2>
                <span class="text-xs bg-ouro/10 text-ouro-claro border border-ouro/20 px-3 py-1 rounded-full font-medium">3 Próximos Eventos</span>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden backdrop-blur-md shadow-lg">
                <div class="absolute left-0 top-0 h-full w-1 bg-ouro"></div>
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-[10px] bg-ouro-escuro/40 text-ouro-claro border border-ouro-escuro/50 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Ensaio Geral</span>
                        <h3 class="text-base font-bold mt-1 text-texto">Preparação Culto de Domingo</h3>
                    </div>
                    <div class="text-right">
                        <span class="text-sm font-bold text-ouro block">Amanhã</span>
                        <span class="text-xs text-texto/40">19:30h</span>
                    </div>
                </div>
                <p class="text-xs text-texto/60"><i class="ph ph-map-pin text-ouro mr-1"></i> Templo Principal (Galeria do Som)</p>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden backdrop-blur-md shadow-lg">
                <div class="absolute left-0 top-0 h-full w-1 bg-ouro-claro"></div>
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-[10px] bg-white/5 text-texto/70 border border-white/10 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Culto Oficial</span>
                        <h3 class="text-base font-bold mt-1 text-texto">Celebração de Domingo</h3>
                    </div>
                    <div class="text-right">
                        <span class="text-sm font-bold text-texto/80 block">28 Jun</span>
                        <span class="text-xs text-texto/40">18:00h</span>
                    </div>
                </div>
                <p class="text-xs text-texto/60"><i class="ph ph-map-pin text-ouro mr-1"></i> Nave Central da Igreja</p>
            </div>
        </div>
    `;
}

export function inicializarEventosAba() {
  // Eventos e manipulações futuras da agenda
}
