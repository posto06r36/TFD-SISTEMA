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
  Radio
} from 'lucide-react';
import { UsuarioSistema, PerfilUsuario } from '../types/tfd';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeUser: UsuarioSistema;
  onSelectUser: (user: UsuarioSistema) => void;
  usersList: UsuarioSistema[];
  onResetData: () => void;
  pendingCount: number;
  tripsTodayCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activeUser,
  onSelectUser,
  usersList,
  onResetData,
  pendingCount,
  tripsTodayCount,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);

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

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
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
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
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
              <span>Triagem & Pacientes</span>
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-white tabular-nums">
                  {pendingCount}
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
          </nav>

          {/* Right Action / Profile Switcher */}
          <div className="flex items-center gap-2">
            {/* Reset Data Button */}
            <button
              onClick={onResetData}
              title="Restaurar dados de demonstração iniciais"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span className="hidden xl:inline text-xs text-slate-600">Restaurar Dados</span>
            </button>

            {/* Profile Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-all text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                  {activeUser.nome_completo.charAt(0)}
                </div>
                <div className="hidden sm:block text-left pr-1">
                  <div className="text-xs font-semibold text-slate-900 leading-tight max-w-[130px] truncate">
                    {activeUser.nome_completo.split(' ')[0]} {activeUser.nome_completo.split(' ').slice(-1)[0]}
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border inline-block ${getProfileBadge(activeUser.perfil)}`}>
                    {activeUser.perfil.replace('_', ' ')}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Alternar Perfil Operacional
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Teste o sistema com permissões de cada papel municipal:
                    </p>
                  </div>
                  <div className="py-1">
                    {usersList.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          onSelectUser(user);
                          setProfileDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                          activeUser.id === user.id ? 'bg-emerald-50/60' : ''
                        }`}
                      >
                        <ShieldCheck className={`w-4 h-4 mt-0.5 ${activeUser.id === user.id ? 'text-emerald-700' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            {user.nome_completo}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {user.cargo}
                          </div>
                          <span className={`mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded border inline-block ${getProfileBadge(user.perfil)}`}>
                            {user.perfil.replace('_', ' ')}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 overflow-x-auto text-[11px]">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${currentTab === 'dashboard' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Painel
          </button>
          <button
            onClick={() => setCurrentTab('monitoramento')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap flex items-center gap-1 ${currentTab === 'monitoramento' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            <Radio className="w-3 h-3 text-emerald-500" />
            Ao Vivo
          </button>
          <button
            onClick={() => setCurrentTab('triagem')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${currentTab === 'triagem' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Triagem ({pendingCount})
          </button>
          <button
            onClick={() => setCurrentTab('frota')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${currentTab === 'frota' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Frota
          </button>
          <button
            onClick={() => setCurrentTab('embarque')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${currentTab === 'embarque' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Embarque
          </button>
          <button
            onClick={() => setCurrentTab('diarias')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${currentTab === 'diarias' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Diárias
          </button>
        </div>
      </div>
    </header>
  );
};
