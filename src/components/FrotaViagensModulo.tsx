import React, { useState } from 'react';
import { 
  Bus, 
  PlusCircle, 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  Trash2, 
  Armchair, 
  AlertCircle,
  Truck,
  User,
  X,
  QrCode,
  FileBadge
} from 'lucide-react';
import { 
  TFDDatabase, 
  ViagemAgendada, 
  PassageiroViagem, 
  Veiculo, 
  Motorista, 
  SolicitacaoTFD,
  ViagemStatus 
} from '../types/tfd';
import { formatDateBR, maskCPF, maskPhone } from '../utils/masks';

interface FrotaViagensModuloProps {
  db: TFDDatabase;
  onUpdateDb: (updater: (prev: TFDDatabase) => TFDDatabase) => void;
  onOpenThermalVoucher: (p: PassageiroViagem, v: ViagemAgendada) => void;
  onOpenOrdemTFD: (sol: SolicitacaoTFD, viagem?: ViagemAgendada) => void;
}

export const FrotaViagensModulo: React.FC<FrotaViagensModuloProps> = ({
  db,
  onUpdateDb,
  onOpenThermalVoucher,
  onOpenOrdemTFD,
}) => {
  const [activeTab, setActiveTab] = useState<'viagens' | 'frota_motoristas'>('viagens');
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [selectedTripForAllocation, setSelectedTripForAllocation] = useState<ViagemAgendada | null>(null);

  // New Trip Form States
  const [cidadeDestino, setCidadeDestino] = useState('Salvador');
  const [dataPartida, setDataPartida] = useState('');
  const [horarioPartida, setHorarioPartida] = useState('04:00');
  const [pontoEncontro, setPontoEncontro] = useState('Pátio da Secretaria de Saúde (Av. Getúlio Vargas, 100)');
  const [veiculoId, setVeiculoId] = useState(db.veiculos.find((v) => v.status === 'Ativo')?.id || '');
  const [motoristaId, setMotoristaId] = useState(db.motoristas[0]?.id || '');
  const [observacoes, setObservacoes] = useState('');
  const [tripError, setTripError] = useState('');

  // Add Vehicle Form States
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newPlaca, setNewPlaca] = useState('');
  const [newModelo, setNewModelo] = useState('');
  const [newCapacidade, setNewCapacidade] = useState(16);
  const [newTipoVeiculo, setNewTipoVeiculo] = useState<'Van' | 'Micro-ônibus' | 'Ônibus' | 'Carro Utilitário'>('Van');

  // Add Driver Form States
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [newNomeMot, setNewNomeMot] = useState('');
  const [newCpfMot, setNewCpfMot] = useState('');
  const [newCnhMot, setNewCnhMot] = useState('');
  const [newCatCnh, setNewCatCnh] = useState<'B' | 'C' | 'D' | 'E'>('D');
  const [newTelMot, setNewTelMot] = useState('');

  // Handle New Trip Creation
  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataPartida) {
      setTripError('Informe a data de partida da viagem.');
      return;
    }
    if (!veiculoId) {
      setTripError('Selecione um veículo ativo.');
      return;
    }
    if (!motoristaId) {
      setTripError('Selecione um motorista habilitado.');
      return;
    }

    const newTripId = `vg-${Date.now()}`;
    const codeNum = Math.floor(100 + Math.random() * 900);
    const newViagem: ViagemAgendada = {
      id: newTripId,
      codigo_viagem: `TFD-VG-2026-${codeNum}`,
      cidade_destino: cidadeDestino,
      data_partida: dataPartida,
      horario_partida: horarioPartida,
      ponto_encontro: pontoEncontro,
      veiculo_id: veiculoId,
      motorista_id: motoristaId,
      status_viagem: 'Programada',
      observacoes,
    };

    onUpdateDb((prev) => ({
      ...prev,
      viagens_agendadas: [newViagem, ...prev.viagens_agendadas],
    }));

    setShowNewTripModal(false);
    setDataPartida('');
    setObservacoes('');
    setTripError('');
  };

  // Change Trip Status
  const handleUpdateTripStatus = (viagemId: string, newStatus: ViagemStatus) => {
    onUpdateDb((prev) => ({
      ...prev,
      viagens_agendadas: prev.viagens_agendadas.map((v) =>
        v.id === viagemId ? { ...v, status_viagem: newStatus } : v
      ),
    }));
  };

  // Seat Allocation Logic
  const handleAllocatePassenger = (
    viagem: ViagemAgendada,
    solicitacao: SolicitacaoTFD,
    includeCompanion: boolean
  ) => {
    const veiculo = db.veiculos.find((v) => v.id === viagem.veiculo_id);
    const maxCapacity = veiculo?.capacidade_passageiros || 15;
    const currentAllocated = db.passageiros_viagem.filter((p) => p.viagem_id === viagem.id);

    // Check capacity
    const slotsNeeded = includeCompanion && solicitacao.requer_acompanhante ? 2 : 1;
    if (currentAllocated.length + slotsNeeded > maxCapacity) {
      alert(`Capacidade máxima do veículo atingida! O veículo comporta ${maxCapacity} passageiros.`);
      return;
    }

    const paciente = db.pacientes.find((p) => p.id === solicitacao.paciente_id);
    const acompanhante = db.acompanhantes.find((a) => a.solicitacao_id === solicitacao.id);

    // Find next available seat numbers
    const occupiedSeats = new Set(currentAllocated.map((p) => p.numero_poltrona));
    let nextSeatPatient = 1;
    while (occupiedSeats.has(nextSeatPatient) && nextSeatPatient <= maxCapacity) {
      nextSeatPatient++;
    }

    occupiedSeats.add(nextSeatPatient);

    let nextSeatAcomp = 1;
    while (occupiedSeats.has(nextSeatAcomp) && nextSeatAcomp <= maxCapacity) {
      nextSeatAcomp++;
    }

    const randomToken1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newPassenger: PassageiroViagem = {
      id: `pv-${Date.now()}-1`,
      viagem_id: viagem.id,
      solicitacao_id: solicitacao.id,
      tipo_passageiro: 'Paciente',
      nome_passageiro: paciente?.nome_completo || 'Paciente',
      cpf_passageiro: paciente?.cpf || '',
      cartao_sus_passageiro: paciente?.cartao_sus,
      numero_poltrona: nextSeatPatient,
      status_presenca: 'Pendente',
      voucher_token: `VCH-2026-${randomToken1}`,
    };

    const newPassengers = [newPassenger];

    if (includeCompanion && acompanhante) {
      const randomToken2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const newCompanionPass: PassageiroViagem = {
        id: `pv-${Date.now()}-2`,
        viagem_id: viagem.id,
        solicitacao_id: solicitacao.id,
        tipo_passageiro: 'Acompanhante',
        nome_passageiro: acompanhante.nome_completo,
        cpf_passageiro: acompanhante.cpf,
        numero_poltrona: nextSeatAcomp,
        status_presenca: 'Pendente',
        voucher_token: `VCH-2026-${randomToken2}`,
      };
      newPassengers.push(newCompanionPass);
    }

    onUpdateDb((prev) => ({
      ...prev,
      passageiros_viagem: [...prev.passageiros_viagem, ...newPassengers],
    }));
  };

  const handleRemovePassenger = (passengerId: string) => {
    onUpdateDb((prev) => ({
      ...prev,
      passageiros_viagem: prev.passageiros_viagem.filter((p) => p.id !== passengerId),
    }));
  };

  // Add Vehicle handler
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaca.trim() || !newModelo.trim()) return;

    const newVeic: Veiculo = {
      id: `veic-${Date.now()}`,
      placa: newPlaca.toUpperCase(),
      modelo: newModelo,
      capacidade_passageiros: Number(newCapacidade),
      status: 'Ativo',
      tipo_veiculo: newTipoVeiculo,
    };

    onUpdateDb((prev) => ({
      ...prev,
      veiculos: [...prev.veiculos, newVeic],
    }));

    setShowAddVehicleModal(false);
    setNewPlaca('');
    setNewModelo('');
  };

  // Add Driver handler
  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNomeMot.trim() || !newCnhMot.trim()) return;

    const newMot: Motorista = {
      id: `mot-${Date.now()}`,
      nome_completo: newNomeMot,
      cpf: newCpfMot,
      cnh: newCnhMot,
      categoria_cnh: newCatCnh,
      celular: newTelMot,
    };

    onUpdateDb((prev) => ({
      ...prev,
      motoristas: [...prev.motoristas, newMot],
    }));

    setShowAddDriverModal(false);
    setNewNomeMot('');
    setNewCpfMot('');
    setNewCnhMot('');
    setNewTelMot('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bus className="w-5 h-5 text-emerald-700" />
            Gestão de Frota, Viagens & Alocação de Poltronas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Programação de itinerários municipais, controle de capacidade por veículo e enturmação de passageiros regulados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('viagens')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'viagens' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Viagens Agendadas ({db.viagens_agendadas.length})
            </button>
            <button
              onClick={() => setActiveTab('frota_motoristas')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'frota_motoristas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Veículos & Motoristas ({db.veiculos.length})
            </button>
          </div>

          <button
            onClick={() => setShowNewTripModal(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Programar Viagem
          </button>
        </div>
      </div>

      {/* TAB 1: VIAGENS AGENDADAS */}
      {activeTab === 'viagens' && (
        <div className="grid grid-cols-1 gap-6">
          {db.viagens_agendadas.map((viagem) => {
            const veiculo = db.veiculos.find((v) => v.id === viagem.veiculo_id);
            const motorista = db.motoristas.find((m) => m.id === viagem.motorista_id);
            const passengers = db.passageiros_viagem.filter((p) => p.viagem_id === viagem.id);
            const capacity = veiculo?.capacidade_passageiros || 15;
            const occupancyPercentage = Math.round((passengers.length / capacity) * 100);
            const isFull = passengers.length >= capacity;

            return (
              <div
                key={viagem.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Trip Header Banner */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 font-mono text-sm">
                          {viagem.codigo_viagem}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            viagem.status_viagem === 'Programada'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : viagem.status_viagem === 'Em Andamento'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : viagem.status_viagem === 'Finalizada'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {viagem.status_viagem}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 flex items-center gap-3 mt-1 flex-wrap font-medium">
                        <span className="flex items-center gap-1 font-bold text-slate-900">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                          Destino: {viagem.cidade_destino}
                        </span>
                        <span className="flex items-center gap-1 text-slate-700 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDateBR(viagem.data_partida)}
                        </span>
                        <span className="flex items-center gap-1 text-slate-700 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Saída: {viagem.horario_partida}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Control */}
                  <div className="flex items-center gap-2">
                    <select
                      value={viagem.status_viagem}
                      onChange={(e) => handleUpdateTripStatus(viagem.id, e.target.value as ViagemStatus)}
                      className="text-xs font-semibold p-1.5 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Programada">Programada</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Finalizada">Finalizada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>

                    <button
                      onClick={() => setSelectedTripForAllocation(viagem)}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Users className="w-4 h-4" />
                      Alocar Passageiros
                    </button>
                  </div>
                </div>

                {/* Trip Logistics details */}
                <div className="p-4 bg-slate-50/20 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                      Veículo & Placa
                    </span>
                    <span className="font-bold text-slate-800 block">
                      {veiculo?.modelo}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      Placa: {veiculo?.placa} ({veiculo?.tipo_veiculo})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                      Motorista Municipal
                    </span>
                    <span className="font-bold text-slate-800 block">
                      {motorista?.nome_completo}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      CNH: {motorista?.cnh} (Cat. {motorista?.categoria_cnh}) • Tel: {motorista?.celular}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="text-slate-500 font-semibold">Ocupação do Veículo</span>
                      <span className="font-mono font-bold text-slate-900">
                        {passengers.length} / {capacity} poltronas ({occupancyPercentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? 'bg-red-500' : occupancyPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Ponto: {viagem.ponto_encontro}
                    </span>
                  </div>
                </div>

                {/* Allocated Passenger Seats Table */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Armchair className="w-4 h-4 text-emerald-700" />
                      Passageiros Alocados nesta Viagem ({passengers.length})
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Vouchers com QR Code e bobina 58mm prontos para emissão
                    </span>
                  </div>

                  {passengers.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs">
                      Nenhum paciente alocado nesta viagem ainda. Clique em "Alocar Passageiros" para selecionar solicitações aprovadas.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-y border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Poltrona</th>
                            <th className="py-2.5 px-3">Passageiro</th>
                            <th className="py-2.5 px-3">Tipo</th>
                            <th className="py-2.5 px-3">Documentos</th>
                            <th className="py-2.5 px-3">Token Voucher</th>
                            <th className="py-2.5 px-3">Presença</th>
                            <th className="py-2.5 px-3 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {passengers
                            .sort((a, b) => a.numero_poltrona - b.numero_poltrona)
                            .map((p) => {
                              return (
                                <tr key={p.id} className="hover:bg-slate-50">
                                  <td className="py-2.5 px-3">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 font-mono font-black text-xs">
                                      {String(p.numero_poltrona).padStart(2, '0')}
                                    </span>
                                  </td>

                                  <td className="py-2.5 px-3">
                                    <div className="font-bold text-slate-900">{p.nome_passageiro}</div>
                                  </td>

                                  <td className="py-2.5 px-3">
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                        p.tipo_passageiro === 'Paciente'
                                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                                          : 'bg-purple-50 text-purple-700 border-purple-200'
                                      }`}
                                    >
                                      {p.tipo_passageiro}
                                    </span>
                                  </td>

                                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                                    <div>CPF: {p.cpf_passageiro}</div>
                                    {p.cartao_sus_passageiro && (
                                      <div className="text-[10px] text-slate-400">CNS: {p.cartao_sus_passageiro}</div>
                                    )}
                                  </td>

                                  <td className="py-2.5 px-3">
                                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                      {p.voucher_token}
                                    </span>
                                  </td>

                                  <td className="py-2.5 px-3">
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                        p.status_presenca === 'Embarcou'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : p.status_presenca === 'Faltou'
                                          ? 'bg-red-50 text-red-700 border-red-200'
                                          : 'bg-slate-100 text-slate-600 border-slate-200'
                                      }`}
                                    >
                                      {p.status_presenca}
                                    </span>
                                  </td>

                                  <td className="py-2.5 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => onOpenThermalVoucher(p, viagem)}
                                        className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                                        title="Imprimir Cupom Térmico 58mm"
                                      >
                                        <QrCode className="w-3.5 h-3.5" />
                                        Voucher 58mm
                                      </button>
                                      <button
                                        onClick={() => {
                                          const sol = db.solicitacoes_tfd.find((s) => s.id === p.solicitacao_id);
                                          if (sol) onOpenOrdemTFD(sol, viagem);
                                        }}
                                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                                        title="Gerar Ordem de Transporte TFD Gratuita (A4)"
                                      >
                                        <FileBadge className="w-3.5 h-3.5 text-emerald-700" />
                                        <span>Ordem Gratuita</span>
                                      </button>
                                      <button
                                        onClick={() => handleRemovePassenger(p.id)}
                                        title="Remover passageiro da viagem"
                                        className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: VEÍCULOS & MOTORISTAS */}
      {activeTab === 'frota_motoristas' && (
        <div className="space-y-8">
          {/* Section: Veículos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-700" />
                  Veículos da Frota Municipal de Saúde
                </h3>
                <p className="text-xs text-slate-500">
                  Vans adaptadas para PNE, micro-ônibus e ônibus cadastrados para TFD
                </p>
              </div>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Cadastrar Veículo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {db.veiculos.map((v) => (
                <div key={v.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-extrabold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {v.placa}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        v.status === 'Ativo'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : v.status === 'Em Manutenção'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-800 leading-tight">
                    {v.modelo}
                  </div>
                  <div className="text-xs text-slate-600 flex justify-between pt-2 border-t border-slate-100">
                    <span>Tipo: <b>{v.tipo_veiculo}</b></span>
                    <span>Capacidade: <b className="font-mono">{v.capacidade_passageiros} lug.</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Motoristas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-700" />
                  Motoristas Habilitados para TFD
                </h3>
                <p className="text-xs text-slate-500">
                  Condutores municipais com CNH categorias D e E e curso de transporte coletivo
                </p>
              </div>
              <button
                onClick={() => setShowAddDriverModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Cadastrar Motorista
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {db.motoristas.map((m) => (
                <div key={m.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="font-bold text-slate-900 text-xs">
                    {m.nome_completo}
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono space-y-0.5">
                    <div>CNH: <b>{m.cnh}</b> (Categoria {m.categoria_cnh})</div>
                    <div>CPF: {m.cpf}</div>
                    <div>Celular / Plantão: {m.celular}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROGRAMAR NOVA VIAGEM */}
      {showNewTripModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Bus className="w-4 h-4 text-emerald-700" />
                Programar Nova Viagem de TFD
              </h3>
              <button
                onClick={() => setShowNewTripModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="p-6 space-y-4 text-xs">
              {tripError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{tripError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cidade Destino
                  </label>
                  <select
                    value={cidadeDestino}
                    onChange={(e) => setCidadeDestino(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Salvador">Salvador / BA (Capital)</option>
                    <option value="Feira de Santana">Feira de Santana / BA</option>
                    <option value="Recife">Recife / PE</option>
                    <option value="Barretos">Barretos / SP</option>
                    <option value="Belo Horizonte">Belo Horizonte / MG</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Data de Partida
                  </label>
                  <input
                    type="date"
                    value={dataPartida}
                    onChange={(e) => setDataPartida(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Horário de Saída
                  </label>
                  <input
                    type="time"
                    value={horarioPartida}
                    onChange={(e) => setHorarioPartida(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Veículo Designado
                  </label>
                  <select
                    value={veiculoId}
                    onChange={(e) => setVeiculoId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {db.veiculos
                      .filter((v) => v.status === 'Ativo')
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.placa} - {v.modelo} ({v.capacidade_passageiros} assentos)
                        </option>
                      ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Motorista Designado
                  </label>
                  <select
                    value={motoristaId}
                    onChange={(e) => setMotoristaId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {db.motoristas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome_completo} (CNH Cat. {m.categoria_cnh})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ponto de Encontro / Embarque
                  </label>
                  <input
                    type="text"
                    value={pontoEncontro}
                    onChange={(e) => setPontoEncontro(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Observações / Roteiro dos Hospitais
                  </label>
                  <textarea
                    rows={2}
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Ex: Paradas no Hospital das Clínicas e Aristides Maltez..."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewTripModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer"
                >
                  Confirmar Programação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ALOCAR PASSAGEIROS NA VIAGEM */}
      {selectedTripForAllocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-6">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-emerald-700" />
                  Alocação de Passageiros na Viagem: {selectedTripForAllocation.codigo_viagem}
                </h3>
                <p className="text-xs text-slate-500">
                  Destino: {selectedTripForAllocation.cidade_destino} • Data: {formatDateBR(selectedTripForAllocation.data_partida)}
                </p>
              </div>
              <button
                onClick={() => setSelectedTripForAllocation(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Current Occupancy status */}
              {(() => {
                const veiculo = db.veiculos.find((v) => v.id === selectedTripForAllocation.veiculo_id);
                const capacity = veiculo?.capacidade_passageiros || 15;
                const currentPassengers = db.passageiros_viagem.filter(
                  (p) => p.viagem_id === selectedTripForAllocation.id
                );
                const remainingSeats = capacity - currentPassengers.length;

                // Find candidate approved solicitations for this destination that are NOT yet allocated
                const candidateSolicitacoes = db.solicitacoes_tfd.filter((s) => {
                  if (s.status !== 'Aprovado') return false;
                  // check if already allocated to this trip
                  const alreadyAllocated = currentPassengers.some((p) => p.solicitacao_id === s.id);
                  return !alreadyAllocated;
                });

                return (
                  <>
                    <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-emerald-950 text-sm block">
                          Capacidade do Veículo: {currentPassengers.length} de {capacity} assentos ocupados
                        </span>
                        <span className="text-emerald-700 text-xs">
                          {remainingSeats > 0
                            ? `Restam ${remainingSeats} poltrona(s) disponível(is) para esta viagem.`
                            : 'Veículo com lotação esgotada!'}
                        </span>
                      </div>
                      <div className="font-mono text-xl font-black text-emerald-900 bg-white px-3 py-1.5 rounded-lg border border-emerald-300">
                        {remainingSeats} livres
                      </div>
                    </div>

                    {/* Candidate Solicitations List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                          Solicitações Aprovadas Disponíveis ({candidateSolicitacoes.length})
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Clique em "Alocar" para reservar poltrona
                        </span>
                      </div>

                      {candidateSolicitacoes.length === 0 ? (
                        <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-500">
                          Não há outras solicitações aprovadas aguardando vaga neste momento.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {candidateSolicitacoes.map((sol) => {
                            const paciente = db.pacientes.find((p) => p.id === sol.paciente_id);
                            const acomp = db.acompanhantes.find((a) => a.solicitacao_id === sol.id);
                            const needed = sol.requer_acompanhante ? 2 : 1;

                            return (
                              <div
                                key={sol.id}
                                className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-emerald-300 flex items-center justify-between gap-4"
                              >
                                <div className="space-y-1 min-w-0">
                                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                                    <span>{paciente?.nome_completo}</span>
                                    <span className="text-[10px] font-mono text-slate-500 font-normal">
                                      CPF: {paciente?.cpf}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-600">
                                    Hospital: <b>{sol.hospital_destino}</b> ({sol.cidade_destino}) • CID: {sol.cid_10}
                                  </div>
                                  {sol.requer_acompanhante && acomp && (
                                    <div className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60 inline-block">
                                      + Acompanhante: {acomp.nome_completo} ({acomp.grau_parentesco})
                                    </div>
                                  )}
                                </div>

                                <div className="shrink-0 flex items-center gap-2">
                                  <button
                                    onClick={() => handleAllocatePassenger(selectedTripForAllocation, sol, sol.requer_acompanhante)}
                                    disabled={remainingSeats < needed}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                      remainingSeats < needed
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                    }`}
                                  >
                                    Alocar {needed > 1 ? '(2 Vagas)' : '(1 Vaga)'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedTripForAllocation(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs cursor-pointer"
              >
                Concluir Alocação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD VEHICLE */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Cadastrar Novo Veículo TFD</h3>
              <button onClick={() => setShowAddVehicleModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddVehicle} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Placa do Veículo</label>
                <input
                  type="text"
                  value={newPlaca}
                  onChange={(e) => setNewPlaca(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC-1D23"
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono uppercase"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Modelo e Detalhes</label>
                <input
                  type="text"
                  value={newModelo}
                  onChange={(e) => setNewModelo(e.target.value)}
                  placeholder="Ex: Renault Master 2.3 dCi 16L"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacidade (Lugares)</label>
                  <input
                    type="number"
                    value={newCapacidade}
                    onChange={(e) => setNewCapacidade(Number(e.target.value))}
                    min={2}
                    max={60}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Veículo</label>
                  <select
                    value={newTipoVeiculo}
                    onChange={(e) => setNewTipoVeiculo(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Van">Van</option>
                    <option value="Micro-ônibus">Micro-ônibus</option>
                    <option value="Ônibus">Ônibus</option>
                    <option value="Carro Utilitário">Carro Utilitário</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Salvar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DRIVER */}
      {showAddDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Cadastrar Novo Motorista</h3>
              <button onClick={() => setShowAddDriverModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddDriver} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={newNomeMot}
                  onChange={(e) => setNewNomeMot(e.target.value)}
                  placeholder="Ex: João Carlos da Silva"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CPF</label>
                  <input
                    type="text"
                    value={newCpfMot}
                    onChange={(e) => setNewCpfMot(maskCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Celular / WhatsApp</label>
                  <input
                    type="text"
                    value={newTelMot}
                    onChange={(e) => setNewTelMot(maskPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Número CNH</label>
                  <input
                    type="text"
                    value={newCnhMot}
                    onChange={(e) => setNewCnhMot(e.target.value)}
                    placeholder="00000000000"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria CNH</label>
                  <select
                    value={newCatCnh}
                    onChange={(e) => setNewCatCnh(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="D">Categoria D (Vans e Micro-ônibus)</option>
                    <option value="E">Categoria E (Ônibus e Articulados)</option>
                    <option value="C">Categoria C</option>
                    <option value="B">Categoria B</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDriverModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Salvar Motorista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
