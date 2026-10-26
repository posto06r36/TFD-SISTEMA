import React, { useState } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  UserPlus, 
  Bus, 
  QrCode, 
  Receipt, 
  RotateCcw,
  ShieldCheck, 
  ChevronDown,
  Radio,
  LogOut,
  Users,
  PlusCircle,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { UsuarioSistema, PerfilUsuario } from '../types/tfd';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeUser: UsuarioSistema;
  onLogout: () => void;
  onOpenCadastroPaciente: () => void;
  onOpenEmitirOS: () => void;
  onResetData: () => void;
  pendingCount: number;
  tripsTodayCount: number;
  totalOrdersCount?: number;
  googleUser: any;
  sheetMeta: any;
  onOpenGoogleSheetsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activeUser,
  onLogout,
  onOpenCadastroPaciente,
  onOpenEmitirOS,
  onResetData,
  pendingCount,
  tripsTodayCount,
  totalOrdersCount = 0,
  googleUser,
  sheetMeta,
  onOpenGoogleSheetsModal,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getProfileBadge = (perfil: PerfilUsuario) => {
    switch (perfil) {
      case 'Master':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Operador':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Atendente_PSF':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Fiscal_Embarque':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const isMaster = activeUser.perfil === 'Master';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base tracking-tight leading-tight">
                  Central TFD
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 hidden sm:inline-block">
                  SUS Municipal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none mt-0.5">
                Tratamento Fora do Domicílio
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Painel</span>
            </button>

            <button
              onClick={() => setCurrentTab('monitoramento')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'monitoramento'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-600" />
              <span>Monitoramento</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </button>

            <button
              onClick={() => setCurrentTab('triagem')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'triagem'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Triagem</span>
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-white tabular-nums">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Ordens TFD Emitidas (Master & Operators) */}
            <button
              onClick={() => setCurrentTab('ordens')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'ordens'
                  ? 'bg-emerald-800 text-white font-bold shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'
              }`}
              title="Aba Master: Visualizar pacientes com ordens emitidas e imprimir guias/etiquetas"
            >
              <FileText className="w-4 h-4" />
              <span>Ordens TFD</span>
              {totalOrdersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-600 text-white tabular-nums">
                  {totalOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('frota')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'frota'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bus className="w-4 h-4" />
              <span>Frota & Viagens</span>
            </button>

            <button
              onClick={() => setCurrentTab('embarque')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'embarque'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Embarque & Voucher</span>
              {tripsTodayCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-600 text-white tabular-nums">
                  {tripsTodayCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('diarias')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'diarias'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Ajuda de Custo</span>
            </button>

            {/* Operadores (Accessible to Master) */}
            {isMaster && (
              <button
                onClick={() => setCurrentTab('operadores')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  currentTab === 'operadores'
                    ? 'bg-purple-900 text-white font-semibold'
                    : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Operadores</span>
              </button>
            )}
          </nav>

          {/* Quick Actions Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCadastroPaciente}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
              title="Cadastrar Novo Paciente no SUS"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>+ Paciente</span>
            </button>

            <button
              onClick={onOpenEmitirOS}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
              title="Emitir Ordem TFD Gratuita e Etiqueta"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>+ Fazer Ordem TFD</span>
            </button>

            {/* Google Sheets Database Status Button */}
            <button
              onClick={onOpenGoogleSheetsModal}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                sheetMeta
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : googleUser
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Banco de Dados Google Planilhas (Google Workspace)"
            >
              <FileSpreadsheet className={`w-3.5 h-3.5 ${sheetMeta ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span className="hidden md:inline">
                {sheetMeta ? 'Google Planilha: Ativa' : googleUser ? 'Configurar Planilha' : 'Conectar Planilha'}
              </span>
              {sheetMeta && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>

            {/* User Profile Menu & Logout */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-all text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                  {activeUser.nome_completo.charAt(0)}
                </div>
                <div className="hidden sm:block text-left pr-1">
                  <div className="text-xs font-semibold text-slate-900 leading-tight max-w-[120px] truncate">
                    {activeUser.nome_completo.split(' ')[0]}
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border inline-block ${getProfileBadge(activeUser.perfil)}`}>
                    {activeUser.perfil.replace('_', ' ')}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-scale-in">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Operador Conectado
                    </span>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      {activeUser.nome_completo}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      CPF: {activeUser.cpf}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {activeUser.cargo}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-medium mt-1">
                      {activeUser.ponto_tfd_lotacao || 'Central TFD'}
                    </div>
                  </div>

                  <div className="py-1">
                    {isMaster && (
                      <button
                        onClick={() => {
                          setCurrentTab('operadores');
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-xs text-purple-700 hover:bg-purple-50 transition cursor-pointer font-semibold"
                      >
                        <Users className="w-4 h-4" />
                        <span>Gerenciar Operadores & Acessos</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onResetData();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-400" />
                      <span>Restaurar Base Inicial (1 Exemplo)</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-xs text-rose-600 hover:bg-rose-50 transition cursor-pointer font-bold"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sair do Sistema (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-100 overflow-x-auto text-[11px] gap-1">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-2 py-1 rounded font-medium whitespace-nowrap ${currentTab === 'dashboard' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Painel
          </button>
          <button
            onClick={() => setCurrentTab('monitoramento')}
            className={`px-2 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1 ${currentTab === 'monitoramento' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            <Radio className="w-3 h-3 text-emerald-500" />
            Ao Vivo
          </button>
          <button
            onClick={() => setCurrentTab('triagem')}
            className={`px-2 py-1 rounded font-medium whitespace-nowrap ${currentTab === 'triagem' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Pacientes ({pendingCount})
          </button>
          <button
            onClick={() => setCurrentTab('ordens')}
            className={`px-2 py-1 rounded font-medium whitespace-nowrap flex items-center gap-1 ${currentTab === 'ordens' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-700'}`}
          >
            <FileText className="w-3 h-3 text-emerald-500" />
            Ordens ({totalOrdersCount})
          </button>
          <button
            onClick={() => setCurrentTab('frota')}
            className={`px-2 py-1 rounded font-medium whitespace-nowrap ${currentTab === 'frota' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Frota
          </button>
          <button
            onClick={() => setCurrentTab('embarque')}
            className={`px-2 py-1 rounded font-medium whitespace-nowrap ${currentTab === 'embarque' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Embarque
          </button>
          <button
            onClick={() => setCurrentTab('diarias')}
            className={`px-2 py-1 rounded font-medium whitespace-nowrap ${currentTab === 'diarias' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Diárias
          </button>
          {isMaster && (
            <button
              onClick={() => setCurrentTab('operadores')}
              className={`px-2 py-1 rounded font-medium whitespace-nowrap text-purple-700 ${currentTab === 'operadores' ? 'bg-purple-900 text-white font-bold' : ''}`}
            >
              Operadores
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
