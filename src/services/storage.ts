import { TFDDatabase, UsuarioSistema } from '../types/tfd';

const STORAGE_KEY = 'tfd_municipal_database_v3';
const ACTIVE_USER_KEY = 'tfd_active_user_v3';

// Base de dados inicial com EXATAMENTE 1 EXEMPLO DE CADA SERVIÇO / ENTIDADE
// e APENAS o usuário MASTER solicitado: CPF 13012994483, Senha 1234
export const INITIAL_DATABASE: TFDDatabase = {
  unidades_saude: [
    {
      id: 'usf-01',
      cnes: '2548912',
      nome: 'USF Central Dr. Aloysio de Castro',
      bairro_comunidade: 'Centro',
      telefone: '(75) 3281-2200',
    },
  ],

  pontos_espera: [
    {
      id: 'pe-01',
      nome: 'Pátio da Secretaria Municipal de Saúde (Centro)',
      endereco: 'Av. Getúlio Vargas, 100',
      bairro_regiao: 'Centro',
      horario_estimado_passagem: '03:30',
      referencia: 'Em frente ao portão principal da Secretaria',
    },
    {
      id: 'pe-02',
      nome: 'Praça da Matriz / Coreto Central',
      endereco: 'Praça Castro Alves, s/n',
      bairro_regiao: 'Centro Histórico',
      horario_estimado_passagem: '03:45',
      referencia: 'Ao lado do coreto central',
    },
  ],

  // 1 Exemplo de Paciente
  pacientes: [
    {
      id: 'pac-01',
      cpf: '702.481.932-15',
      cartao_sus: '702 4819 3215 0004',
      nome_completo: 'Dona Raimunda Nonata dos Santos',
      data_nascimento: '1958-04-12',
      telefone_whatsapp: '(75) 98844-1234',
      endereco: 'Rua das Flores, 142',
      bairro: 'Centro',
      unidade_saude_id: 'usf-01',
      grupo_vulnerabilidade: 'Idoso',
      criado_em: '2026-10-20T10:00:00Z',
    },
  ],

  // 1 Exemplo de Solicitação TFD
  solicitacoes_tfd: [
    {
      id: 'sol-01',
      paciente_id: 'pac-01',
      cid_10: 'H25.9',
      cid_10_descricao: 'Catarata senil não especificada',
      especialidade_medica: 'Oftalmologia / Cirurgia de Facectomia',
      hospital_destino: 'Hospital das Clínicas da UFBA',
      cidade_destino: 'Salvador',
      data_agendada_consulta: '2026-10-26',
      horario_agendado_consulta: '08:30',
      requer_acompanhante: true,
      justificativa_acompanhante: 'Paciente idosa (68 anos) com acuidade visual severamente reduzida, necessita de auxílio para locomoção.',
      status: 'Aprovado',
      observacoes: 'Procedimento cirúrgico ambulatorial confirmado pela Central Estadual de Regulação.',
      data_solicitacao: '2026-10-20T09:00:00Z',
      laudo_anexo_nome: 'laudo_oftalmo_raimunda.pdf',
      laudo_medico_crm: 'CRM-BA 19842',
      ponto_espera_id: 'pe-01',
      ponto_espera_nome: 'Pátio da Secretaria Municipal de Saúde (Centro)',
      horario_saida_previsto: '03:30',
      data_viagem_prevista: '2026-10-26',
      ordem_numero: 'OS-TFD-2026/0001',
      operador_emissor_nome: 'Administrador Master TFD',
      ponto_tfd_origem: 'Central Municipal de TFD - Sede',
    },
  ],

  // 1 Exemplo de Acompanhante
  acompanhantes: [
    {
      id: 'acomp-01',
      solicitacao_id: 'sol-01',
      cpf: '492.118.005-43',
      nome_completo: 'Mariana dos Santos Moreira',
      grau_parentesco: 'Filha',
      telefone: '(75) 98844-9988',
    },
  ],

  // 1 Exemplo de Veículo
  veiculos: [
    {
      id: 'veic-01',
      placa: 'PKB-4G21',
      modelo: 'Mercedes-Benz Sprinter 415 CDI (Ar/Elevador PNE)',
      capacidade_passageiros: 15,
      status: 'Ativo',
      tipo_veiculo: 'Van',
    },
  ],

  // 1 Exemplo de Motorista
  motoristas: [
    {
      id: 'mot-01',
      nome_completo: 'Antônio José da Silva (Tonho)',
      cpf: '402.193.882-01',
      cnh: '04829103991',
      categoria_cnh: 'D',
      celular: '(75) 99188-4422',
    },
  ],

  // 1 Exemplo de Viagem Agendada
  viagens_agendadas: [
    {
      id: 'vg-01',
      codigo_viagem: 'TFD-VG-2026-001',
      cidade_destino: 'Salvador',
      data_partida: '2026-10-26',
      horario_partida: '04:00',
      ponto_encontro: 'Pátio da Secretaria Municipal de Saúde (Av. Getúlio Vargas, 100)',
      veiculo_id: 'veic-01',
      motorista_id: 'mot-01',
      status_viagem: 'Programada',
      observacoes: 'Roteiro TFD: Hospital das Clínicas da UFBA.',
    },
  ],

  // 1 Exemplo de Passageiros alocados (Paciente e Acompanhante da solicitação 01)
  passageiros_viagem: [
    {
      id: 'pv-01',
      viagem_id: 'vg-01',
      solicitacao_id: 'sol-01',
      tipo_passageiro: 'Paciente',
      nome_passageiro: 'Dona Raimunda Nonata dos Santos',
      cpf_passageiro: '702.481.932-15',
      cartao_sus_passageiro: '702 4819 3215 0004',
      numero_poltrona: 1,
      status_presenca: 'Pendente',
      voucher_token: 'VCH-2026-R8N1',
      ponto_espera_nome: 'Pátio da Secretaria Municipal de Saúde (Centro)',
      horario_embarque_ponto: '03:30',
    },
    {
      id: 'pv-02',
      viagem_id: 'vg-01',
      solicitacao_id: 'sol-01',
      tipo_passageiro: 'Acompanhante',
      nome_passageiro: 'Mariana dos Santos Moreira',
      cpf_passageiro: '492.118.005-43',
      numero_poltrona: 2,
      status_presenca: 'Pendente',
      voucher_token: 'VCH-2026-R8N2',
      ponto_espera_nome: 'Pátio da Secretaria Municipal de Saúde (Centro)',
      horario_embarque_ponto: '03:30',
    },
  ],

  // 1 Exemplo de Diária de Ajuda de Custo
  diarias_ajuda_custo: [
    {
      id: 'dia-01',
      solicitacao_id: 'sol-01',
      tipo_concessao: 'Alimentação',
      valor_pago: 80.00,
      forma_pagamento: 'PIX',
      recibo_assinado: true,
      data_pagamento: '2026-10-21',
      observacoes: 'Auxílio alimentação para paciente e acompanhante conforme Portaria SAS/MS 055/1999.',
    },
  ],

  // APENAS O USUÁRIO MASTER SOLICITADO
  usuarios_sistema: [
    {
      id: 'usr-master',
      cpf: '130.129.944-83', // 13012994483
      senha: '1234',
      senha_hash: '1234',
      nome_completo: 'Administrador Master TFD',
      perfil: 'Master',
      cargo: 'Coordenador Geral Master do TFD',
      ponto_tfd_lotacao: 'Central Municipal de TFD - Sede',
      ativo: true,
    },
  ],
};

// Storage helpers
export function getTFDDatabase(): TFDDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
      return INITIAL_DATABASE;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.pacientes || !parsed.usuarios_sistema || parsed.usuarios_sistema.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
      return INITIAL_DATABASE;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading TFD Database from localStorage:', err);
    return INITIAL_DATABASE;
  }
}

export function saveTFDDatabase(db: TFDDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Error saving TFD Database to localStorage:', err);
  }
}

export function resetTFDDatabase(): TFDDatabase {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
  return INITIAL_DATABASE;
}

// Active user / Authentication helpers
export function getActiveUser(): UsuarioSistema | null {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.cpf) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return null; // Requires login
}

export function setActiveUser(user: UsuarioSistema | null): void {
  if (user) {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(ACTIVE_USER_KEY);
  }
}

export function authenticateUser(cpfInput: string, senhaInput: string, db: TFDDatabase): { success: boolean; user?: UsuarioSistema; message?: string } {
  const cleanCpf = cpfInput.replace(/\D/g, '');
  if (!cleanCpf) {
    return { success: false, message: 'Por favor, informe o CPF de acesso.' };
  }

  const user = db.usuarios_sistema.find(
    (u) => u.cpf.replace(/\D/g, '') === cleanCpf
  );

  if (!user) {
    return { success: false, message: 'Usuário não localizado no sistema municipal.' };
  }

  if (!user.ativo) {
    return { success: false, message: 'Este operador está desativado. Contate o Administrador Master.' };
  }

  const userPass = user.senha || user.senha_hash || '1234';
  if (userPass !== senhaInput.trim()) {
    return { success: false, message: 'Senha incorreta. Verifique suas credenciais.' };
  }

  return { success: true, user };
}
