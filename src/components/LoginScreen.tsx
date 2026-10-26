import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  User, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  KeyRound, 
  HeartHandshake,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { UsuarioSistema, TFDDatabase } from '../types/tfd';

interface LoginScreenProps {
  db: TFDDatabase;
  onLoginSuccess: (user: UsuarioSistema) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ db, onLoginSuccess }) => {
  // Default to the first operator (Master)
  const defaultUser = db.usuarios_sistema.find((u) => u.perfil === 'Master') || db.usuarios_sistema[0];
  const [selectedUserId, setSelectedUserId] = useState<string>(defaultUser?.id || '');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSenha(e.target.value);
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const targetUser = db.usuarios_sistema.find((u) => u.id === selectedUserId);
    if (!targetUser) {
      setErrorMsg('Operador não encontrado. Selecione um operador cadastrado.');
      setIsSubmitting(false);
      return;
    }

    if (!targetUser.ativo) {
      setErrorMsg('Este operador está desativado. Contate a coordenação.');
      setIsSubmitting(false);
      return;
    }

    const expectedPass = targetUser.senha || targetUser.senha_hash || '1234';
    if (expectedPass !== senha.trim()) {
      setErrorMsg('Senha incorreta. Tente novamente.');
      setIsSubmitting(false);
      return;
    }

    onLoginSuccess(targetUser);
  };

  // Quick 1-click login for Master without typing
  const handleQuickMasterLogin = () => {
    const master = db.usuarios_sistema.find((u) => u.perfil === 'Master') || db.usuarios_sistema[0];
    if (master) {
      setSelectedUserId(master.id);
      setSenha(master.senha || '1234');
      onLoginSuccess(master);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-radial from-slate-800 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />
      
      {/* Decorative circle glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-900/40 mb-4 ring-4 ring-emerald-500/20">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Central de TFD Municipal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Secretaria Municipal de Saúde • Tratamento Fora do Domicílio
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
            <span>TRANSPORTE E PASSAGEM 100% GRATUITOS PELO SUS</span>
          </div>
        </div>

        {/* Login Box (NO CPF FIELD AS REQUESTED) */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Acesso ao Sistema</h2>
              <p className="text-xs text-slate-500">Selecione seu perfil e digite sua senha</p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Atenção no acesso:</span> {errorMsg}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Operator Selector (Replaces CPF) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Operador / Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                >
                  {db.usuarios_sistema.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome_completo} ({u.perfil})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={senha}
                  onChange={handleSenhaChange}
                  placeholder="Digite sua senha (ex: 1234)"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>Entrar no Sistema</span>
            </button>
          </form>

          {/* Quick 1-click Master Button */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuickMasterLogin}
              className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Entrar com 1 Clique como Master (Senha 1234)</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Acesso restrito aos servidores e fiscais autorizados do TFD Municipal.
          <br />
          Portaria SAS/MS nº 055/1999 • Lei nº 8.080/1990
        </p>
      </div>
    </div>
  );
};
