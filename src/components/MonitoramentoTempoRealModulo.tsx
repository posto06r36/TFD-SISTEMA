import React, { useState } from 'react';
import { 
  Radio, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Tag, 
  Printer, 
  PlusCircle, 
  Search, 
  FileBadge, 
  ShieldCheck, 
  Bus,
  ArrowRight,
  Filter
} from 'lucide-react';
import { 
  TFDDatabase, 
  SolicitacaoTFD, 
  PontoEspera, 
  Paciente, 
  UsuarioSistema, 
  ViagemAgendada 
} from '../types/tfd';
import { formatDateBR } from '../utils/masks';

interface MonitoramentoTempoRealModuloProps {
  db: TFDDatabase;
  activeUser: UsuarioSistema;
  onOpenEtiqueta: (sol: SolicitacaoTFD) => void;
  onOpenOrdemTFD: (sol: SolicitacaoTFD) => void;
  onEmitirNovaOS: () => void;
}

export const MonitoramentoTempoRealModulo: React.FC<MonitoramentoTempoRealModuloProps> = ({
  db,
  activeUser,
  onOpenEtiqueta,
  onOpenOrdemTFD,
  onEmitirNovaOS,
}) => {
  // Date filter: defaults to 2026-10-26 (matching rich seed data)
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-26');
  const [selectedPontoFiltro, setSelectedPontoFiltro] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick preset dates
  const presetDates = [
    { label: 'Segunda (26/10)', date: '2026-10-26' },
    { label: 'Terça (27/10)', date: '2026-10-27' },
    { label: 'Quarta (28/10)', date: '2026-10-28' },
  ];

  // Solicitations for the selected date
  const solicitacoesDoDia = db.solicitacoes_tfd.filter((s) => {
    const dataRef = s.data_viagem_prevista || s.data_agendada_consulta;
    const matchesDate = dataRef === selectedDate;
    const matchesPonto = selectedPontoFiltro === 'Todos' || s.ponto_espera_id === selectedPontoFiltro;
    return matchesDate && matchesPonto;
  });

  // Calculate passengers count (patients + escorts)
  const totalPassageirosNoDia = solicitacoesDoDia.reduce((total, s) => {
    return total + (s.requer_acompanhante ? 2 : 1);
  }, 0);

  // Trips scheduled for this date
  const viagensNoDia = db.viagens_agendadas.filter((v) => v.data_partida === selectedDate);
  const capacidadeTotalFrota = viagensNoDia.reduce((cap, v) => {
    const veic = db.veiculos.find((ve) => ve.id === v.veiculo_id);
    return cap + (veic?.capacidade_passageiros || 15);
  }, 0) || 15; // default van 15 if no trip yet

  // Occupancy rate calculation
  const taxaOcupacao = Math.round((totalPassageirosNoDia / capacidadeTotalFrota) * 100);
  const isCheio = totalPassageirosNoDia >= capacidadeTotalFrota;
  const isQuaseCheio = taxaOcupacao >= 75 && !isCheio;

  // Group solicitations by Ponto de Espera
  const pontosComPacientes = db.pontos_espera.map((ponto) => {
    const pacientesNestePonto = db.solicitacoes_tfd.filter((s) => {
      const dataRef = s.data_viagem_prevista || s.data_agendada_consulta;
      const ehDestePonto = s.ponto_espera_id === ponto.id || s.ponto_espera_nome === ponto.nome;
      return dataRef === selectedDate && ehDestePonto;
    });

    const totalVagasPonto = pacientesNestePonto.reduce(
      (tot, s) => tot + (s.requer_acompanhante ? 2 : 1),
      0
    );

    return {
      ponto,
      pacientesNestePonto,
      totalVagasPonto,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Fast OS Emission button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-700" />
              Monitoramento em Tempo Real de Ordens TFD & Pontos de Espera
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhamento centralizado de lotação por data, controle de itinerário de coleta e emissão de etiquetas aos pacientes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEmitirNovaOS}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Emitir Nova OS com Ponto de Espera
          </button>
        </div>
      </div>

      {/* Date & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Preset Date Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-4 h-4 text-emerald-700" />
            Data da Viagem:
          </span>
          {presetDates.map((item) => (
            <button
              key={item.date}
              onClick={() => setSelectedDate(item.date)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                selectedDate === item.date
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* Date Picker Input */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="text-xs text-slate-500">Outra data:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-mono font-semibold p-1.5 border border-slate-300 rounded-lg bg-white"
            />
          </div>
        </div>

        {/* Filter by Ponto de Espera */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Ponto:</span>
          <select
            value={selectedPontoFiltro}
            onChange={(e) => setSelectedPontoFiltro(e.target.value)}
            className="text-xs font-medium p-1.5 border border-slate-300 rounded-lg bg-white"
          >
            <option value="Todos">Todos os Pontos de Espera</option>
            {db.pontos_espera.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} ({p.horario_estimado_passagem})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LOTAÇÃO EM TEMPO REAL: INDICADOR DE CARRO CHEIO / CAPACIDADE */}
      <div
        className={`p-5 rounded-2xl border shadow-sm transition-all ${
          isCheio
            ? 'bg-red-50/90 border-red-300 text-red-950'
            : isQuaseCheio
            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isCheio ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-red-600 text-white animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  VEÍCULO CHEIO / CAPACIDADE MÁXIMA ATINGIDA
                </span>
              ) : isQuaseCheio ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  LOTAÇÃO QUASE ESGOTADA ({taxaOcupacao}%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-700 text-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  VAGAS DISPONÍVEIS NA DATA
                </span>
              )}
              <span className="text-xs font-mono font-bold">
                Data: {formatDateBR(selectedDate)}
              </span>
            </div>

            <h3 className="text-lg font-extrabold tracking-tight">
              {isCheio
                ? `Alerta: Todas as ${capacidadeTotalFrota} poltronas foram preenchidas!`
                : `${totalPassageirosNoDia} passageiros aguardando transporte (${capacidadeTotalFrota - totalPassageirosNoDia} assentos livres)`}
            </h3>
            <p className="text-xs opacity-85">
              {isCheio
                ? 'A frota programada para este dia atingiu o limite de segurança. Mobilize um veículo utilitário extra ou van adicional.'
                : 'Monitoramento contínuo em tempo real de pacientes cadastrados por cada ponto de coleta da cidade.'}
            </p>
          </div>

          {/* Meter Box */}
          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-black/5 min-w-[240px]">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-semibold text-slate-700">Taxa de Lotação</span>
              <span className="font-mono font-black text-base tabular-nums">
                {totalPassageirosNoDia} / {capacidadeTotalFrota} ({taxaOcupacao}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden border border-slate-300">
              <div
                className={`h-full rounded-full transition-all ${
                  isCheio
                    ? 'bg-red-600'
                    : isQuaseCheio
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(taxaOcupacao, 100)}%` }}
              />
            </div>
            <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
              <span>{solicitacoesDoDia.length} Ordens TFD Emitidas</span>
              <span>{viagensNoDia.length || 1} Veículo(s) em Operação</span>
            </div>
          </div>
        </div>
      </div>

      {/* ITINERÁRIO DOS PONTOS DE ESPERA (ROTEIRO DO VEÍCULO) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bus className="w-5 h-5 text-emerald-700" />
              Itinerário de Coleta nos Pontos de Espera • {formatDateBR(selectedDate)}
            </h3>
            <p className="text-xs text-slate-500">
              Locais de espera definidos pelos operadores. Entregue a etiqueta para o paciente estar no local no horário indicado.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {db.pontos_espera.length} Pontos Mapeados no Município
          </span>
        </div>

        {/* Grid of waiting points cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pontosComPacientes.map(({ ponto, pacientesNestePonto, totalVagasPonto }) => {
            const hasPatients = pacientesNestePonto.length > 0;

            return (
              <div
                key={ponto.id}
                className={`rounded-xl border transition-all ${
                  hasPatients
                    ? 'bg-white border-slate-300 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 opacity-80'
                }`}
              >
                {/* Ponto Header */}
                <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                      <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{ponto.nome}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight">
                      {ponto.endereco} • {ponto.bairro_regiao}
                    </div>
                    <div className="text-[10px] text-slate-400 italic">
                      Ref: {ponto.referencia}
                    </div>
                  </div>

                  {/* Scheduled Passing Time Badge */}
                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      {ponto.horario_estimado_passagem}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5 uppercase font-semibold">
                      Passagem
                    </span>
                  </div>
                </div>

                {/* Waiting Patients Section */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">
                      Pacientes a embarcar:
                    </span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        hasPatients
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {totalVagasPonto} {totalVagasPonto === 1 ? 'pessoa' : 'pessoas'}
                    </span>
                  </div>

                  {pacientesNestePonto.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      Nenhum paciente designado para este ponto nesta data.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pacientesNestePonto.map((sol) => {
                        const pac = db.pacientes.find((p) => p.id === sol.paciente_id);
                        const acomp = db.acompanhantes.find((a) => a.solicitacao_id === sol.id);

                        return (
                          <div
                            key={sol.id}
                            className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-slate-200 text-xs transition-colors space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {pac?.nome_completo}
                                </span>
                                <span className="font-mono text-[10px] text-slate-500">
                                  CPF: {pac?.cpf} • OS: {sol.ordem_numero || `OS-${sol.id.slice(-4)}`}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                {sol.cidade_destino}
                              </span>
                            </div>

                            {sol.requer_acompanhante && acomp && (
                              <div className="text-[10px] text-purple-700 bg-purple-50 p-1 rounded font-medium">
                                + Acompanhante: {acomp.nome_completo} ({acomp.grau_parentesco})
                              </div>
                            )}

                            {/* Action Buttons for each Patient at Waiting Point */}
                            <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-200/60">
                              <button
                                onClick={() => onOpenEtiqueta(sol)}
                                className="px-2 py-0.5 text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
                                title="Imprimir Etiqueta / Papel de bolso com ponto de espera para entregar ao paciente"
                              >
                                <Tag className="w-3 h-3" />
                                Etiqueta / Papel
                              </button>
                              <button
                                onClick={() => onOpenOrdemTFD(sol)}
                                className="px-2 py-0.5 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Ver Ordem TFD Gratuita A4"
                              >
                                <FileBadge className="w-3 h-3 text-slate-500" />
                                Ordem A4
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
