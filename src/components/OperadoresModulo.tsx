import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  CheckCircle, 
  XCircle, 
  Building2, 
  Lock, 
  AlertCircle, 
  Edit3, 
  Trash2,
  MapPin,
  BadgeCheck
} from 'lucide-react';
import { UsuarioSistema, PerfilUsuario, TFDDatabase } from '../types/tfd';
import { maskCPF, isValidCPF } from '../utils/masks';

interface OperadoresModuloProps {
  db: TFDDatabase;
  activeUser: UsuarioSistema;
  onUpdateDb: (updater: (prev: TFDDatabase) => TFDDatabase) => void;
}

export const OperadoresModulo: React.FC<OperadoresModuloProps> = ({ db, activeUser, onUpdateDb }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form fields
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuario>('Operador');
  const [cargo, setCargo] = useState('Operador de Regulação TFD');
  const [pontoLotacao, setPontoLotacao] = useState(db.unidades_saude[0]?.nome || 'Central Municipal de TFD - Sede');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetForm = () => {
    setEditingUserId(null);
    setNomeCompleto('');
    setCpf('');
    setSenha('');
    setPerfil('Operador');
    setCargo('Operador de Regulação TFD');
    setPontoLotacao(db.unidades_saude[0]?.nome || 'Central Municipal de TFD - Sede');
    setErrors({});
  };

  const handleOpenNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (user: UsuarioSistema) => {
    setEditingUserId(user.id);
    setNomeCompleto(user.nome_completo);
    setCpf(user.cpf);
    setSenha(user.senha || user.senha_hash || '');
    setPerfil(user.perfil);
    setCargo(user.cargo);
    setPontoLotacao(user.ponto_tfd_lotacao || 'Central Municipal de TFD - Sede');
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!nomeCompleto.trim() || nomeCompleto.trim().split(' ').length < 2) {
      errs.nomeCompleto = 'Informe o nome completo do operador (ao menos nome e sobrenome).';
    }
    if (!cpf || !isValidCPF(cpf)) {
      errs.cpf = 'CPF inválido. Verifique os dígitos.';
    } else {
      // Check for duplicate CPF if creating new or updating someone else
      const clean = cpf.replace(/\D/g, '');
      const duplicate = db.usuarios_sistema.find(
        (u) => u.cpf.replace(/\D/g, '') === clean && u.id !== editingUserId
      );
      if (duplicate) {
        errs.cpf = `Já existe um operador cadastrado com este CPF (${duplicate.nome_completo}).`;
      }
    }
    if (!senha.trim() || senha.trim().length < 3) {
      errs.senha = 'A senha de acesso deve ter pelo menos 3 caracteres.';
    }
    if (!cargo.trim()) {
      errs.cargo = 'Informe o cargo ou função do operador.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingUserId) {
      // Update existing operator
      onUpdateDb((prev) => ({
        ...prev,
        usuarios_sistema: prev.usuarios_sistema.map((u) => {
          if (u.id === editingUserId) {
            return {
              ...u,
              nome_completo: nomeCompleto.trim(),
              cpf: maskCPF(cpf),
              senha: senha.trim(),
              senha_hash: senha.trim(),
              perfil,
              cargo: cargo.trim(),
              ponto_tfd_lotacao: pontoLotacao.trim(),
            };
          }
          return u;
        }),
      }));
      setFeedbackMsg({ type: 'success', text: `Operador "${nomeCompleto}" atualizado com sucesso!` });
    } else {
      // Create new operator
      const novoOperador: UsuarioSistema = {
        id: `usr-${Date.now().toString(36)}`,
        nome_completo: nomeCompleto.trim(),
        cpf: maskCPF(cpf),
        senha: senha.trim(),
        senha_hash: senha.trim(),
        perfil,
        cargo: cargo.trim(),
        ponto_tfd_lotacao: pontoLotacao.trim(),
        ativo: true,
      };

      onUpdateDb((prev) => ({
        ...prev,
        usuarios_sistema: [...prev.usuarios_sistema, novoOperador],
      }));
      setFeedbackMsg({ type: 'success', text: `Novo operador "${novoOperador.nome_completo}" cadastrado com sucesso com nível ${novoOperador.perfil}!` });
    }

    setShowModal(false);
    resetForm();
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleToggleAtivo = (user: UsuarioSistema) => {
    if (user.cpf.replace(/\D/g, '') === '13012994483') {
      alert('O usuário Master principal não pode ser desativado.');
      return;
    }

    onUpdateDb((prev) => ({
      ...prev,
      usuarios_sistema: prev.usuarios_sistema.map((u) => {
        if (u.id === user.id) {
          return { ...u, ativo: !u.ativo };
        }
        return u;
      }),
    }));
  };

  const handleDelete = (user: UsuarioSistema) => {
    if (user.cpf.replace(/\D/g, '') === '13012994483') {
      alert('O usuário Master principal não pode ser excluído.');
      return;
    }
    if (window.confirm(`Deseja realmente remover o operador ${user.nome_completo}?`)) {
      onUpdateDb((prev) => ({
        ...prev,
        usuarios_sistema: prev.usuarios_sistema.filter((u) => u.id !== user.id),
      }));
      setFeedbackMsg({ type: 'success', text: `Operador ${user.nome_completo} removido.` });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const getProfileBadge = (p: PerfilUsuario) => {
    switch (p) {
      case 'Master':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Operador':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Atendente_PSF':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Fiscal_Embarque':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getProfileDescription = (p: PerfilUsuario) => {
    switch (p) {
      case 'Master':
        return 'Acesso Irrestrito: Cadastro de operadores, parametrização, viagens, diárias e auditoria geral.';
      case 'Operador':
        return 'Regulação e Viagens: Emissão de OS, montagem de rotas, gestão de frota e liberação de diárias.';
      case 'Atendente_PSF':
        return 'Triagem e Balcão: Cadastro de pacientes, emissão de etiqueta de espera e requisições nas UBSs.';
      case 'Fiscal_Embarque':
        return 'Pátio e Embarque: Check-in em tempo real, voucher térmico 58mm e conferência de passageiros.';
    }
  };

  const isMaster = activeUser.perfil === 'Master';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900">
              Gestão de Operadores & Níveis de Acesso
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre novos atendentes, fiscais e reguladores de TFD e defina os níveis e pontos de lotação.
          </p>
        </div>

        {isMaster && (
          <button
            onClick={handleOpenNew}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Novo Operador</span>
          </button>
        )}
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Role Explanations Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['Master', 'Operador', 'Atendente_PSF', 'Fiscal_Embarque'] as PerfilUsuario[]).map((p) => (
          <div key={p} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getProfileBadge(p)}`}>
                {p.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {db.usuarios_sistema.filter((u) => u.perfil === p).length} ativo(s)
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {getProfileDescription(p)}
            </p>
          </div>
        ))}
      </div>

      {/* Operators List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-800">
              Operadores Registrados no Sistema Municipal ({db.usuarios_sistema.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Apenas o perfil Master pode gerenciar credenciais
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Operador / Servidor</th>
                <th className="py-3 px-4">CPF de Acesso</th>
                <th className="py-3 px-4">Nível / Perfil</th>
                <th className="py-3 px-4">Cargo / Função</th>
                <th className="py-3 px-4">Ponto TFD / Lotação</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {db.usuarios_sistema.map((user) => {
                const isCurrentMaster = user.cpf.replace(/\D/g, '') === '13012994483';
                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {user.nome_completo.charAt(0)}
                        </div>
                        <div>
                          <div>{user.nome_completo}</div>
                          {isCurrentMaster && (
                            <span className="text-[10px] text-purple-700 font-bold flex items-center gap-1">
                              <BadgeCheck className="w-3 h-3 text-purple-600" />
                              Master Titular do Sistema
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      {user.cpf}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${getProfileBadge(user.perfil)}`}>
                        {user.perfil.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {user.cargo}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{user.ponto_tfd_lotacao || 'Sede Geral'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleAtivo(user)}
                        disabled={isCurrentMaster || !isMaster}
                        title={isCurrentMaster ? 'Master não pode ser desativado' : 'Clique para alternar status'}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition ${
                          user.ativo
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        } ${isCurrentMaster ? 'cursor-default' : ''}`}
                      >
                        {user.ativo ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Ativo</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Inativo</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isMaster && (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar Operador e Senha"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {!isCurrentMaster && (
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Remover Operador"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to Register / Edit Operator */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">
                  {editingUserId ? 'Editar Dados do Operador' : 'Cadastrar Novo Operador Municipal'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo do Servidor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva Santos"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                    errors.nomeCompleto ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
                {errors.nomeCompleto && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.nomeCompleto}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CPF de Login *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(maskCPF(e.target.value))}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                      errors.cpf ? 'border-rose-400' : 'border-slate-300'
                    }`}
                  />
                  {errors.cpf && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.cpf}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Senha de Acesso *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1234"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                      errors.senha ? 'border-rose-400' : 'border-slate-300'
                    }`}
                  />
                  {errors.senha && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.senha}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nível / Perfil de Acesso *
                  </label>
                  <select
                    value={perfil}
                    onChange={(e) => setPerfil(e.target.value as PerfilUsuario)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                  >
                    <option value="Operador">Operador (Regulação & Viagens)</option>
                    <option value="Atendente_PSF">Atendente PSF (Balcão / Triagem UBS)</option>
                    <option value="Fiscal_Embarque">Fiscal de Embarque (Pátio / Check-in)</option>
                    <option value="Master">Master (Administrador Total)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cargo / Função Declarada *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Atendente de Balcão TFD"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                      errors.cargo ? 'border-rose-400' : 'border-slate-300'
                    }`}
                  />
                  {errors.cargo && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.cargo}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ponto de TFD / Lotação Física
                </label>
                <input
                  type="text"
                  placeholder="Ex: USF Central Dr. Aloysio de Castro ou Balcão Sede"
                  value={pontoLotacao}
                  onChange={(e) => setPontoLotacao(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Local onde este operador atende a população ou emite ordens e etiquetas.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{editingUserId ? 'Salvar Alterações' : 'Confirmar Cadastro'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
