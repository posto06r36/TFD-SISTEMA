import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Calendar, 
  User, 
  CheckCircle, 
  Tag, 
  Building2, 
  AlertCircle,
  FileBadge,
  HeartHandshake
} from 'lucide-react';
import { 
  TFDDatabase, 
  Paciente, 
  SolicitacaoTFD, 
  Acompanhante, 
  PontoEspera, 
  UsuarioSistema 
} from '../types/tfd';
import { maskCPF, maskCNS, maskPhone, formatDateBR, isValidCPF } from '../utils/masks';

interface EmitirOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: TFDDatabase;
  activeUser: UsuarioSistema;
  onSuccessEmitida: (novaSol: SolicitacaoTFD) => void;
  preSelectedPatientId?: string | null;
}

export const EmitirOSModal: React.FC<EmitirOSModalProps> = ({
  isOpen,
  onClose,
  db,
  activeUser,
  onSuccessEmitida,
  preSelectedPatientId,
}) => {
  // Patient selection or quick search
  const [searchDoc, setSearchDoc] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    preSelectedPatientId || db.pacientes[0]?.id || ''
  );

  React.useEffect(() => {
    if (preSelectedPatientId) {
      setSelectedPatientId(preSelectedPatientId);
      setIsNewPatient(false);
    }
  }, [preSelectedPatientId]);

  // Patient manual fields if new
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [cartaoSus, setCartaoSus] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('1980-01-01');

  // OS Logistics Fields
  const [dataViagem, setDataViagem] = useState('2026-10-26');
  const [selectedPontoId, setSelectedPontoId] = useState<string>(db.pontos_espera[0]?.id || '');
  const [horarioSaida, setHorarioSaida] = useState<string>(db.pontos_espera[0]?.horario_estimado_passagem || '04:00');
  const [pontoEmissaoOrigem, setPontoEmissaoOrigem] = useState<string>(
    activeUser.ponto_tfd_lotacao || db.unidades_saude[0]?.nome || 'USF Central'
  );

  // Clinical & Destination Fields
  const [cidadeDestino, setCidadeDestino] = useState('Salvador');
  const [hospitalDestino, setHospitalDestino] = useState('Hospital das Clínicas da UFBA');
  const [especialidadeMedica, setEspecialidadeMedica] = useState('Consulta Especializada');
  const [cid10, setCid10] = useState('Z00.0');

  // Companion
  const [requerAcomp, setRequerAcomp] = useState(false);
  const [acompNome, setAcompNome] = useState('');
  const [acompCpf, setAcompCpf] = useState('');
  const [acompParentesco, setAcompParentesco] = useState('Familiar');

  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  // When user selects a waiting point, auto-update the departure/pickup time!
  const handlePontoChange = (pontoId: string) => {
    setSelectedPontoId(pontoId);
    const ponto = db.pontos_espera.find((p) => p.id === pontoId);
    if (ponto?.horario_estimado_passagem) {
      setHorarioSaida(ponto.horario_estimado_passagem);
    }
  };

  // Quick search patient
  const handleSearchPatient = () => {
    const clean = searchDoc.replace(/\D/g, '');
    if (!clean) return;

    const found = db.pacientes.find(
      (p) => p.cpf.replace(/\D/g, '').includes(clean) || p.cartao_sus.replace(/\D/g, '').includes(clean)
    );

    if (found) {
      setSelectedPatientId(found.id);
      setIsNewPatient(false);
    } else {
      setIsNewPatient(true);
      setCpf(maskCPF(searchDoc));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    let finalPatientId = selectedPatientId;

    if (isNewPatient) {
      if (!nomeCompleto.trim()) {
        setFormError('Informe o nome completo do paciente.');
        return;
      }
      if (!cpf || !isValidCPF(cpf)) {
        setFormError('Informe um CPF válido para o paciente.');
        return;
      }
      finalPatientId = `pac-${Date.now()}`;
      const newPac: Paciente = {
        id: finalPatientId,
        cpf,
        cartao_sus: cartaoSus || '700 0000 0000 0000',
        nome_completo: nomeCompleto,
        data_nascimento: dataNascimento,
        telefone_whatsapp: telefone,
        endereco: 'Endereço Cadastrado no Ponto TFD',
        bairro: 'Sede',
        unidade_saude_id: db.unidades_saude[0]?.id || 'usf-01',
        grupo_vulnerabilidade: 'Nenhum',
        criado_em: new Date().toISOString(),
      };
      db.pacientes.push(newPac);
    }

    const ponto = db.pontos_espera.find((p) => p.id === selectedPontoId);
    const osCodeNum = Math.floor(100 + Math.random() * 900);
    const newSolId = `sol-${Date.now()}`;
    const ordemNumero = `OS-TFD-2026/${osCodeNum}`;

    const novaSolicitacao: SolicitacaoTFD = {
      id: newSolId,
      paciente_id: finalPatientId,
      cid_10: cid10,
      especialidade_medica: especialidadeMedica,
      hospital_destino: hospitalDestino,
      cidade_destino: cidadeDestino,
      data_agendada_consulta: dataViagem,
      horario_agendado_consulta: '08:00',
      requer_acompanhante: requerAcomp,
      justificativa_acompanhante: requerAcomp ? 'Acompanhante autorizado no ponto de TFD' : undefined,
      status: 'Aprovado', // auto-approved for immediate scheduling
      data_solicitacao: new Date().toISOString(),
      // Specific OS & Waiting Point fields
      ponto_espera_id: selectedPontoId,
      ponto_espera_nome: ponto?.nome || 'Pátio da Secretaria de Saúde',
      horario_saida_previsto: horarioSaida,
      data_viagem_prevista: dataViagem,
      ordem_numero: ordemNumero,
      operador_emissor_id: activeUser.id,
      operador_emissor_nome: `${activeUser.nome_completo} (${activeUser.cargo})`,
      ponto_tfd_origem: pontoEmissaoOrigem,
    };

    if (requerAcomp && acompNome.trim()) {
      const newAcomp: Acompanhante = {
        id: `acomp-${Date.now()}`,
        solicitacao_id: newSolId,
        cpf: acompCpf || '000.000.000-00',
        nome_completo: acompNome,
        grau_parentesco: acompParentesco,
        telefone: telefone,
      };
      db.acompanhantes.push(newAcomp);
    }

    db.solicitacoes_tfd.unshift(novaSolicitacao);
    onSuccessEmitida(novaSolicitacao);
    onClose();
  };

  const selectedPatient = db.pacientes.find((p) => p.id === selectedPatientId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-6">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50/70">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileBadge className="w-5 h-5 text-emerald-700" />
              Emissão de OS / Ordem TFD Gratuita
            </h3>
            <p className="text-xs text-slate-500">
              Operador conectado: <strong>{activeUser.nome_completo}</strong> • {activeUser.cargo}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Origem / Balcão Emissor */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-semibold flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-500" />
              Ponto de Atendimento TFD Emissor:
            </span>
            <select
              value={pontoEmissaoOrigem}
              onChange={(e) => setPontoEmissaoOrigem(e.target.value)}
              className="p-1.5 border border-slate-300 rounded font-semibold text-slate-800 bg-white"
            >
              {db.unidades_saude.map((u) => (
                <option key={u.id} value={u.nome}>
                  {u.nome} ({u.bairro_comunidade})
                </option>
              ))}
              <option value="Balcão Central TFD / Rodoviária">Balcão Central TFD / Rodoviária</option>
            </select>
          </div>

          {/* Section 1: Identificação do Paciente */}
          <div className="space-y-3 border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                1. Seleção do Paciente
              </span>
              <button
                type="button"
                onClick={() => setIsNewPatient(!isNewPatient)}
                className="text-emerald-700 hover:underline font-semibold"
              >
                {isNewPatient ? 'Selecionar da Lista' : '+ Cadastrar Novo Paciente'}
              </button>
            </div>

            {!isNewPatient ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Selecione o Paciente Cadastrado
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {db.pacientes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome_completo} (CPF: {p.cpf}) - {p.bairro}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPatient && (
                  <div className="sm:col-span-2 p-2.5 bg-emerald-50/60 rounded border border-emerald-200 text-[11px] text-emerald-950 flex justify-between">
                    <div>
                      <strong>{selectedPatient.nome_completo}</strong> • CPF: {selectedPatient.cpf}
                    </div>
                    <div>
                      CNS: {selectedPatient.cartao_sus} • WhatsApp: {selectedPatient.telefone_whatsapp}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    placeholder="Ex: Maria José de Oliveira"
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CPF</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(maskCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cartão SUS</label>
                  <input
                    type="text"
                    value={cartaoSus}
                    onChange={(e) => setCartaoSus(maskCNS(e.target.value))}
                    placeholder="000 0000 0000 0000"
                    className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(maskPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: PONTO DE ESPERA E HORÁRIO (Requisito Principal do Usuário) */}
          <div className="space-y-3 bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
            <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              2. Ponto de Espera & Horário da Viagem (Onde o paciente aguarda)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Data da Viagem */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Data da Viagem <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dataViagem}
                  onChange={(e) => setDataViagem(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono font-bold"
                  required
                />
              </div>

              {/* Ponto de Espera Selector */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Ponto de Espera no Município <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPontoId}
                  onChange={(e) => handlePontoChange(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
                >
                  {db.pontos_espera.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (Passagem estimada: {p.horario_estimado_passagem})
                    </option>
                  ))}
                </select>
              </div>

              {/* Horário de Passagem */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Horário que o Carro Passa <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={horarioSaida}
                  onChange={(e) => setHorarioSaida(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono font-black text-sm text-emerald-950"
                  required
                />
              </div>

              {/* Endereço / Referência do Ponto */}
              <div className="sm:col-span-2 text-[11px] text-slate-600 bg-white/70 p-2 rounded border border-emerald-100 flex items-center">
                <span>
                  📍 Ref: {db.pontos_espera.find((p) => p.id === selectedPontoId)?.referencia || 'Ponto cadastrado'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Destino e Hospital */}
          <div className="grid grid-cols-2 gap-3 border-b border-slate-100 pb-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cidade Destino</label>
              <select
                value={cidadeDestino}
                onChange={(e) => setCidadeDestino(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Salvador">Salvador / BA</option>
                <option value="Feira de Santana">Feira de Santana / BA</option>
                <option value="Recife">Recife / PE</option>
                <option value="Barretos">Barretos / SP</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hospital / Clínica</label>
              <input
                type="text"
                value={hospitalDestino}
                onChange={(e) => setHospitalDestino(e.target.value)}
                placeholder="Ex: Hospital das Clínicas"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Section 4: Acompanhante */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={requerAcomp}
                onChange={(e) => setRequerAcomp(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span>Paciente necessita de vaga para Acompanhante</span>
            </label>

            {requerAcomp && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                <input
                  type="text"
                  value={acompNome}
                  onChange={(e) => setAcompNome(e.target.value)}
                  placeholder="Nome do Acompanhante"
                  className="p-1.5 border border-slate-300 rounded bg-white"
                />
                <input
                  type="text"
                  value={acompCpf}
                  onChange={(e) => setAcompCpf(maskCPF(e.target.value))}
                  placeholder="CPF Acompanhante"
                  className="p-1.5 border border-slate-300 rounded bg-white font-mono"
                />
                <select
                  value={acompParentesco}
                  onChange={(e) => setAcompParentesco(e.target.value)}
                  className="p-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="Familiar">Familiar</option>
                  <option value="Mãe / Pai">Mãe / Pai</option>
                  <option value="Filho(a)">Filho(a)</option>
                  <option value="Cônjuge">Cônjuge</option>
                </select>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Tag className="w-4 h-4" />
              Emitir OS & Gerar Etiqueta
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
