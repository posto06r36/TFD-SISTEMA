import React from 'react';
import { 
  FileText, 
  Bus, 
  Users, 
  DollarSign, 
  ArrowRight, 
  Clock, 
  MapPin, 
  Calendar,
  AlertCircle,
  PlusCircle,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  FileBadge,
  FileSpreadsheet
} from 'lucide-react';
import { TFDDatabase, ViagemAgendada, SolicitacaoTFD } from '../types/tfd';
import { formatBRL, formatDateBR } from '../utils/masks';

interface DashboardProps {
  db: TFDDatabase;
  onNavigate: (tab: string) => void;
  onSelectViagemEmbarque: (viagemId: string) => void;
  onOpenOrdemTFD: (sol: SolicitacaoTFD) => void;
  sheetMeta?: any;
  onOpenGoogleSheetsModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  db,
  onNavigate,
  onSelectViagemEmbarque,
  onOpenOrdemTFD,
  sheetMeta,
  onOpenGoogleSheetsModal,
}) => {
  // Metrics calculation
  const pendingRequests = db.solicitacoes_tfd.filter((s) => s.status === 'Pendente');
  
  // Today's trips
  const todayStr = '2026-10-26'; // anchored close to realistic mock date for rich demonstration
  const viagensHoje = db.viagens_agendadas.filter((v) => v.data_partida === todayStr || v.status_viagem === 'Programada');
  
  // Patients scheduled this week
  const scheduledThisWeek = db.solicitacoes_tfd.filter(
    (s) => s.status === 'Aprovado' || s.status === 'Pendente'
  );

  // Total daily per diems released
  const totalDiarias = db.diarias_ajuda_custo.reduce((acc, d) => acc + d.valor_pago, 0);

  // Calculate vehicle occupancy for a trip
  const getTripOccupancy = (viagem: ViagemAgendada) => {
    const veiculo = db.veiculos.find((v) => v.id === viagem.veiculo_id);
    const capacity = veiculo?.capacidade_passageiros || 1;
    const passengersCount = db.passageiros_viagem.filter((p) => p.viagem_id === viagem.id).length;
    const percentage = Math.round((passengersCount / capacity) * 100);
    return { passengersCount, capacity, percentage, veiculo };
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sistema Oficial de Regulação de Transporte em Saúde</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Painel de Controle do TFD Municipal
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Gestão integrada de deslocamentos intermunicipais de pacientes do SUS para hospitais de referência, alocação de frota, vouchers térmicos e concessão de diárias de custeio.
            </p>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('triagem')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Nova Solicitação
            </button>
            <button
              onClick={() => {
                const approved = db.solicitacoes_tfd.find((s) => s.status === 'Aprovado') || db.solicitacoes_tfd[0];
                if (approved) onOpenOrdemTFD(approved);
              }}
              className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-500/50 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              title="Emitir Ordem Oficial de Transporte Gratuito do SUS"
            >
              <FileBadge className="w-4 h-4 text-emerald-300" />
              Ordem TFD Gratuita
            </button>
            <button
              onClick={() => onNavigate('embarque')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/15 transition-all flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              Terminal de Embarque
            </button>
            {onOpenGoogleSheetsModal && (
              <button
                onClick={onOpenGoogleSheetsModal}
                className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 hover:text-white text-xs font-semibold rounded-xl border border-emerald-400/30 transition-all flex items-center gap-2 cursor-pointer"
                title="Gerenciar e sincronizar com o banco de dados no Google Planilhas"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                {sheetMeta ? 'Planilha Google (Conectada)' : 'Conectar Google Planilha'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards (4 Principal Counters as requested) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Solicitações Pendentes */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Solicitações Pendentes
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {pendingRequests.length}
            </span>
            <span className="text-xs text-amber-600 font-medium">Aguardando laudo/vaga</span>
          </div>
          <button
            onClick={() => onNavigate('triagem')}
            className="mt-4 text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
          >
            Analisar solicitações <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Viagens Hoje */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Viagens Programadas
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bus className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {viagensHoje.length}
            </span>
            <span className="text-xs text-blue-600 font-medium">Na semana ativa</span>
          </div>
          <button
            onClick={() => onNavigate('frota')}
            className="mt-4 text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            Gerenciar veículos <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Pacientes Agendados */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pacientes na Semana
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {scheduledThisWeek.length}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Com vaga regulada</span>
          </div>
          <button
            onClick={() => onNavigate('triagem')}
            className="mt-4 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            Ver pacientes <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Diárias Liberadas */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Diárias Liberadas (R$)
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {formatBRL(totalDiarias)}
            </span>
          </div>
          <button
            onClick={() => onNavigate('diarias')}
            className="mt-4 text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
          >
            Emitir ajuda de custo <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Scheduled Trips with Vehicle Occupancy + Pending Solicitations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Próximas Viagens Agendadas e Taxa de Ocupação */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Próximas Viagens Agendadas
              </h2>
              <p className="text-xs text-slate-500">
                Capacidade, alocação de poltronas e rota dos veículos municipais
              </p>
            </div>
            <button
              onClick={() => onNavigate('frota')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              Nova Viagem <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Código / Destino</th>
                    <th className="py-3 px-4">Data & Horário</th>
                    <th className="py-3 px-4">Veículo & Motorista</th>
                    <th className="py-3 px-4">Taxa de Ocupação</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {db.viagens_agendadas.map((viagem) => {
                    const { passengersCount, capacity, percentage, veiculo } = getTripOccupancy(viagem);
                    const motorista = db.motoristas.find((m) => m.id === viagem.motorista_id);
                    const isFull = passengersCount >= capacity;

                    return (
                      <tr key={viagem.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 font-mono">{viagem.codigo_viagem}</div>
                          <div className="text-slate-600 flex items-center gap-1 mt-0.5 font-medium">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {viagem.cidade_destino}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                          <div className="font-semibold flex items-center gap-1 text-slate-900">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDateBR(viagem.data_partida)}
                          </div>
                          <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Saída às {viagem.horario_partida}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700">
                          <div className="font-semibold text-slate-900 truncate max-w-[170px]">
                            {veiculo?.modelo?.split('(')[0] || 'Veículo Municipal'}
                          </div>
                          <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                            Placa: {veiculo?.placa || '-'} • Mot: {motorista?.nome_completo?.split(' ')[0]}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                            <span className="font-bold text-slate-800 tabular-nums">
                              {passengersCount}/{capacity} poltronas
                            </span>
                            <span className={`font-semibold ${isFull ? 'text-red-600' : 'text-slate-600'}`}>
                              {percentage}%
                            </span>
                          </div>
                          <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isFull 
                                  ? 'bg-red-500' 
                                  : percentage > 70 
                                  ? 'bg-amber-500' 
                                  : 'bg-emerald-600'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              onSelectViagemEmbarque(viagem.id);
                              onNavigate('embarque');
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                          >
                            Embarque
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Solicitações de TFD Recentes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Últimas Solicitações
              </h2>
              <p className="text-xs text-slate-500">
                Triagem e análise médica
              </p>
            </div>
            <button
              onClick={() => onNavigate('triagem')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
            {db.solicitacoes_tfd.slice(0, 4).map((sol) => {
              const paciente = db.pacientes.find((p) => p.id === sol.paciente_id);
              return (
                <div key={sol.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {paciente?.nome_completo || 'Paciente não identificado'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {sol.especialidade_medica}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
                        sol.status === 'Aprovado'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : sol.status === 'Pendente'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {sol.status}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
                    <span>Destino: <b>{sol.cidade_destino}</b></span>
                    <span className="font-mono tabular-nums text-slate-500">
                      CID: {sol.cid_10}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    {sol.requer_acompanhante ? (
                      <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/50 font-medium">
                        + Acompanhante Solicitado
                      </span>
                    ) : <span />}
                    <button
                      onClick={() => onOpenOrdemTFD(sol)}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                    >
                      <FileBadge className="w-3 h-3 text-emerald-700" />
                      Ordem Gratuita
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guidelines Callout */}
          <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/70 text-xs text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Regulação de Transporte TFD</span>
            </div>
            <p className="text-emerald-800 leading-relaxed text-[11px]">
              O embarque é restrito a pacientes cadastrados com agendamento ativo e comprovante de laudo médico. Acompanhantes são admitidos com laudo justificativo.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
