import React, { useState } from 'react';
import { 
  getTFDDatabase, 
  saveTFDDatabase, 
  resetTFDDatabase, 
  getActiveUser, 
  setActiveUser 
} from './services/storage';
import { 
  TFDDatabase, 
  UsuarioSistema, 
  PassageiroViagem, 
  ViagemAgendada, 
  DiariaAjudaCusto,
  SolicitacaoTFD 
} from './types/tfd';

import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { MonitoramentoTempoRealModulo } from './components/MonitoramentoTempoRealModulo';
import { TriagemModulo } from './components/TriagemModulo';
import { FrotaViagensModulo } from './components/FrotaViagensModulo';
import { EmbarqueModulo } from './components/EmbarqueModulo';
import { DiariasModulo } from './components/DiariasModulo';
import { ThermalVoucherModal } from './components/ThermalVoucherModal';
import { ReceiptModal } from './components/ReceiptModal';
import { OrdemTFDModal } from './components/OrdemTFDModal';
import { EtiquetaPacienteModal } from './components/EtiquetaPacienteModal';
import { EmitirOSModal } from './components/EmitirOSModal';
import { Building2 } from 'lucide-react';

export default function App() {
  const [db, setDb] = useState<TFDDatabase>(() => getTFDDatabase());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeUser, setActiveUserState] = useState<UsuarioSistema>(() => getActiveUser());
  const [selectedViagemIdForEmbarque, setSelectedViagemIdForEmbarque] = useState<string | null>(null);

  // Thermal voucher modal state
  const [thermalModalState, setThermalModalState] = useState<{
    isOpen: boolean;
    passageiro: PassageiroViagem | null;
    viagem: ViagemAgendada | null;
  }>({
    isOpen: false,
    passageiro: null,
    viagem: null,
  });

  // Receipt modal state
  const [receiptModalState, setReceiptModalState] = useState<{
    isOpen: boolean;
    diaria: DiariaAjudaCusto | null;
  }>({
    isOpen: false,
    diaria: null,
  });

  // Ordem TFD Gratuita modal state
  const [ordemModalState, setOrdemModalState] = useState<{
    isOpen: boolean;
    solicitacao: SolicitacaoTFD | null;
    viagem: ViagemAgendada | null;
  }>({
    isOpen: false,
    solicitacao: null,
    viagem: null,
  });

  // Etiqueta / Papel de bolso do Paciente state
  const [etiquetaModalState, setEtiquetaModalState] = useState<{
    isOpen: boolean;
    solicitacao: SolicitacaoTFD | null;
  }>({
    isOpen: false,
    solicitacao: null,
  });

  // Fast Emitir OS modal state
  const [showEmitirOSModal, setShowEmitirOSModal] = useState<boolean>(false);

  // Persist DB state changes
  const handleUpdateDb = (updater: (prev: TFDDatabase) => TFDDatabase) => {
    setDb((prev) => {
      const next = updater(prev);
      saveTFDDatabase(next);
      return next;
    });
  };

  const handleSelectUser = (user: UsuarioSistema) => {
    setActiveUserState(user);
    setActiveUser(user);
  };

  const handleResetData = () => {
    if (window.confirm('Deseja restaurar os dados de demonstração iniciais do TFD Municipal? Todas as alterações manuais serão resetadas.')) {
      const fresh = resetTFDDatabase();
      setDb(fresh);
      alert('Dados restaurados com sucesso!');
    }
  };

  // Open thermal ticket modal
  const handleOpenThermalVoucher = (p: PassageiroViagem, v: ViagemAgendada) => {
    setThermalModalState({
      isOpen: true,
      passageiro: p,
      viagem: v,
    });
  };

  // Open receipt modal
  const handleOpenReceipt = (diaria: DiariaAjudaCusto) => {
    setReceiptModalState({
      isOpen: true,
      diaria,
    });
  };

  // Open Ordem TFD Gratuita modal
  const handleOpenOrdemTFD = (sol: SolicitacaoTFD, viagem?: ViagemAgendada) => {
    let trip: ViagemAgendada | null | undefined = viagem;
    if (!trip) {
      const pass = db.passageiros_viagem.find((p) => p.solicitacao_id === sol.id);
      if (pass) {
        trip = db.viagens_agendadas.find((v) => v.id === pass.viagem_id) || null;
      }
    }
    setOrdemModalState({
      isOpen: true,
      solicitacao: sol,
      viagem: trip || null,
    });
  };

  // Open Etiqueta do Paciente modal
  const handleOpenEtiqueta = (sol: SolicitacaoTFD) => {
    setEtiquetaModalState({
      isOpen: true,
      solicitacao: sol,
    });
  };

  // When a new OS is emitted from the modal: save in DB and immediately open Etiqueta
  const handleSuccessEmitida = (novaSol: SolicitacaoTFD) => {
    handleUpdateDb((prev) => ({
      ...prev,
      solicitacoes_tfd: [novaSol, ...prev.solicitacoes_tfd.filter((s) => s.id !== novaSol.id)],
    }));
    // Open the printed slip for the patient
    handleOpenEtiqueta(novaSol);
  };

  // Quick navigation to Embarque for a specific trip
  const handleSelectViagemEmbarque = (viagemId: string) => {
    setSelectedViagemIdForEmbarque(viagemId);
    setCurrentTab('embarque');
  };

  // Counts for navbar badges
  const pendingCount = db.solicitacoes_tfd.filter((s) => s.status === 'Pendente').length;
  const tripsTodayCount = db.viagens_agendadas.filter((v) => v.status_viagem === 'Programada').length;

  // Selected entities for Thermal Voucher modal
  const activePassageiro = thermalModalState.passageiro;
  const activeViagem = thermalModalState.viagem;
  const activeSol = db.solicitacoes_tfd.find((s) => s.id === activePassageiro?.solicitacao_id) || null;
  const activePac = db.pacientes.find((p) => p.id === activeSol?.paciente_id) || null;
  const activeAcomp = db.acompanhantes.find((a) => a.solicitacao_id === activeSol?.id) || null;
  const activeVeiculo = db.veiculos.find((v) => v.id === activeViagem?.veiculo_id) || null;
  const activeMotorista = db.motoristas.find((m) => m.id === activeViagem?.motorista_id) || null;

  // Selected entities for Receipt modal
  const receiptDiaria = receiptModalState.diaria;
  const receiptSol = db.solicitacoes_tfd.find((s) => s.id === receiptDiaria?.solicitacao_id) || null;
  const receiptPac = db.pacientes.find((p) => p.id === receiptSol?.paciente_id) || null;
  const receiptAcomp = db.acompanhantes.find((a) => a.solicitacao_id === receiptSol?.id) || null;

  // Selected entities for Ordem TFD Gratuita modal
  const ordemSol = ordemModalState.solicitacao;
  const ordemPac = db.pacientes.find((p) => p.id === ordemSol?.paciente_id) || null;
  const ordemAcomp = db.acompanhantes.find((a) => a.solicitacao_id === ordemSol?.id) || null;
  const ordemViagem = ordemModalState.viagem;
  const ordemVeiculo = db.veiculos.find((v) => v.id === ordemViagem?.veiculo_id) || null;
  const ordemMotorista = db.motoristas.find((m) => m.id === ordemViagem?.motorista_id) || null;

  // Selected entities for Etiqueta do Paciente modal
  const etiqSol = etiquetaModalState.solicitacao;
  const etiqPac = db.pacientes.find((p) => p.id === etiqSol?.paciente_id) || null;
  const etiqAcomp = db.acompanhantes.find((a) => a.solicitacao_id === etiqSol?.id) || null;
  const etiqPonto = db.pontos_espera.find(
    (pt) => pt.id === etiqSol?.ponto_espera_id || pt.nome === etiqSol?.ponto_espera_nome
  ) || null;
  const etiqPassageiro = db.passageiros_viagem.find((pv) => pv.solicitacao_id === etiqSol?.id) || null;
  const etiqViagem = etiqPassageiro ? db.viagens_agendadas.find((vg) => vg.id === etiqPassageiro.viagem_id) || null : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeUser={activeUser}
        onSelectUser={handleSelectUser}
        usersList={db.usuarios_sistema}
        onResetData={handleResetData}
        pendingCount={pendingCount}
        tripsTodayCount={tripsTodayCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <Dashboard
            db={db}
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectViagemEmbarque={handleSelectViagemEmbarque}
            onOpenOrdemTFD={handleOpenOrdemTFD}
          />
        )}

        {currentTab === 'monitoramento' && (
          <MonitoramentoTempoRealModulo
            db={db}
            activeUser={activeUser}
            onOpenEtiqueta={handleOpenEtiqueta}
            onOpenOrdemTFD={handleOpenOrdemTFD}
            onEmitirNovaOS={() => setShowEmitirOSModal(true)}
          />
        )}

        {currentTab === 'triagem' && (
          <TriagemModulo
            db={db}
            onUpdateDb={handleUpdateDb}
            onOpenOrdemTFD={handleOpenOrdemTFD}
            onOpenEtiqueta={handleOpenEtiqueta}
          />
        )}

        {currentTab === 'frota' && (
          <FrotaViagensModulo
            db={db}
            onUpdateDb={handleUpdateDb}
            onOpenThermalVoucher={handleOpenThermalVoucher}
            onOpenOrdemTFD={handleOpenOrdemTFD}
          />
        )}

        {currentTab === 'embarque' && (
          <EmbarqueModulo
            db={db}
            selectedViagemId={selectedViagemIdForEmbarque}
            onUpdateDb={handleUpdateDb}
            onOpenThermalVoucher={handleOpenThermalVoucher}
            onOpenOrdemTFD={handleOpenOrdemTFD}
          />
        )}

        {currentTab === 'diarias' && (
          <DiariasModulo
            db={db}
            onUpdateDb={handleUpdateDb}
            onOpenReceiptModal={handleOpenReceipt}
          />
        )}
      </main>

      {/* Municipal Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-700">Central TFD Municipal</span>
            <span>•</span>
            <span>Secretaria Municipal de Saúde</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">TRANSPORTE 100% GRATUITO PELO SUS</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Portaria SAS/MS nº 055/1999</span>
            <span>•</span>
            <span>Lei Federal nº 8.080/1990</span>
            <span>•</span>
            <span>Versão 2.5.0 Estável</span>
          </div>
        </div>
      </footer>

      {/* Thermal 58mm Voucher Modal */}
      <ThermalVoucherModal
        isOpen={thermalModalState.isOpen}
        onClose={() => setThermalModalState({ isOpen: false, passageiro: null, viagem: null })}
        passageiro={activePassageiro}
        viagem={activeViagem}
        solicitacao={activeSol}
        paciente={activePac}
        acompanhante={activeAcomp}
        veiculo={activeVeiculo}
        motorista={activeMotorista}
      />

      {/* A4 Printable Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalState.isOpen}
        onClose={() => setReceiptModalState({ isOpen: false, diaria: null })}
        diaria={receiptDiaria}
        solicitacao={receiptSol}
        paciente={receiptPac}
        acompanhante={receiptAcomp}
      />

      {/* Ordem de Transporte TFD Gratuita Modal */}
      <OrdemTFDModal
        isOpen={ordemModalState.isOpen}
        onClose={() => setOrdemModalState({ isOpen: false, solicitacao: null, viagem: null })}
        solicitacao={ordemSol}
        paciente={ordemPac}
        acompanhante={ordemAcomp}
        viagem={ordemViagem}
        veiculo={ordemVeiculo}
        motorista={ordemMotorista}
      />

      {/* Etiqueta / Papel de Viagem do Paciente Modal */}
      <EtiquetaPacienteModal
        isOpen={etiquetaModalState.isOpen}
        onClose={() => setEtiquetaModalState({ isOpen: false, solicitacao: null })}
        solicitacao={etiqSol}
        paciente={etiqPac}
        acompanhante={etiqAcomp}
        pontoEspera={etiqPonto}
        viagem={etiqViagem}
        passageiroViagem={etiqPassageiro}
      />

      {/* Emitir OS Rápida com Ponto de Espera Modal */}
      <EmitirOSModal
        isOpen={showEmitirOSModal}
        onClose={() => setShowEmitirOSModal(false)}
        db={db}
        activeUser={activeUser}
        onSuccessEmitida={handleSuccessEmitida}
      />
    </div>
  );
}
