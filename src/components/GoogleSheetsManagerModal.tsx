import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  LogOut, 
  Database, 
  ShieldCheck,
  Download,
  Info
} from 'lucide-react';
import { googleSignIn, googleSignOut } from '../services/googleAuth';
import { 
  GoogleSheetMeta, 
  createTFDSpreadsheet, 
  pushDatabaseToSheets, 
  pullDatabaseFromSheets,
  setStoredSpreadsheetId
} from '../services/googleSheetsService';
import { TFDDatabase } from '../types/tfd';

interface GoogleSheetsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: TFDDatabase;
  onDatabaseUpdate: (newDb: TFDDatabase) => void;
  googleUser: any;
  accessToken: string | null;
  sheetMeta: GoogleSheetMeta | null;
  onSheetMetaChange: (meta: GoogleSheetMeta | null) => void;
}

export const GoogleSheetsManagerModal: React.FC<GoogleSheetsManagerModalProps> = ({
  isOpen,
  onClose,
  database,
  onDatabaseUpdate,
  googleUser,
  accessToken,
  sheetMeta,
  onSheetMetaChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [confirmOverwriteModal, setConfirmOverwriteModal] = useState<null | 'push' | 'pull'>(null);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await googleSignIn();
      if (res) {
        setFeedback({
          type: 'success',
          message: `Conectado com sucesso como ${res.user.email}!`,
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Falha ao conectar com o Google.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleSignOut();
      onSheetMetaChange(null);
      setStoredSpreadsheetId(null);
      setFeedback({
        type: 'info',
        message: 'Desconectado da conta Google.',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: 'Erro ao desconectar.',
      });
    }
  };

  const handleCreateSheet = async () => {
    if (!accessToken) {
      setFeedback({ type: 'error', message: 'Conecte sua conta Google primeiro.' });
      return;
    }
    try {
      setLoading(true);
      setFeedback({ type: 'info', message: 'Criando planilha e estruturando todas as abas no Google Drive...' });
      const meta = await createTFDSpreadsheet(accessToken, database);
      onSheetMetaChange(meta);
      setFeedback({
        type: 'success',
        message: 'Planilha "Central TFD Municipal - Banco de Dados" criada com sucesso e sincronizada no seu Google Drive!',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Erro ao criar planilha no Google Sheets.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExecutePush = async () => {
    if (!accessToken || !sheetMeta) return;
    try {
      setLoading(true);
      setFeedback({ type: 'info', message: 'Enviando todas as tabelas para a planilha Google...' });
      await pushDatabaseToSheets(accessToken, sheetMeta.id, database);
      setFeedback({
        type: 'success',
        message: 'Dados enviados com sucesso para o Google Planilhas!',
      });
      setConfirmOverwriteModal(null);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Erro ao salvar no Google Planilhas.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExecutePull = async () => {
    if (!accessToken || !sheetMeta) return;
    try {
      setLoading(true);
      setFeedback({ type: 'info', message: 'Lendo dados mais recentes do Google Planilhas...' });
      const updatedDb = await pullDatabaseFromSheets(accessToken, sheetMeta.id, database);
      onDatabaseUpdate(updatedDb);
      setFeedback({
        type: 'success',
        message: 'Dados da planilha Google importados para o sistema com sucesso!',
      });
      setConfirmOverwriteModal(null);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Erro ao ler dados do Google Planilhas.',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAsCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "PACIENTES TFD MUNICIPAL\n"
      + "ID,CPF,Cartao_SUS,Nome_Completo,Data_Nascimento,Telefone,Bairro,Grupo\n"
      + database.pacientes.map(p => `"${p.id}","${p.cpf}","${p.cartao_sus}","${p.nome_completo}","${p.data_nascimento}","${p.telefone_whatsapp}","${p.bairro}","${p.grupo_vulnerabilidade}"`).join("\n")
      + "\n\nSOLICITACOES E ORDENS TFD\n"
      + "Ordem,Paciente_ID,CID_10,Especialidade,Hospital_Destino,Cidade_Destino,Data_Consulta,Status\n"
      + database.solicitacoes_tfd.map(s => `"${s.ordem_numero || s.id}","${s.paciente_id}","${s.cid_10}","${s.especialidade_medica}","${s.hospital_destino}","${s.cidade_destino}","${s.data_agendada_consulta}","${s.status}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TFD_Municipal_Backup_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 my-8 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Banco de Dados: Google Planilhas
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800">
                  Google Workspace
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Substitui bancos SQL/Firebase usando uma planilha viva no Google Drive da Prefeitura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mt-4 p-3 rounded-xl text-sm flex items-start gap-2.5 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
            feedback.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> :
             feedback.type === 'error' ? <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" /> :
             <Info className="w-5 h-5 shrink-0 text-blue-600" />}
            <div className="flex-1 text-xs leading-relaxed">{feedback.message}</div>
          </div>
        )}

        {/* Step 1: Google Account Connection */}
        <div className="mt-5 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Conta Google Conectada
                </div>
                {googleUser ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-semibold text-sm text-slate-800">{googleUser.displayName || 'Usuário Google'}</span>
                    <span className="text-xs text-slate-500">({googleUser.email})</span>
                  </div>
                ) : (
                  <div className="text-sm text-slate-600 mt-1">
                    Nenhuma conta Google conectada. Conecte para usar sua planilha como banco.
                  </div>
                )}
              </div>

              <div>
                {googleUser ? (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Desconectar
                  </button>
                ) : (
                  <button
                    onClick={handleSignIn}
                    disabled={loading}
                    className="flex items-center gap-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2 rounded-xl border border-slate-300 shadow-xs hover:shadow transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Conectar Conta Google
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Spreadsheet Status & Management */}
          {googleUser && (
            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200/80">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" /> Planilha do Município (Banco de Dados)
                  </div>
                  
                  {sheetMeta ? (
                    <div className="mt-1.5">
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        {sheetMeta.name}
                        <span className="text-emerald-700 bg-emerald-100 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Conectada e Ativa
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ID: <span className="font-mono text-slate-700">{sheetMeta.id}</span>
                      </p>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <a
                          href={sheetMeta.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-xs transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Abrir no Google Sheets
                        </a>

                        <button
                          onClick={() => setConfirmOverwriteModal('push')}
                          disabled={loading}
                          className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs px-3 py-1.5 rounded-lg border border-slate-300 transition-colors"
                          title="Enviar dados atuais do sistema para a planilha Google"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Enviar Dados para Planilha
                        </button>

                        <button
                          onClick={() => setConfirmOverwriteModal('pull')}
                          disabled={loading}
                          className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs px-3 py-1.5 rounded-lg border border-slate-300 transition-colors"
                          title="Atualizar o sistema com dados da planilha Google"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Baixar Dados da Planilha
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-xs text-slate-600 mb-3">
                        Ainda não encontramos uma planilha configurada no seu Google Drive. Clique abaixo para que o sistema crie a planilha oficial com todas as 10 abas relacionais já formatadas!
                      </p>
                      <button
                        onClick={handleCreateSheet}
                        disabled={loading}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors"
                      >
                        <PlusCircle className="w-4 h-4" /> Criar Planilha TFD no Google Drive
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Abas inclusas na planilha */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
              <span>ESTRUTURA DAS ABAS SINCRONIZADAS:</span>
              <span className="text-[11px] text-slate-500 font-normal">10 abas automáticas</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 1. Pacientes ({database.pacientes.length})
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 2. Solicitacoes_TFD ({database.solicitacoes_tfd.length})
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 3. Viagens ({database.viagens_agendadas.length})
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 4. Passageiros ({database.passageiros_viagem.length})
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 5. Diarias ({database.diarias_ajuda_custo.length})
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 6. Veiculos ({database.veiculos.length})
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 7. Motoristas ({database.motoristas.length})
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 8. Unidades_Saude ({database.unidades_saude.length})
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 9. Pontos_Espera ({database.pontos_espera.length})
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 10. Operadores ({database.usuarios_sistema.length})
              </div>
            </div>
          </div>

          {/* Backup alternativo em CSV */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Sincronização com permissão oficial de leitura e escrita do Google Workspace.
            </div>
            <button
              onClick={exportAsCSV}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1 hover:underline"
            >
              <Download className="w-3.5 h-3.5" /> Baixar Backup em CSV
            </button>
          </div>
        </div>

        {/* Modal de Confirmação para Operações com Planilha (MANDATÓRIO PELAS REGRAS WORKSPACE) */}
        {confirmOverwriteModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70">
            <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-2xl">
              <div className="flex items-center gap-3 text-amber-600 mb-3">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-bold text-slate-900">
                  {confirmOverwriteModal === 'push' 
                    ? 'Confirmar Envio para a Planilha Google?' 
                    : 'Confirmar Atualização a partir da Planilha Google?'}
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {confirmOverwriteModal === 'push'
                  ? 'Esta ação atualizará as 10 abas da sua planilha Google no Drive com todos os dados atuais do sistema do município. Deseja prosseguir?'
                  : 'Esta ação substituirá os registros locais do sistema com as linhas salvas atualmente na sua planilha Google. Deseja prosseguir?'}
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={() => setConfirmOverwriteModal(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmOverwriteModal === 'push' ? handleExecutePush : handleExecutePull}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs"
                >
                  Confirmar e Executar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
