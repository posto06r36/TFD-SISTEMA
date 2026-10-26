import React, { useState, useEffect } from 'react';
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
  SolicitacaoTFD,
  Paciente 
} from './types/tfd';

import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { MonitoramentoTempoRealModulo } from './components/MonitoramentoTempoRealModulo';
import { TriagemModulo } from './components/TriagemModulo';
import { FrotaViagensModulo } from './components/FrotaViagensModulo';
import { EmbarqueModulo } from './components/EmbarqueModulo';
import { DiariasModulo } from './components/DiariasModulo';
import { OperadoresModulo } from './components/OperadoresModulo';
import { OrdensEmitidasModulo } from './components/OrdensEmitidasModulo';
import { ThermalVoucherModal } from './components/ThermalVoucherModal';
import { ReceiptModal } from './components/ReceiptModal';
import { OrdemTFDModal } from './components/OrdemTFDModal';
import { EtiquetaPacienteModal } from './components/EtiquetaPacienteModal';
import { EmitirOSModal } from './components/EmitirOSModal';
import { CadastroPacienteModal } from './components/CadastroPacienteModal';
import { GoogleSheetsManagerModal } from './components/GoogleSheetsManagerModal';
import { initAuth, subscribeAuth, getAccessToken } from './services/googleAuth';
import { 
  GoogleSheetMeta, 
  findTFDSpreadsheet, 
  pushDatabaseToSheets, 
  getStoredSpreadsheetId 
} from './services/googleSheetsService';
import { Building2 } from 'lucide-react';

export default function App() {
  const [db, setDb] = useState<TFDDatabase>(() => getTFDDatabase());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeUser, setActiveUserState] = useState<UsuarioSistema | null>(() => getActiveUser());
  const [selectedViagemIdForEmbarque, setSelectedViagemIdForEmbarque] = useState<string | null>(null);

  // Google Sheets Workspace State
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [sheetMeta, setSheetMeta] = useState<GoogleSheetMeta | null>(null);
  const [showGoogleSheetsModal, setShowGoogleSheetsModal] = useState<boolean>(false);

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
  const [selectedPatientForOS, setSelectedPatientForOS] = useState<string | null>(null);

  // Dedicated Cadastro Paciente modal state
  const [showCadastroPacienteModal, setShowCadastroPacienteModal] = useState<boolean>(false);

  // Initialize Google Auth & Sheets connection
  useEffect(() => {
    initAuth();
    const unsubscribe = subscribeAuth(async (user, token) => {
      setGoogleUser(user);
      setGoogleToken(token);
      if (token) {
        // Try to find the existing TFD spreadsheet in Google Drive
        const found = await findTFDSpreadsheet(token);
        if (found) {
          setSheetMeta(found);
        } else {
          const storedId = getStoredSpreadsheetId();
          if (storedId) {
            setSheetMeta({
              id: storedId,
              name: 'Central TFD Municipal - Banco de Dados',
              webViewLink: `https://docs.google.com/spreadsheets/d/${storedId}/edit`,
            });
          }
        }
      } else {
        setSheetMeta(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Persist DB state changes and sync to Google Sheets if connected
  const handleUpdateDb = (updater: (prev: TFDDatabase) => TFDDatabase) => {
    setDb((prev) => {
      const next = updater(prev);
      saveTFDDatabase(next);

      // Background sync to Google Sheets if active
      if (googleToken && sheetMeta) {
        pushDatabaseToSheets(googleToken, sheetMeta.id, next).catch((err) => {
          console.warn('Background sync to Google Sheets failed:', err);
        });
      }

      return next;
    });
  };

  const handleLoginSuccess = (user: UsuarioSistema) => {
    setActiveUserState(user);
    setActiveUser(user);
  };

  const handleLogout = () => {
    setActiveUserState(null);
    setActiveUser(null);
    setCurrentTab('dashboard');
  };

  const handleResetData = () => {
    if (window.confirm('Deseja restaurar a base de dados inicial com 1 exemplo de cada serviço e o acesso Master (13012994483)? Todas as alterações manuais serão resetadas.')) {
      const fresh = resetTFDDatabase();
      setDb(fresh);
      alert('Dados restaurados com sucesso! Base limpa com 1 exemplo de cada serviço.');
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

  // When a new OS is emitted: save in DB, navigate to the Ordens tab, and open print modal
  const handleSuccessEmitida = (novaSol: SolicitacaoTFD) => {
    handleUpdateDb((prev) => ({
      ...prev,
      solicitacoes_tfd: [novaSol, ...prev.solicitacoes_tfd.filter((s) => s.id !== novaSol.id)],
    }));
    // Redirect to the Ordens TFD tab so the Master immediately sees the patient name on top
    setCurrentTab('ordens');
    // Open the official printable order
    handleOpenOrdemTFD(novaSol);
  };

  // Quick action from patient list to issue order
  const handleOpenEmitirOSForPatient = (patientId?: string) => {
    setSelectedPatientForOS(patientId || null);
    setShowEmitirOSModal(true);
  };

  // Saving patient from direct modal
  const handleSavePaciente = (novoPaciente: Paciente, abrirOrdemDireta?: boolean) => {
    handleUpdateDb((prev) => ({
      ...prev,
      pacientes: [novoPaciente, ...prev.pacientes.filter((p) => p.id !== novoPaciente.id)],
    }));

    if (abrirOrdemDireta) {
      setSelectedPatientForOS(novoPaciente.id);
      setShowEmitirOSModal(true);
    }
  };

  // Quick navigation to Embarque for a specific trip
  const handleSelectViagemEmbarque = (viagemId: string) => {
    setSelectedViagemIdForEmbarque(viagemId);
    setCurrentTab('embarque');
  };

  // If user is not authenticated, show municipal login screen
  if (!activeUser) {
    return <LoginScreen db={db} onLoginSuccess={handleLoginSuccess} />;
  }

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
        onLogout={handleLogout}
        onOpenCadastroPaciente={() => setShowCadastroPacienteModal(true)}
        onOpenEmitirOS={() => handleOpenEmitirOSForPatient()}
        onResetData={handleResetData}
        pendingCount={pendingCount}
        tripsTodayCount={tripsTodayCount}
        totalOrdersCount={db.solicitacoes_tfd.length}
        googleUser={googleUser}
        sheetMeta={sheetMeta}
        onOpenGoogleSheetsModal={() => setShowGoogleSheetsModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <Dashboard
            db={db}
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectViagemEmbarque={handleSelectViagemEmbarque}
            onOpenOrdemTFD={handleOpenOrdemTFD}
            sheetMeta={sheetMeta}
            onOpenGoogleSheetsModal={() => setShowGoogleSheetsModal(true)}
          />
        )}

        {currentTab === 'ordens' && (
          <OrdensEmitidasModulo
            db={db}
            activeUser={activeUser}
            onOpenOrdemTFD={handleOpenOrdemTFD}
            onOpenEtiqueta={handleOpenEtiqueta}
            onOpenEmitirOS={() => handleOpenEmitirOSForPatient()}
          />
        )}

        {currentTab === 'monitoramento' && (
          <MonitoramentoTempoRealModulo
            db={db}
            activeUser={activeUser}
            onOpenEtiqueta={handleOpenEtiqueta}
            onOpenOrdemTFD={handleOpenOrdemTFD}
            onEmitirNovaOS={() => handleOpenEmitirOSForPatient()}
          />
        )}

        {currentTab === 'triagem' && (
          <TriagemModulo
            db={db}
            onUpdateDb={handleUpdateDb}
            onOpenOrdemTFD={handleOpenOrdemTFD}
            onOpenEtiqueta={handleOpenEtiqueta}
            onOpenCadastroModal={() => setShowCadastroPacienteModal(true)}
            onOpenEmitirOS={handleOpenEmitirOSForPatient}
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

        {currentTab === 'operadores' && (
          <OperadoresModulo
            db={db}
            activeUser={activeUser}
            onUpdateDb={handleUpdateDb}
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
            <span>Versão 3.0.0 Oficial</span>
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
        onClose={() => {
          setShowEmitirOSModal(false);
          setSelectedPatientForOS(null);
        }}
        db={db}
        activeUser={activeUser}
        onSuccessEmitida={handleSuccessEmitida}
        preSelectedPatientId={selectedPatientForOS}
      />

      {/* Direct Cadastro Paciente Modal */}
      <CadastroPacienteModal
        isOpen={showCadastroPacienteModal}
        onClose={() => setShowCadastroPacienteModal(false)}
        db={db}
        onSavePaciente={handleSavePaciente}
      />

      {/* Google Sheets Database Manager Modal */}
      <GoogleSheetsManagerModal
        isOpen={showGoogleSheetsModal}
        onClose={() => setShowGoogleSheetsModal(false)}
        database={db}
        onDatabaseUpdate={(newDb) => {
          setDb(newDb);
          saveTFDDatabase(newDb);
        }}
        googleUser={googleUser}
        accessToken={googleToken}
        sheetMeta={sheetMeta}
        onSheetMetaChange={setSheetMeta}
      />
    </div>
  );
}
