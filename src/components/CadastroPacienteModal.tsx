import React, { useState } from 'react';
import { 
  UserPlus, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Building2, 
  Calendar, 
  MapPin, 
  Phone, 
  ShieldAlert,
  FileText
} from 'lucide-react';
import { Paciente, VulnerabilidadeGrupo, TFDDatabase } from '../types/tfd';
import { maskCPF, isValidCPF, maskCNS, isValidCNS, maskPhone } from '../utils/masks';

interface CadastroPacienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: TFDDatabase;
  onSavePaciente: (novoPaciente: Paciente, abrirOrdemDireta?: boolean) => void;
}

export const CadastroPacienteModal: React.FC<CadastroPacienteModalProps> = ({
  isOpen,
  onClose,
  db,
  onSavePaciente,
}) => {
  const [cpf, setCpf] = useState('');
  const [cartaoSus, setCartaoSus] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefoneWhatsapp, setTelefoneWhatsapp] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [unidadeSaudeId, setUnidadeSaudeId] = useState(db.unidades_saude[0]?.id || '');
  const [grupoVulnerabilidade, setGrupoVulnerabilidade] = useState<VulnerabilidadeGrupo>('Nenhum');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const resetForm = () => {
    setCpf('');
    setCartaoSus('');
    setNomeCompleto('');
    setDataNascimento('');
    setTelefoneWhatsapp('');
    setEndereco('');
    setBairro('');
    setGrupoVulnerabilidade('Nenhum');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!nomeCompleto.trim() || nomeCompleto.trim().split(' ').length < 2) {
      errs.nomeCompleto = 'Informe o nome completo do paciente (mínimo nome e sobrenome).';
    }
    if (!cpf || !isValidCPF(cpf)) {
      errs.cpf = 'CPF inválido. Verifique os números digitados.';
    } else {
      const clean = cpf.replace(/\D/g, '');
      const dup = db.pacientes.find((p) => p.cpf.replace(/\D/g, '') === clean);
      if (dup) {
        errs.cpf = `Este CPF já está cadastrado para o paciente "${dup.nome_completo}".`;
      }
    }
    if (!cartaoSus || !isValidCNS(cartaoSus)) {
      errs.cartaoSus = 'Cartão SUS deve conter 15 dígitos numéricos válidos.';
    }
    if (!dataNascimento) {
      errs.dataNascimento = 'Informe a data de nascimento do paciente.';
    }
    if (!telefoneWhatsapp || telefoneWhatsapp.replace(/\D/g, '').length < 10) {
      errs.telefoneWhatsapp = 'Informe um WhatsApp/telefone com DDD válido.';
    }
    if (!endereco.trim()) {
      errs.endereco = 'Informe o endereço residencial.';
    }
    if (!bairro.trim()) {
      errs.bairro = 'Informe o bairro ou comunidade.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (abrirOrdemDireta: boolean) => {
    if (!validate()) return;

    const novo: Paciente = {
      id: `pac-${Date.now().toString(36)}`,
      cpf: maskCPF(cpf),
      cartao_sus: maskCNS(cartaoSus),
      nome_completo: nomeCompleto.trim(),
      data_nascimento: dataNascimento,
      telefone_whatsapp: maskPhone(telefoneWhatsapp),
      endereco: endereco.trim(),
      bairro: bairro.trim(),
      unidade_saude_id: unidadeSaudeId || db.unidades_saude[0]?.id || 'usf-01',
      grupo_vulnerabilidade: grupoVulnerabilidade,
      criado_em: new Date().toISOString(),
    };

    onSavePaciente(novo, abrirOrdemDireta);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Cadastro de Novo Paciente TFD</h3>
              <p className="text-[11px] text-slate-300">
                Registro oficial no banco de dados municipal de Tratamento Fora do Domicílio
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome Completo do Paciente *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Maria das Graças Oliveira"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                  errors.nomeCompleto ? 'border-rose-400' : 'border-slate-300'
                }`}
                autoFocus
              />
              {errors.nomeCompleto && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.nomeCompleto}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Data de Nascimento *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                    errors.dataNascimento ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.dataNascimento && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.dataNascimento}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CPF do Paciente *
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
                Cartão Nacional do SUS (15 dígitos) *
              </label>
              <input
                type="text"
                required
                maxLength={19}
                placeholder="700 0000 0000 0000"
                value={cartaoSus}
                onChange={(e) => setCartaoSus(maskCNS(e.target.value))}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                  errors.cartaoSus ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.cartaoSus && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.cartaoSus}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telefone / WhatsApp de Contato *
              </label>
              <input
                type="text"
                required
                maxLength={15}
                placeholder="(75) 90000-0000"
                value={telefoneWhatsapp}
                onChange={(e) => setTelefoneWhatsapp(maskPhone(e.target.value))}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                  errors.telefoneWhatsapp ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.telefoneWhatsapp && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.telefoneWhatsapp}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Grupo de Prioridade / Vulnerabilidade
              </label>
              <select
                value={grupoVulnerabilidade}
                onChange={(e) => setGrupoVulnerabilidade(e.target.value as VulnerabilidadeGrupo)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="Nenhum">Nenhum / Atendimento Geral</option>
                <option value="Idoso">Idoso (60+ anos)</option>
                <option value="Cadeirante / PNE">Cadeirante / PNE (Acessibilidade)</option>
                <option value="Paciente Oncológico">Paciente Oncológico (Câncer)</option>
                <option value="Tratamento Renal Contínuo">Tratamento Renal Contínuo (Hemodiálise)</option>
                <option value="Gestante">Gestante de Alto Risco</option>
                <option value="Pediatria / Infantil">Pediatria / Infantil (Menor)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Endereço Residencial (Rua, Número, Complemento) *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Rua São Jorge, 45, Casa"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                  errors.endereco ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.endereco && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.endereco}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bairro / Comunidade *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Centro ou Zona Rural"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                  errors.bairro ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.bairro && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.bairro}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Unidade de Saúde da Família de Referência (USF / PSF)
            </label>
            <select
              value={unidadeSaudeId}
              onChange={(e) => setUnidadeSaudeId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
            >
              {db.unidades_saude.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} ({u.bairro_comunidade}) - CNES: {u.cnes}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 text-center sm:text-left">
            * Dados protegidos pela LGPD e vinculados ao prontuário municipal.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Apenas Salvar Paciente</span>
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Salvar e Emitir Ordem TFD</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
