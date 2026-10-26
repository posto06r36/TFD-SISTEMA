import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Paperclip, 
  HeartHandshake, 
  Building2,
  Calendar,
  UserCheck,
  ChevronRight,
  Filter,
  FileBadge,
  Tag,
  MapPin
} from 'lucide-react';
import { 
  TFDDatabase, 
  Paciente, 
  SolicitacaoTFD, 
  Acompanhante, 
  VulnerabilidadeGrupo, 
  SolicitacaoStatus 
} from '../types/tfd';
import { 
  maskCPF, 
  isValidCPF, 
  maskCNS, 
  isValidCNS, 
  maskPhone, 
  formatDateBR, 
  COMMON_CID10, 
  COMMON_HOSPITALS 
} from '../utils/masks';

interface TriagemModuloProps {
  db: TFDDatabase;
  onUpdateDb: (updater: (prev: TFDDatabase) => TFDDatabase) => void;
  onOpenOrdemTFD: (sol: SolicitacaoTFD) => void;
  onOpenEtiqueta: (sol: SolicitacaoTFD) => void;
  onOpenCadastroModal?: () => void;
  onOpenEmitirOS?: (patientId?: string) => void;
}

export const TriagemModulo: React.FC<TriagemModuloProps> = ({ 
  db, 
  onUpdateDb, 
  onOpenOrdemTFD, 
  onOpenEtiqueta,
  onOpenCadastroModal,
  onOpenEmitirOS,
}) => {
  // Search state
  const [searchDoc, setSearchDoc] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Filter state for requests table
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [searchTableQuery, setSearchTableQuery] = useState('');
  const [searchPatientQuery, setSearchPatientQuery] = useState('');

  // Form Mode: 'list', 'pacientes', or 'create'
  const [viewMode, setViewMode] = useState<'list' | 'pacientes' | 'create'>('list');

  // Patient Form Fields
  const [cpf, setCpf] = useState('');
  const [cartaoSus, setCartaoSus] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefoneWhatsapp, setTelefoneWhatsapp] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [unidadeSaudeId, setUnidadeSaudeId] = useState(db.unidades_saude[0]?.id || '');
  const [grupoVulnerabilidade, setGrupoVulnerabilidade] = useState<VulnerabilidadeGrupo>('Nenhum');

  // Request Form Fields
  const [cid10, setCid10] = useState('');
  const [cidDescricao, setCidDescricao] = useState('');
  const [especialidadeMedica, setEspecialidadeMedica] = useState('');
  const [hospitalDestino, setHospitalDestino] = useState('');
  const [cidadeDestino, setCidadeDestino] = useState('Salvador');
  const [dataAgendada, setDataAgendada] = useState('');
  const [horarioAgendado, setHorarioAgendado] = useState('08:00');
  const [crmMedico, setCrmMedico] = useState('');
  const [laudoNome, setLaudoNome] = useState('laudo_medico_tfd.pdf');
  const [observacoes, setObservacoes] = useState('');

  // Waiting Point & Pickup Time
  const [pontoEsperaId, setPontoEsperaId] = useState(db.pontos_espera[0]?.id || '');
  const [horarioSaidaPrevisto, setHorarioSaidaPrevisto] = useState(
    db.pontos_espera[0]?.horario_estimado_passagem || '04:00'
  );

  // Companion Fields
  const [requerAcompanhante, setRequerAcompanhante] = useState(false);
  const [acompNome, setAcompNome] = useState('');
  const [acompCpf, setAcompCpf] = useState('');
  const [acompParentesco, setAcompParentesco] = useState('Familiar');
  const [acompTelefone, setAcompTelefone] = useState('');
  const [acompJustificativa, setAcompJustificativa] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Quick Patient Search
  const handleSearchPatient = () => {
    const cleanSearch = searchDoc.replace(/\D/g, '');
    if (!cleanSearch) return;

    const found = db.pacientes.find(
      (p) =>
        p.cpf.replace(/\D/g, '').includes(cleanSearch) ||
        p.cartao_sus.replace(/\D/g, '').includes(cleanSearch)
    );

    if (found) {
      loadPatientData(found);
    } else {
      setSuccessMessage('Nenhum paciente encontrado com este documento. Preencha os campos para cadastrar um novo.');
      setTimeout(() => setSuccessMessage(''), 5000);
      setCpf(maskCPF(searchDoc));
      setSelectedPatientId(null);
    }
  };

  const loadPatientData = (p: Paciente) => {
    setSelectedPatientId(p.id);
    setCpf(p.cpf);
    setCartaoSus(p.cartao_sus);
    setNomeCompleto(p.nome_completo);
    setDataNascimento(p.data_nascimento);
    setTelefoneWhatsapp(p.telefone_whatsapp);
    setEndereco(p.endereco);
    setBairro(p.bairro);
    setUnidadeSaudeId(p.unidade_saude_id);
    setGrupoVulnerabilidade(p.grupo_vulnerabilidade);
    setViewMode('create');
  };

  const resetForm = () => {
    setSelectedPatientId(null);
    setCpf('');
    setCartaoSus('');
    setNomeCompleto('');
    setDataNascimento('');
    setTelefoneWhatsapp('');
    setEndereco('');
    setBairro('');
    setCid10('');
    setCidDescricao('');
    setEspecialidadeMedica('');
    setHospitalDestino('');
    setDataAgendada('');
    setObservacoes('');
    setRequerAcompanhante(false);
    setAcompNome('');
    setAcompCpf('');
    setAcompTelefone('');
    setAcompJustificativa('');
    setErrors({});
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate patient fields
    if (!cpf || !isValidCPF(cpf)) {
      newErrors.cpf = 'Informe um CPF válido com 11 dígitos.';
    }
    if (!cartaoSus || cartaoSus.replace(/\D/g, '').length < 15) {
      newErrors.cartaoSus = 'O Cartão Nacional de Saúde deve conter 15 dígitos numéricos.';
    }
    if (!nomeCompleto.trim()) {
      newErrors.nomeCompleto = 'Nome completo é obrigatório.';
    }
    if (!dataNascimento) {
      newErrors.dataNascimento = 'Data de nascimento é obrigatória.';
    }
    if (!telefoneWhatsapp) {
      newErrors.telefoneWhatsapp = 'Telefone para contato / WhatsApp é obrigatório.';
    }

    // Validate request fields
    if (!cid10.trim()) {
      newErrors.cid10 = 'Informe o código CID-10 da patologia.';
    }
    if (!especialidadeMedica.trim()) {
      newErrors.especialidadeMedica = 'Informe a especialidade médica solicitada.';
    }
    if (!hospitalDestino.trim()) {
      newErrors.hospitalDestino = 'Informe o hospital ou centro de saúde de destino.';
    }
    if (!cidadeDestino.trim()) {
      newErrors.cidadeDestino = 'Informe a cidade de destino.';
    }
    if (!dataAgendada) {
      newErrors.dataAgendada = 'Informe a data agendada para a consulta/exame.';
    }

    // Validate companion if required
    if (requerAcompanhante) {
      if (!acompNome.trim()) {
        newErrors.acompNome = 'Informe o nome completo do acompanhante.';
      }
      if (!acompCpf || !isValidCPF(acompCpf)) {
        newErrors.acompCpf = 'Informe um CPF válido para o acompanhante.';
      }
      if (!acompJustificativa.trim()) {
        newErrors.acompJustificativa = 'Informe a justificativa médica para acompanhante.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    onUpdateDb((prev) => {
      let patientId = selectedPatientId;

      // 1. Create or update patient
      let updatedPacientes = [...prev.pacientes];
      if (!patientId) {
        patientId = `pac-${Date.now()}`;
        const newPaciente: Paciente = {
          id: patientId,
          cpf,
          cartao_sus: cartaoSus,
          nome_completo: nomeCompleto,
          data_nascimento: dataNascimento,
          telefone_whatsapp: telefoneWhatsapp,
          endereco,
          bairro,
          unidade_saude_id: unidadeSaudeId,
          grupo_vulnerabilidade: grupoVulnerabilidade,
          criado_em: new Date().toISOString(),
        };
        updatedPacientes.push(newPaciente);
      } else {
        updatedPacientes = updatedPacientes.map((p) =>
          p.id === patientId
            ? {
                ...p,
                cpf,
                cartao_sus: cartaoSus,
                nome_completo: nomeCompleto,
                data_nascimento: dataNascimento,
                telefone_whatsapp: telefoneWhatsapp,
                endereco,
                bairro,
                unidade_saude_id: unidadeSaudeId,
                grupo_vulnerabilidade: grupoVulnerabilidade,
              }
            : p
        );
      }

      // 2. Create Solicitacao TFD
      const newSolId = `sol-${Date.now()}`;
      const pontoObj = db.pontos_espera.find((p) => p.id === pontoEsperaId);
      const newSolicitacao: SolicitacaoTFD = {
        id: newSolId,
        paciente_id: patientId,
        cid_10: cid10,
        cid_10_descricao: cidDescricao || undefined,
        especialidade_medica: especialidadeMedica,
        hospital_destino: hospitalDestino,
        cidade_destino: cidadeDestino,
        data_agendada_consulta: dataAgendada,
        horario_agendado_consulta: horarioAgendado,
        requer_acompanhante: requerAcompanhante,
        justificativa_acompanhante: requerAcompanhante ? acompJustificativa : undefined,
        status: 'Pendente',
        observacoes,
        data_solicitacao: new Date().toISOString(),
        laudo_anexo_nome: laudoNome,
        laudo_medico_crm: crmMedico || 'CRM-BA 00000',
        ponto_espera_id: pontoEsperaId,
        ponto_espera_nome: pontoObj?.nome || 'Pátio da Secretaria de Saúde',
        horario_saida_previsto: horarioSaidaPrevisto,
        data_viagem_prevista: dataAgendada,
        ordem_numero: `OS-TFD-2026/${Math.floor(100 + Math.random() * 900)}`,
        operador_emissor_nome: 'Atendente de Triagem TFD',
      };

      // 3. Create Acompanhante if required
      const updatedAcompanhantes = [...prev.acompanhantes];
      if (requerAcompanhante) {
        const newAcomp: Acompanhante = {
          id: `acomp-${Date.now()}`,
          solicitacao_id: newSolId,
          cpf: acompCpf,
          nome_completo: acompNome,
          grau_parentesco: acompParentesco,
          telefone: acompTelefone || telefoneWhatsapp,
        };
        updatedAcompanhantes.push(newAcomp);
      }

      return {
        ...prev,
        pacientes: updatedPacientes,
        solicitacoes_tfd: [newSolicitacao, ...prev.solicitacoes_tfd],
        acompanhantes: updatedAcompanhantes,
      };
    });

    setSuccessMessage('Solicitação de TFD cadastrada com sucesso! Ela agora consta como Pendente para regulação médica.');
    resetForm();
    setViewMode('list');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // Change solicitation status
  const handleUpdateStatus = (solId: string, newStatus: SolicitacaoStatus) => {
    onUpdateDb((prev) => ({
      ...prev,
      solicitacoes_tfd: prev.solicitacoes_tfd.map((s) =>
        s.id === solId ? { ...s, status: newStatus } : s
      ),
    }));
  };

  // Filter solicitations table
  const filteredSolicitacoes = db.solicitacoes_tfd.filter((sol) => {
    const matchesStatus = statusFilter === 'Todos' || sol.status === statusFilter;
    const paciente = db.pacientes.find((p) => p.id === sol.paciente_id);
    const searchLow = searchTableQuery.toLowerCase();
    const matchesQuery =
      !searchTableQuery ||
      paciente?.nome_completo.toLowerCase().includes(searchLow) ||
      paciente?.cpf.includes(searchLow) ||
      sol.hospital_destino.toLowerCase().includes(searchLow) ||
      sol.especialidade_medica.toLowerCase().includes(searchLow);

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-700" />
            Módulo de Triagem & Solicitações TFD
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro de pacientes, anexo de laudos médicos, regulação de acompanhante e aprovação de pedidos.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Solicitações TFD ({db.solicitacoes_tfd.length})
          </button>

          <button
            onClick={() => setViewMode('pacientes')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              viewMode === 'pacientes'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Cadastro de Pacientes ({db.pacientes.length})
          </button>

          {onOpenCadastroModal && (
            <button
              onClick={onOpenCadastroModal}
              className="px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
              <span>+ Novo Paciente</span>
            </button>
          )}

          <button
            onClick={() => {
              resetForm();
              setViewMode('create');
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'create'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>+ Fazer Ordem TFD</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* CREATE MODE: PATIENT + TFD REQUEST FORM */}
      {viewMode === 'create' && (
        <div className="space-y-6">
          {/* Quick Search Card for existing patient */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Busca Rápida de Paciente
                </span>
                <p className="text-xs text-slate-500">
                  Digite o CPF ou Cartão SUS para preencher automaticamente os dados cadastrais
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchDoc}
                    onChange={(e) => setSearchDoc(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
                    placeholder="CPF ou Cartão SUS..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearchPatient}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Localizar
                </button>
              </div>
            </div>

            {selectedPatientId && (
              <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Paciente identificado no cadastro municipal: <strong>{nomeCompleto}</strong> (CPF: {cpf})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-emerald-800 font-semibold underline hover:text-emerald-950 cursor-pointer"
                >
                  Limpar / Cadastrar outro
                </button>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Dados do Paciente */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">1</span>
                  Identificação do Paciente
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* CPF */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    CPF <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(maskCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={`w-full p-2 border rounded-lg font-mono ${
                      errors.cpf ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {errors.cpf && <p className="text-[10px] text-red-600 mt-0.5">{errors.cpf}</p>}
                </div>

                {/* Cartão SUS */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cartão Nacional de Saúde (CNS - 15 dígitos) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cartaoSus}
                    onChange={(e) => setCartaoSus(maskCNS(e.target.value))}
                    placeholder="000 0000 0000 0000"
                    maxLength={19}
                    className={`w-full p-2 border rounded-lg font-mono ${
                      errors.cartaoSus ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {errors.cartaoSus && <p className="text-[10px] text-red-600 mt-0.5">{errors.cartaoSus}</p>}
                </div>

                {/* Nome Completo */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    placeholder="Ex: Maria das Graças Silva"
                    className={`w-full p-2 border rounded-lg ${
                      errors.nomeCompleto ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {errors.nomeCompleto && <p className="text-[10px] text-red-600 mt-0.5">{errors.nomeCompleto}</p>}
                </div>

                {/* Data Nascimento */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Data de Nascimento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    className={`w-full p-2 border rounded-lg font-mono ${
                      errors.dataNascimento ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {errors.dataNascimento && <p className="text-[10px] text-red-600 mt-0.5">{errors.dataNascimento}</p>}
                </div>

                {/* Telefone / WhatsApp */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Telefone / WhatsApp para Aviso de Embarque <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={telefoneWhatsapp}
                    onChange={(e) => setTelefoneWhatsapp(maskPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className={`w-full p-2 border rounded-lg font-mono ${
                      errors.telefoneWhatsapp ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {errors.telefoneWhatsapp && <p className="text-[10px] text-red-600 mt-0.5">{errors.telefoneWhatsapp}</p>}
                </div>

                {/* Unidade Básica de Saúde */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Unidade de Saúde de Origem (USF/PSF)
                  </label>
                  <select
                    value={unidadeSaudeId}
                    onChange={(e) => setUnidadeSaudeId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {db.unidades_saude.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome} ({u.bairro_comunidade})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Endereço */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Endereço Residencial (Rua, Número)
                  </label>
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Ex: Rua Bahia, 120"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                {/* Bairro */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bairro / Comunidade Rural
                  </label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Ex: Centro ou Zona Rural"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                {/* Grupo de Vulnerabilidade */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Prioridade / Grupo de Vulnerabilidade
                  </label>
                  <select
                    value={grupoVulnerabilidade}
                    onChange={(e) => setGrupoVulnerabilidade(e.target.value as VulnerabilidadeGrupo)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Nenhum">Nenhum (Fluxo Geral)</option>
                    <option value="Idoso">Idoso (&ge; 60 anos)</option>
                    <option value="Gestante">Gestante de Alto Risco</option>
                    <option value="Cadeirante / PNE">Cadeirante / Pessoa com Deficiência</option>
                    <option value="Paciente Oncológico">Paciente Oncológico (Tratamento Ativo)</option>
                    <option value="Tratamento Renal Contínuo">Tratamento Renal Contínuo (Hemodiálise)</option>
                    <option value="Pediatria / Infantil">Pediatria / Infantil</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Dados Médicos e Laudo TFD */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">2</span>
                  Laudo Médico e Destino da Consulta
                </h3>
                <span className="text-[11px] text-slate-500">Regulação TFD / SUS</span>
              </div>

              {/* Quick CID-10 selection chips */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  Atalhos de CID-10 mais frequentes no município:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_CID10.slice(0, 7).map((item) => (
                    <button
                      type="button"
                      key={item.code}
                      onClick={() => {
                        setCid10(item.code);
                        setCidDescricao(item.name);
                        setEspecialidadeMedica(item.specialty);
                      }}
                      className="px-2.5 py-1 text-[11px] rounded bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer border border-slate-200 font-mono"
                    >
                      <b className="font-bold text-emerald-800">{item.code}</b>: {item.name.slice(0, 28)}...
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* CID-10 */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Código CID-10 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cid10}
                    onChange={(e) => setCid10(e.target.value.toUpperCase())}
                    placeholder="Ex: C50.9 ou N18.0"
                    className={`w-full p-2 border rounded-lg font-mono ${
                      errors.cid10 ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {errors.cid10 && <p className="text-[10px] text-red-600 mt-0.5">{errors.cid10}</p>}
                </div>

                {/* CID Descrição */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Descrição do Diagnóstico / CID
                  </label>
                  <input
                    type="text"
                    value={cidDescricao}
                    onChange={(e) => setCidDescricao(e.target.value)}
                    placeholder="Ex: Neoplasia maligna da mama"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                {/* Especialidade Médica */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Especialidade Médica Solicitada <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={especialidadeMedica}
                    onChange={(e) => setEspecialidadeMedica(e.target.value)}
                    placeholder="Ex: Oncologia Clínica, Oftalmologia, etc."
                    className={`w-full p-2 border rounded-lg ${
                      errors.especialidadeMedica ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {errors.especialidadeMedica && <p className="text-[10px] text-red-600 mt-0.5">{errors.especialidadeMedica}</p>}
                </div>

                {/* Cidade de Destino */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cidade de Destino <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={cidadeDestino}
                    onChange={(e) => setCidadeDestino(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Salvador">Salvador (Capital)</option>
                    <option value="Feira de Santana">Feira de Santana</option>
                    <option value="Recife">Recife / PE</option>
                    <option value="Barretos">Barretos / SP (Hospital de Amor)</option>
                    <option value="Belo Horizonte">Belo Horizonte / MG</option>
                  </select>
                </div>

                {/* Hospital de Destino */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hospital / Clínica de Referência <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hospitalDestino}
                    onChange={(e) => setHospitalDestino(e.target.value)}
                    placeholder="Ex: Hospital das Clínicas ou Santa Izabel"
                    list="hospitais-list"
                    className={`w-full p-2 border rounded-lg ${
                      errors.hospitalDestino ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  <datalist id="hospitais-list">
                    {COMMON_HOSPITALS.map((h) => (
                      <option key={h.nome} value={h.nome} />
                    ))}
                  </datalist>
                  {errors.hospitalDestino && <p className="text-[10px] text-red-600 mt-0.5">{errors.hospitalDestino}</p>}
                </div>

                {/* Data Agendada Consulta */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Data Agendada da Consulta / Procedimento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dataAgendada}
                    onChange={(e) => setDataAgendada(e.target.value)}
                    className={`w-full p-2 border rounded-lg font-mono ${
                      errors.dataAgendada ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {errors.dataAgendada && <p className="text-[10px] text-red-600 mt-0.5">{errors.dataAgendada}</p>}
                </div>

                {/* Ponto de Espera */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ponto de Espera do Município <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={pontoEsperaId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setPontoEsperaId(id);
                      const p = db.pontos_espera.find((pt) => pt.id === id);
                      if (p?.horario_estimado_passagem) {
                        setHorarioSaidaPrevisto(p.horario_estimado_passagem);
                      }
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {db.pontos_espera.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} (Passagem: {p.horario_estimado_passagem})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Horário que o Carro Passa */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Horário de Saída no Ponto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={horarioSaidaPrevisto}
                    onChange={(e) => setHorarioSaidaPrevisto(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-950"
                  />
                </div>

                {/* CRM do Médico */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    CRM do Médico Solicitante
                  </label>
                  <input
                    type="text"
                    value={crmMedico}
                    onChange={(e) => setCrmMedico(e.target.value)}
                    placeholder="Ex: CRM-BA 24890"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                {/* Anexo do Laudo Médico */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Anexo do Laudo Médico Oficial (PDF ou Imagem Digitalizada)
                  </label>
                  <div className="flex items-center gap-3 p-2.5 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                    <Paperclip className="w-5 h-5 text-slate-400 shrink-0" />
                    <div className="flex-1 text-xs text-slate-600 truncate">
                      <span className="font-semibold text-slate-800">{laudoNome}</span> (Digitalizado / Autenticado)
                    </div>
                    <label className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-300 cursor-pointer shadow-2xs">
                      Alterar Arquivo
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setLaudoNome(e.target.files[0].name);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Observações */}
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Observações Clínicas / Histórico do Paciente
                  </label>
                  <textarea
                    rows={2}
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Instruções adicionais para a equipe de transporte (ex: paciente necessita de oxigênio portátil, uso de cadeira de rodas, etc.)..."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Requer Acompanhante? (Dynamic companion fields) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-emerald-700" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Controle de Acompanhante
                    </h3>
                    <p className="text-xs text-slate-500">
                      Conforme Portaria SAS 055/99: permitido quando há indicação médica expressa ou menor de idade/idoso.
                    </p>
                  </div>
                </div>

                {/* Switch Requer Acompanhante */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requerAcompanhante}
                    onChange={(e) => setRequerAcompanhante(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-3 text-xs font-bold text-slate-800">
                    {requerAcompanhante ? 'Sim, requer vaga' : 'Não necessita'}
                  </span>
                </label>
              </div>

              {/* Dynamic Companion Section */}
              {requerAcompanhante && (
                <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-4">
                  <div className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Dados do Acompanhante Autorizado
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    {/* Nome Acompanhante */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Nome Completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={acompNome}
                        onChange={(e) => setAcompNome(e.target.value)}
                        placeholder="Ex: Ana Paula da Silva"
                        className={`w-full p-2 border rounded-lg bg-white ${
                          errors.acompNome ? 'border-red-500 bg-red-50' : 'border-slate-300'
                        }`}
                      />
                      {errors.acompNome && <p className="text-[10px] text-red-600 mt-0.5">{errors.acompNome}</p>}
                    </div>

                    {/* CPF Acompanhante */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        CPF do Acompanhante <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={acompCpf}
                        onChange={(e) => setAcompCpf(maskCPF(e.target.value))}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className={`w-full p-2 border rounded-lg bg-white font-mono ${
                          errors.acompCpf ? 'border-red-500 bg-red-50' : 'border-slate-300'
                        }`}
                      />
                      {errors.acompCpf && <p className="text-[10px] text-red-600 mt-0.5">{errors.acompCpf}</p>}
                    </div>

                    {/* Parentesco */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Grau de Parentesco
                      </label>
                      <select
                        value={acompParentesco}
                        onChange={(e) => setAcompParentesco(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Mãe / Pai">Mãe / Pai</option>
                        <option value="Filho(a)">Filho(a)</option>
                        <option value="Cônjuge / Companheiro(a)">Cônjuge / Companheiro(a)</option>
                        <option value="Irmão(ã)">Irmão(ã)</option>
                        <option value="Cuidador / Responsável Legal">Cuidador / Responsável Legal</option>
                        <option value="Outro">Outro Familiar</option>
                      </select>
                    </div>

                    {/* Telefone Acompanhante */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        WhatsApp do Acompanhante
                      </label>
                      <input
                        type="text"
                        value={acompTelefone}
                        onChange={(e) => setAcompTelefone(maskPhone(e.target.value))}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                      />
                    </div>

                    {/* Justificativa Médica */}
                    <div className="sm:col-span-2 lg:col-span-4">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Justificativa Médica para Acompanhante <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={acompJustificativa}
                        onChange={(e) => setAcompJustificativa(e.target.value)}
                        placeholder="Ex: Paciente com mobilidade reduzida decorrente de artrose severa, necessitando de suporte para locomoção e alimentação."
                        className={`w-full p-2 border rounded-lg bg-white ${
                          errors.acompJustificativa ? 'border-red-500 bg-red-50' : 'border-slate-300'
                        }`}
                      />
                      {errors.acompJustificativa && (
                        <p className="text-[10px] text-red-600 mt-0.5">{errors.acompJustificativa}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bottom Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Protocolar Solicitação TFD
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LIST MODE: TABELA DE SOLICITAÇÕES */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Status:
              </span>
              {['Todos', 'Pendente', 'Aprovado', 'Concluido', 'Cancelado'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
                placeholder="Buscar por paciente, CPF ou hospital..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Paciente / Documentos</th>
                    <th className="py-3 px-4">CID-10 & Especialidade</th>
                    <th className="py-3 px-4">Destino & Data</th>
                    <th className="py-3 px-4">Acompanhante</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações Regulatórias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSolicitacoes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        Nenhuma solicitação encontrada para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredSolicitacoes.map((sol) => {
                      const paciente = db.pacientes.find((p) => p.id === sol.paciente_id);
                      const acomp = db.acompanhantes.find((a) => a.solicitacao_id === sol.id);

                      return (
                        <tr key={sol.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-xs">
                              {paciente?.nome_completo || 'Paciente não identificado'}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              CPF: {paciente?.cpf}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              CNS: {paciente?.cartao_sus}
                            </div>
                            {paciente?.grupo_vulnerabilidade && paciente.grupo_vulnerabilidade !== 'Nenhum' && (
                              <span className="inline-block mt-1 text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200/50 font-medium">
                                {paciente.grupo_vulnerabilidade}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold font-mono text-emerald-800">
                              {sol.cid_10}
                            </div>
                            <div className="text-slate-800 font-medium mt-0.5">
                              {sol.especialidade_medica}
                            </div>
                            {sol.cid_10_descricao && (
                              <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                                {sol.cid_10_descricao}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-slate-700">
                            <div className="font-semibold text-slate-900">
                              {sol.cidade_destino}
                            </div>
                            <div className="text-slate-500 text-[11px]">
                              {sol.hospital_destino}
                            </div>
                            <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                              Data: {formatDateBR(sol.data_agendada_consulta)}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {sol.requer_acompanhante ? (
                              <div>
                                <span className="inline-block text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                  Sim (Requer Vaga)
                                </span>
                                {acomp && (
                                  <div className="text-[11px] text-slate-700 mt-1 font-medium">
                                    {acomp.nome_completo} ({acomp.grau_parentesco})
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">Não requerido</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded border inline-block ${
                                sol.status === 'Aprovado'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : sol.status === 'Pendente'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : sol.status === 'Cancelado'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {sol.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {sol.status === 'Pendente' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(sol.id, 'Aprovado')}
                                    title="Aprovar Laudo e Liberar para Viagem"
                                    className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors cursor-pointer"
                                  >
                                    Aprovar
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(sol.id, 'Cancelado')}
                                    title="Cancelar / Indeferir"
                                    className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors cursor-pointer"
                                  >
                                    Rejeitar
                                  </button>
                                </>
                              )}

                                {sol.status === 'Aprovado' && (
                                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" /> Pronto p/ Frota
                                  </span>
                                )}

                                <button
                                  onClick={() => onOpenEtiqueta(sol)}
                                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Imprimir Etiqueta / Papel de Viagem com ponto e horário para o paciente"
                                >
                                  <Tag className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Etiqueta</span>
                                </button>
                                <button
                                  onClick={() => onOpenOrdemTFD(sol)}
                                  className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Gerar e Imprimir Ordem de Transporte TFD Gratuita (A4)"
                                >
                                  <FileBadge className="w-3.5 h-3.5" />
                                  <span>Ordem Gratuita</span>
                                </button>
                              </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PACIENTES MODE: CADASTRO GERAL DE PACIENTES */}
      {viewMode === 'pacientes' && (
        <div className="space-y-4">
          {/* Header & Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Prontuário e Cadastro Geral de Pacientes do Município
                </h3>
                <p className="text-xs text-slate-500">
                  {db.pacientes.length} paciente(s) registrado(s) no sistema de Tratamento Fora do Domicílio
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchPatientQuery}
                  onChange={(e) => setSearchPatientQuery(e.target.value)}
                  placeholder="Buscar por nome, CPF ou SUS..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
                />
              </div>

              {onOpenCadastroModal && (
                <button
                  type="button"
                  onClick={onOpenCadastroModal}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Cadastrar Paciente</span>
                </button>
              )}
            </div>
          </div>

          {/* Pacientes Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Paciente / Prioridade</th>
                    <th className="py-3 px-4">CPF & Cartão SUS</th>
                    <th className="py-3 px-4">Contato & Bairro</th>
                    <th className="py-3 px-4">USF de Referência</th>
                    <th className="py-3 px-4 text-center">Ordens TFD</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {db.pacientes
                    .filter((p) => {
                      if (!searchPatientQuery) return true;
                      const q = searchPatientQuery.toLowerCase();
                      return (
                        p.nome_completo.toLowerCase().includes(q) ||
                        p.cpf.includes(q) ||
                        p.cartao_sus.includes(q) ||
                        p.bairro.toLowerCase().includes(q)
                      );
                    })
                    .map((pac) => {
                      const usf = db.unidades_saude.find((u) => u.id === pac.unidade_saude_id);
                      const totalSols = db.solicitacoes_tfd.filter((s) => s.paciente_id === pac.id).length;

                      return (
                        <tr key={pac.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-xs">
                              {pac.nome_completo}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Nasc.: {formatDateBR(pac.data_nascimento)}
                            </div>
                            {pac.grupo_vulnerabilidade && pac.grupo_vulnerabilidade !== 'Nenhum' && (
                              <span className="inline-block mt-1 text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60 font-semibold">
                                {pac.grupo_vulnerabilidade}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            <div className="text-slate-800 font-bold">
                              CPF: {pac.cpf}
                            </div>
                            <div className="text-slate-500 text-[11px] mt-0.5">
                              CNS: {pac.cartao_sus}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            <div className="font-medium text-slate-800">
                              {pac.telefone_whatsapp}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                              {pac.endereco}, {pac.bairro}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            <div className="font-medium text-slate-800">
                              {usf?.nome || 'USF de Referência'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              CNES: {usf?.cnes || 'N/D'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                              {totalSols}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  if (onOpenEmitirOS) {
                                    onOpenEmitirOS(pac.id);
                                  } else {
                                    loadPatientData(pac);
                                  }
                                }}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Emitir Nova Ordem de Transporte TFD para este paciente"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Fazer Ordem TFD</span>
                              </button>

                              <button
                                onClick={() => loadPatientData(pac)}
                                className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                title="Editar dados cadastrais deste paciente"
                              >
                                Editar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
