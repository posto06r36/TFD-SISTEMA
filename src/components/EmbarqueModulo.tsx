import React, { useState } from 'react';
import { 
  QrCode, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Printer, 
  Bus, 
  MapPin, 
  UserCheck, 
  AlertCircle,
  FileCheck,
  Search,
  RotateCcw,
  FileBadge
} from 'lucide-react';
import { TFDDatabase, ViagemAgendada, PassageiroViagem, PresencaStatus, SolicitacaoTFD } from '../types/tfd';
import { formatDateBR } from '../utils/masks';

interface EmbarqueModuloProps {
  db: TFDDatabase;
  selectedViagemId?: string | null;
  onUpdateDb: (updater: (prev: TFDDatabase) => TFDDatabase) => void;
  onOpenThermalVoucher: (p: PassageiroViagem, v: ViagemAgendada) => void;
  onOpenOrdemTFD: (sol: SolicitacaoTFD, viagem?: ViagemAgendada) => void;
}

export const EmbarqueModulo: React.FC<EmbarqueModuloProps> = ({
  db,
  selectedViagemId,
  onUpdateDb,
  onOpenThermalVoucher,
  onOpenOrdemTFD,
}) => {
  // Currently selected trip for boarding check-in
  const [activeTripId, setActiveTripId] = useState<string>(
    selectedViagemId || db.viagens_agendadas[0]?.id || ''
  );

  // Scanner search bar
  const [scanTokenInput, setScanTokenInput] = useState('');
  const [scanNotification, setScanNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Filter passenger table
  const [presenceFilter, setPresenceFilter] = useState<'Todos' | PresencaStatus>('Todos');

  const activeTrip = db.viagens_agendadas.find((v) => v.id === activeTripId);
  const veiculo = db.veiculos.find((v) => v.id === activeTrip?.veiculo_id);
  const motorista = db.motoristas.find((m) => m.id === activeTrip?.motorista_id);

  const tripPassengers = db.passageiros_viagem.filter((p) => p.viagem_id === activeTripId);

  // Stats
  const embarcadosCount = tripPassengers.filter((p) => p.status_presenca === 'Embarcou').length;
  const faltantesCount = tripPassengers.filter((p) => p.status_presenca === 'Faltou').length;
  const pendentesCount = tripPassengers.filter((p) => p.status_presenca === 'Pendente').length;
  const totalCapacity = veiculo?.capacidade_passageiros || 15;

  // Check-in handler
  const handleSetPresence = (passengerId: string, status: PresencaStatus) => {
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    onUpdateDb((prev) => ({
      ...prev,
      passageiros_viagem: prev.passageiros_viagem.map((p) =>
        p.id === passengerId
          ? {
              ...p,
              status_presenca: status,
              horario_embarque: status === 'Embarcou' ? timeStr : undefined,
            }
          : p
      ),
    }));
  };

  // Quick scanner validation handler
  const handleValidateVoucherToken = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = scanTokenInput.trim().toUpperCase();
    if (!token) return;

    const passenger = tripPassengers.find(
      (p) => p.voucher_token.toUpperCase() === token || p.cpf_passageiro.replace(/\D/g, '') === token.replace(/\D/g, '')
    );

    if (passenger) {
      handleSetPresence(passenger.id, 'Embarcou');
      setScanNotification({
        type: 'success',
        message: `Embarque Confirmado! Poltrona ${passenger.numero_poltrona}: ${passenger.nome_passageiro} (${passenger.tipo_passageiro})`,
      });
      setScanTokenInput('');
    } else {
      setScanNotification({
        type: 'error',
        message: `Voucher ou CPF "${token}" não localizado para esta viagem! Verifique a lista.`,
      });
    }

    setTimeout(() => {
      setScanNotification(null);
    }, 5000);
  };

  const filteredPassengers = tripPassengers.filter((p) => {
    if (presenceFilter === 'Todos') return true;
    return p.status_presenca === presenceFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-700" />
            Terminal de Embarque & Validação de Vouchers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Módulo para fiscais de embarque e pátio: check-in presencial, leitor de vouchers e impressão térmica 58mm.
          </p>
        </div>

        {/* Trip Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Viagem:</span>
          <select
            value={activeTripId}
            onChange={(e) => setActiveTripId(e.target.value)}
            className="text-xs font-bold p-2 border border-slate-300 rounded-lg bg-white shadow-2xs font-mono"
          >
            {db.viagens_agendadas.map((v) => (
              <option key={v.id} value={v.id}>
                {v.codigo_viagem} • {v.cidade_destino} ({formatDateBR(v.data_partida)} às {v.horario_partida})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeTrip && (
        <>
          {/* Trip Summary & Vehicle Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                Itinerário & Destino
              </span>
              <span className="font-extrabold text-slate-900 text-sm block mt-0.5">
                {activeTrip.cidade_destino}
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                {formatDateBR(activeTrip.data_partida)} às <b>{activeTrip.horario_partida}</b>
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                Veículo Designado
              </span>
              <span className="font-bold text-slate-800 text-xs block mt-0.5">
                {veiculo?.modelo?.split('(')[0] || 'Veículo Municipal'}
              </span>
              <span className="font-mono text-slate-600 text-[11px]">
                Placa: <b>{veiculo?.placa}</b> ({totalCapacity} poltronas)
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                Motorista de Plantão
              </span>
              <span className="font-bold text-slate-800 text-xs block mt-0.5">
                {motorista?.nome_completo}
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                CNH: {motorista?.cnh} • Tel: {motorista?.celular}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-700">Status do Embarque</span>
                <span className="font-mono font-bold text-emerald-800">
                  {embarcadosCount} de {tripPassengers.length} a bordo
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-1 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{
                    width: `${tripPassengers.length > 0 ? (embarcadosCount / tripPassengers.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Scanner / Voucher Search Tool */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                    Validador Rápido de Voucher & Leitor de QR Code
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Aproxime o leitor de código de barras / QR Code ou digite o Token (ex: VCH-2026-R8N1) ou CPF do passageiro.
                </p>
              </div>

              <form onSubmit={handleValidateVoucherToken} className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="text"
                  value={scanTokenInput}
                  onChange={(e) => setScanTokenInput(e.target.value)}
                  placeholder="Token ou CPF..."
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 w-full sm:w-60 uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Confirmar Embarque
                </button>
              </form>
            </div>

            {/* Notification alert */}
            {scanNotification && (
              <div
                className={`mt-4 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  scanNotification.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}
              >
                {scanNotification.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{scanNotification.message}</span>
              </div>
            )}
          </div>

          {/* Passenger Boarding Manifest */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Manifesto de Embarque ({tripPassengers.length} Passageiros)
                </span>
                <span className="text-slate-400 text-xs">|</span>
                <div className="flex items-center gap-1">
                  {(['Todos', 'Pendente', 'Embarcou', 'Faltou'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setPresenceFilter(filter)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                        presenceFilter === filter
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <CheckCircle className="w-3.5 h-3.5" /> Embarcados: <b className="font-mono">{embarcadosCount}</b>
                </span>
                <span className="flex items-center gap-1 font-semibold text-amber-700">
                  <Clock className="w-3.5 h-3.5" /> Pendentes: <b className="font-mono">{pendentesCount}</b>
                </span>
                <span className="flex items-center gap-1 font-semibold text-red-700">
                  <XCircle className="w-3.5 h-3.5" /> Faltaram: <b className="font-mono">{faltantesCount}</b>
                </span>
              </div>
            </div>

            {/* Manifest Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-3 w-16 text-center">Poltrona</th>
                      <th className="py-3 px-4">Passageiro & Tipo</th>
                      <th className="py-3 px-4">Documentos</th>
                      <th className="py-3 px-4">Voucher Token</th>
                      <th className="py-3 px-4">Destino / Hospital</th>
                      <th className="py-3 px-4">Status de Embarque</th>
                      <th className="py-3 px-4 text-right">Ação / Impressão 58mm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPassengers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-500">
                          Nenhum passageiro encontrado nesta viagem para o filtro selecionado.
                        </td>
                      </tr>
                    ) : (
                      filteredPassengers
                        .sort((a, b) => a.numero_poltrona - b.numero_poltrona)
                        .map((p) => {
                          const sol = db.solicitacoes_tfd.find((s) => s.id === p.solicitacao_id);
                          const isEmbarcou = p.status_presenca === 'Embarcou';
                          const isFaltou = p.status_presenca === 'Faltou';

                          return (
                            <tr
                              key={p.id}
                              className={`transition-colors ${
                                isEmbarcou
                                  ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                                  : isFaltou
                                  ? 'bg-red-50/30 hover:bg-red-50/60'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="py-3 px-3 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-black text-xs">
                                  {String(p.numero_poltrona).padStart(2, '0')}
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900 text-xs">
                                  {p.nome_passageiro}
                                </div>
                                <span
                                  className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                    p.tipo_passageiro === 'Paciente'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-purple-50 text-purple-700 border-purple-200'
                                  }`}
                                >
                                  {p.tipo_passageiro}
                                </span>
                              </td>

                              <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                                <div>CPF: {p.cpf_passageiro}</div>
                                {p.cartao_sus_passageiro && (
                                  <div className="text-[10px] text-slate-400">CNS: {p.cartao_sus_passageiro}</div>
                                )}
                              </td>

                              <td className="py-3 px-4">
                                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                  {p.voucher_token}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-slate-700">
                                <div className="font-semibold text-slate-900 truncate max-w-[160px]">
                                  {sol?.hospital_destino || 'Hospital Regulado'}
                                </div>
                                <div className="text-slate-500 text-[10px]">
                                  {sol?.especialidade_medica} ({sol?.cid_10})
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                {isEmbarcou ? (
                                  <div>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                                      Embarcou
                                    </span>
                                    {p.horario_embarque && (
                                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                        às {p.horario_embarque}
                                      </div>
                                    )}
                                  </div>
                                ) : isFaltou ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-100 px-2.5 py-0.5 rounded-full">
                                    <XCircle className="w-3.5 h-3.5 text-red-700" />
                                    Faltou
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    Aguardando
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Fast Presence Toggles */}
                                  {!isEmbarcou && (
                                    <button
                                      onClick={() => handleSetPresence(p.id, 'Embarcou')}
                                      className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors cursor-pointer"
                                      title="Confirmar Embarque"
                                    >
                                      Check-in
                                    </button>
                                  )}

                                  {!isFaltou && !isEmbarcou && (
                                    <button
                                      onClick={() => handleSetPresence(p.id, 'Faltou')}
                                      className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors cursor-pointer"
                                      title="Marcar como Ausente"
                                    >
                                      Ausente
                                    </button>
                                  )}

                                  {(isEmbarcou || isFaltou) && (
                                    <button
                                      onClick={() => handleSetPresence(p.id, 'Pendente')}
                                      title="Desfazer e voltar para pendente"
                                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Print 58mm Thermal Voucher Button */}
                                  <button
                                    onClick={() => onOpenThermalVoucher(p, activeTrip)}
                                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Imprimir Cupom Térmico 58mm (POS-58)"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Cupom 58mm</span>
                                  </button>

                                  {/* Ordem TFD Gratuita (A4) */}
                                  <button
                                    onClick={() => {
                                      if (sol) onOpenOrdemTFD(sol, activeTrip);
                                    }}
                                    className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Emitir Ordem de Transporte TFD Gratuita (A4)"
                                  >
                                    <FileBadge className="w-3.5 h-3.5" />
                                    <span>Ordem Gratuita</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
