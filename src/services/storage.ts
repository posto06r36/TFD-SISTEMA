import { TFDDatabase, Paciente, SolicitacaoTFD, Acompanhante, ViagemAgendada, PassageiroViagem, DiariaAjudaCusto, Veiculo, Motorista, UsuarioSistema, PontoEspera } from '../types/tfd';

const STORAGE_KEY = 'tfd_municipal_database_v1';
const ACTIVE_USER_KEY = 'tfd_active_user_v1';

export const INITIAL_DATABASE: TFDDatabase = {
  unidades_saude: [
    {
      id: 'usf-01',
      cnes: '2548912',
      nome: 'USF Central Dr. Aloysio de Castro',
      bairro_comunidade: 'Centro',
      telefone: '(75) 3281-2200',
    },
    {
      id: 'usf-02',
      cnes: '2548920',
      nome: 'USF Bela Vista - Enf. Maria José',
      bairro_comunidade: 'Bela Vista',
      telefone: '(75) 3281-2244',
    },
    {
      id: 'usf-03',
      cnes: '2548939',
      nome: 'UBS Vila Esperança',
      bairro_comunidade: 'Vila Esperança',
      telefone: '(75) 3281-2390',
    },
    {
      id: 'usf-04',
      cnes: '2548947',
      nome: 'USF Povoado Santo Antônio (Rural)',
      bairro_comunidade: 'Zona Rural',
      telefone: '(75) 99812-4011',
    },
  ],

  pontos_espera: [
    {
      id: 'pe-01',
      nome: 'Pátio da Secretaria de Saúde (Centro)',
      endereco: 'Av. Getúlio Vargas, 100',
      bairro_regiao: 'Centro',
      horario_estimado_passagem: '03:30',
      referencia: 'Em frente ao portão principal da Secretaria',
    },
    {
      id: 'pe-02',
      nome: 'Praça da Matriz / Igreja Matriz',
      endereco: 'Praça Castro Alves, s/n',
      bairro_regiao: 'Centro Histórico',
      horario_estimado_passagem: '03:45',
      referencia: 'Ao lado do coreto central',
    },
    {
      id: 'pe-03',
      nome: 'USF Bela Vista (Av. Brasil)',
      endereco: 'Av. Brasil, 840',
      bairro_regiao: 'Bela Vista',
      horario_estimado_passagem: '04:00',
      referencia: 'Em frente à guarita da USF',
    },
    {
      id: 'pe-04',
      nome: 'UBS Vila Esperança',
      endereco: 'Rua São Jorge, 40',
      bairro_regiao: 'Vila Esperança',
      horario_estimado_passagem: '04:15',
      referencia: 'Parada de ônibus da UBS',
    },
    {
      id: 'pe-05',
      nome: 'Posto de Combustíveis Trevo da BR',
      endereco: 'Rodovia BR-101, km 210',
      bairro_regiao: 'Entrada da Cidade',
      horario_estimado_passagem: '04:30',
      referencia: 'Pátio de conveniência do posto',
    },
    {
      id: 'pe-06',
      nome: 'Trevo do Povoado Santo Antônio (Zona Rural)',
      endereco: 'Estrada Vicinal do Povoado, km 4',
      bairro_regiao: 'Zona Rural',
      horario_estimado_passagem: '03:15',
      referencia: 'Em frente à Mercearia São José',
    },
  ],

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
      criado_em: '2026-09-10T10:00:00Z',
    },
    {
      id: 'pac-02',
      cpf: '381.920.445-88',
      cartao_sus: '741 8294 0012 3456',
      nome_completo: 'Carlos Eduardo Ferreira Lima',
      data_nascimento: '1974-08-25',
      telefone_whatsapp: '(75) 99123-8899',
      endereco: 'Av. Brasil, 850, Apto 201',
      bairro: 'Bela Vista',
      unidade_saude_id: 'usf-02',
      grupo_vulnerabilidade: 'Paciente Oncológico',
      criado_em: '2026-09-15T14:30:00Z',
    },
    {
      id: 'pac-03',
      cpf: '812.390.114-02',
      cartao_sus: '891 0023 4455 6677',
      nome_completo: 'Juliana Mendes de Oliveira',
      data_nascimento: '1992-11-03',
      telefone_whatsapp: '(75) 98711-5522',
      endereco: 'Rua São Jorge, 45',
      bairro: 'Vila Esperança',
      unidade_saude_id: 'usf-03',
      grupo_vulnerabilidade: 'Cadeirante / PNE',
      criado_em: '2026-10-01T08:15:00Z',
    },
    {
      id: 'pac-04',
      cpf: '540.119.823-74',
      cartao_sus: '701 4482 9901 2234',
      nome_completo: 'Sebastião Alves Moreira',
      data_nascimento: '1963-01-19',
      telefone_whatsapp: '(75) 99901-3344',
      endereco: 'Sítio Boa Vista, km 4',
      bairro: 'Zona Rural',
      unidade_saude_id: 'usf-04',
      grupo_vulnerabilidade: 'Tratamento Renal Contínuo',
      criado_em: '2026-10-05T11:20:00Z',
    },
    {
      id: 'pac-05',
      cpf: '918.234.561-90',
      cartao_sus: '789 1234 5678 9012',
      nome_completo: 'Enzo Gabriel Santos Costa (Menor)',
      data_nascimento: '2019-06-15',
      telefone_whatsapp: '(75) 98144-7788',
      endereco: 'Rua Projetada, 12',
      bairro: 'Bela Vista',
      unidade_saude_id: 'usf-02',
      grupo_vulnerabilidade: 'Pediatria / Infantil',
      criado_em: '2026-10-12T16:00:00Z',
    },
  ],

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
      data_solicitacao: '2026-10-18T09:00:00Z',
      laudo_anexo_nome: 'laudo_oftalmo_raimunda.pdf',
      laudo_medico_crm: 'CRM-BA 19842',
      ponto_espera_id: 'pe-01',
      ponto_espera_nome: 'Pátio da Secretaria de Saúde (Centro)',
      horario_saida_previsto: '03:30',
      data_viagem_prevista: '2026-10-26',
      ordem_numero: 'OS-TFD-2026/0101',
      operador_emissor_nome: 'Silvia Cristina (Balcão USF Central)',
      ponto_tfd_origem: 'USF Central Dr. Aloysio de Castro',
    },
    {
      id: 'sol-02',
      paciente_id: 'pac-02',
      cid_10: 'C18.9',
      cid_10_descricao: 'Neoplasia maligna do cólon',
      especialidade_medica: 'Oncologia Clínica / Quimioterapia Ciclo 4',
      hospital_destino: 'Hospital Aristides Maltez (Liga Contra o Câncer)',
      cidade_destino: 'Salvador',
      data_agendada_consulta: '2026-10-26',
      horario_agendado_consulta: '09:00',
      requer_acompanhante: true,
      justificativa_acompanhante: 'Reações adversas severas pós-infusão quimioterápica (náuseas e prostração).',
      status: 'Aprovado',
      observacoes: 'Sessão 4 de 8 autorizada via APAC Oncológica.',
      data_solicitacao: '2026-10-19T11:30:00Z',
      laudo_anexo_nome: 'laudo_onco_carlos.pdf',
      laudo_medico_crm: 'CRM-BA 24109',
      ponto_espera_id: 'pe-03',
      ponto_espera_nome: 'USF Bela Vista (Av. Brasil)',
      horario_saida_previsto: '04:00',
      data_viagem_prevista: '2026-10-26',
      ordem_numero: 'OS-TFD-2026/0102',
      operador_emissor_nome: 'Rodrigo Alcantara (Regulador)',
      ponto_tfd_origem: 'USF Bela Vista',
    },
    {
      id: 'sol-03',
      paciente_id: 'pac-03',
      cid_10: 'M16.9',
      cid_10_descricao: 'Coxartrose (Artrose severa do quadril)',
      especialidade_medica: 'Ortopedia / Avaliação Pré-Operatória Artroplastia',
      hospital_destino: 'Hospital Santa Izabel',
      cidade_destino: 'Salvador',
      data_agendada_consulta: '2026-10-26',
      horario_agendado_consulta: '11:00',
      requer_acompanhante: true,
      justificativa_acompanhante: 'Paciente cadeirante, mobilidade nula nos membros inferiores sem suporte físico.',
      status: 'Aprovado',
      observacoes: 'Poltrona acessível reservada na van adaptada.',
      data_solicitacao: '2026-10-20T14:10:00Z',
      laudo_anexo_nome: 'laudo_orto_juliana.pdf',
      laudo_medico_crm: 'CRM-BA 31200',
      ponto_espera_id: 'pe-04',
      ponto_espera_nome: 'UBS Vila Esperança',
      horario_saida_previsto: '04:15',
      data_viagem_prevista: '2026-10-26',
      ordem_numero: 'OS-TFD-2026/0103',
      operador_emissor_nome: 'Silvia Cristina (Balcão USF Central)',
      ponto_tfd_origem: 'UBS Vila Esperança',
    },
    {
      id: 'sol-04',
      paciente_id: 'pac-04',
      cid_10: 'N18.0',
      cid_10_descricao: 'Doença renal em estágio terminal / Hemodiálise',
      especialidade_medica: 'Nefrologia / Confecção de Fístula Arteriovenosa',
      hospital_destino: 'Hospital Geral Roberto Santos',
      cidade_destino: 'Salvador',
      data_agendada_consulta: '2026-10-28',
      horario_agendado_consulta: '10:00',
      requer_acompanhante: false,
      status: 'Pendente',
      observacoes: 'Aguardando validação da vaga de hemodiálise pelo médico regulador.',
      data_solicitacao: '2026-10-22T08:45:00Z',
      laudo_anexo_nome: 'laudo_nefro_sebastiao.pdf',
      laudo_medico_crm: 'CRM-BA 18774',
      ponto_espera_id: 'pe-06',
      ponto_espera_nome: 'Trevo do Povoado Santo Antônio (Zona Rural)',
      horario_saida_previsto: '03:15',
      data_viagem_prevista: '2026-10-28',
      ordem_numero: 'OS-TFD-2026/0104',
      operador_emissor_nome: 'Rodrigo Alcantara (Regulador)',
      ponto_tfd_origem: 'USF Povoado Santo Antônio (Rural)',
    },
    {
      id: 'sol-05',
      paciente_id: 'pac-05',
      cid_10: 'Q24.9',
      cid_10_descricao: 'Malformação congênita do coração',
      especialidade_medica: 'Cardiopediatria / Ecocardiograma Tridimensional',
      hospital_destino: 'Hospital das Clínicas da UFBA',
      cidade_destino: 'Salvador',
      data_agendada_consulta: '2026-10-28',
      horario_agendado_consulta: '14:00',
      requer_acompanhante: true,
      justificativa_acompanhante: 'Paciente menor de idade (7 anos), presença obrigatória do responsável legal.',
      status: 'Pendente',
      observacoes: 'Acompanhante será a genitora Maria de Lourdes Costa.',
      data_solicitacao: '2026-10-22T15:20:00Z',
      laudo_anexo_nome: 'laudo_cardio_pediatrica_enzo.pdf',
      laudo_medico_crm: 'CRM-BA 27551',
      ponto_espera_id: 'pe-02',
      ponto_espera_nome: 'Praça da Matriz / Igreja Matriz',
      horario_saida_previsto: '03:45',
      data_viagem_prevista: '2026-10-28',
      ordem_numero: 'OS-TFD-2026/0105',
      operador_emissor_nome: 'Dra. Helena Barreto (Coordenadora)',
      ponto_tfd_origem: 'USF Central Dr. Aloysio de Castro',
    },
  ],

  acompanhantes: [
    {
      id: 'acomp-01',
      solicitacao_id: 'sol-01',
      cpf: '492.118.005-43',
      nome_completo: 'Mariana dos Santos Moreira',
      grau_parentesco: 'Filha',
      telefone: '(75) 98844-9988',
    },
    {
      id: 'acomp-02',
      solicitacao_id: 'sol-02',
      cpf: '105.772.399-10',
      nome_completo: 'Ana Paula Lima Ferreira',
      grau_parentesco: 'Cônjuge / Esposa',
      telefone: '(75) 99123-5566',
    },
    {
      id: 'acomp-03',
      solicitacao_id: 'sol-03',
      cpf: '633.882.910-44',
      nome_completo: 'Marcos Vinicius de Oliveira',
      grau_parentesco: 'Irmão',
      telefone: '(75) 98711-4433',
    },
    {
      id: 'acomp-05',
      solicitacao_id: 'sol-05',
      cpf: '889.331.220-77',
      nome_completo: 'Maria de Lourdes Santos Costa',
      grau_parentesco: 'Mãe',
      telefone: '(75) 98144-7788',
    },
  ],

  veiculos: [
    {
      id: 'veic-01',
      placa: 'PKB-4G21',
      modelo: 'Mercedes-Benz Sprinter 415 CDI (Ar/Elevador PNE)',
      capacidade_passageiros: 15,
      status: 'Ativo',
      tipo_veiculo: 'Van',
    },
    {
      id: 'veic-02',
      placa: 'RDK-8A90',
      modelo: 'Volare Attack 8 Executivo (Poltronas Reclináveis)',
      capacidade_passageiros: 26,
      status: 'Ativo',
      tipo_veiculo: 'Micro-ônibus',
    },
    {
      id: 'veic-03',
      placa: 'PLM-9C33',
      modelo: 'Marcopolo Viaggio G7 Rodoviário',
      capacidade_passageiros: 44,
      status: 'Ativo',
      tipo_veiculo: 'Ônibus',
    },
    {
      id: 'veic-04',
      placa: 'OZU-1E45',
      modelo: 'Chevrolet Spin Premier 7L (Urgências Reguladas)',
      capacidade_passageiros: 6,
      status: 'Em Manutenção',
      tipo_veiculo: 'Carro Utilitário',
    },
  ],

  motoristas: [
    {
      id: 'mot-01',
      nome_completo: 'Antônio José da Silva (Tonho)',
      cpf: '402.193.882-01',
      cnh: '04829103991',
      categoria_cnh: 'D',
      celular: '(75) 99188-4422',
    },
    {
      id: 'mot-02',
      nome_completo: 'Valdir dos Passos Conceição',
      cpf: '291.884.003-77',
      cnh: '03991823902',
      categoria_cnh: 'E',
      celular: '(75) 99822-1100',
    },
    {
      id: 'mot-03',
      nome_completo: 'Gilmar Batista Santana',
      cpf: '551.902.348-12',
      cnh: '05520199482',
      categoria_cnh: 'D',
      celular: '(75) 98833-7766',
    },
  ],

  viagens_agendadas: [
    {
      id: 'vg-01',
      codigo_viagem: 'TFD-VG-2026-104',
      cidade_destino: 'Salvador',
      data_partida: '2026-10-26',
      horario_partida: '04:00',
      ponto_encontro: 'Pátio da Secretaria de Saúde (Av. Getúlio Vargas, 100)',
      veiculo_id: 'veic-01',
      motorista_id: 'mot-01',
      status_viagem: 'Programada',
      observacoes: 'Roteiro: Hospital das Clínicas, Aristides Maltez e Hospital Santa Izabel.',
    },
    {
      id: 'vg-02',
      codigo_viagem: 'TFD-VG-2026-105',
      cidade_destino: 'Salvador',
      data_partida: '2026-10-28',
      horario_partida: '04:30',
      ponto_encontro: 'Pátio da Secretaria de Saúde',
      veiculo_id: 'veic-02',
      motorista_id: 'mot-02',
      status_viagem: 'Programada',
      observacoes: 'Viagem programada para pacientes de nefrologia e cardiopediatria.',
    },
    {
      id: 'vg-03',
      codigo_viagem: 'TFD-VG-2026-103',
      cidade_destino: 'Salvador',
      data_partida: '2026-10-23',
      horario_partida: '04:00',
      ponto_encontro: 'Pátio da Secretaria de Saúde',
      veiculo_id: 'veic-01',
      motorista_id: 'mot-01',
      status_viagem: 'Finalizada',
      observacoes: 'Viagem concluída sem ocorrências com retorno às 19:30.',
    },
  ],

  passageiros_viagem: [
    // Pacientes e acompanhantes alocados na viagem vg-01
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
    },
    {
      id: 'pv-03',
      viagem_id: 'vg-01',
      solicitacao_id: 'sol-02',
      tipo_passageiro: 'Paciente',
      nome_passageiro: 'Carlos Eduardo Ferreira Lima',
      cpf_passageiro: '381.920.445-88',
      cartao_sus_passageiro: '741 8294 0012 3456',
      numero_poltrona: 3,
      status_presenca: 'Pendente',
      voucher_token: 'VCH-2026-C3E9',
    },
    {
      id: 'pv-04',
      viagem_id: 'vg-01',
      solicitacao_id: 'sol-02',
      tipo_passageiro: 'Acompanhante',
      nome_passageiro: 'Ana Paula Lima Ferreira',
      cpf_passageiro: '105.772.399-10',
      numero_poltrona: 4,
      status_presenca: 'Pendente',
      voucher_token: 'VCH-2026-C3E8',
    },
    {
      id: 'pv-05',
      viagem_id: 'vg-01',
      solicitacao_id: 'sol-03',
      tipo_passageiro: 'Paciente',
      nome_passageiro: 'Juliana Mendes de Oliveira',
      cpf_passageiro: '812.390.114-02',
      cartao_sus_passageiro: '891 0023 4455 6677',
      numero_poltrona: 5,
      status_presenca: 'Pendente',
      voucher_token: 'VCH-2026-J7M5',
    },
    {
      id: 'pv-06',
      viagem_id: 'vg-01',
      solicitacao_id: 'sol-03',
      tipo_passageiro: 'Acompanhante',
      nome_passageiro: 'Marcos Vinicius de Oliveira',
      cpf_passageiro: '633.882.910-44',
      numero_poltrona: 6,
      status_presenca: 'Pendente',
      voucher_token: 'VCH-2026-J7M6',
    },
  ],

  diarias_ajuda_custo: [
    {
      id: 'dia-01',
      solicitacao_id: 'sol-01',
      tipo_concessao: 'Alimentação',
      valor_pago: 80.00, // Paciente + Acompanhante
      forma_pagamento: 'PIX',
      recibo_assinado: true,
      data_pagamento: '2026-10-21',
      observacoes: 'Auxílio alimentação para paciente e acompanhante conforme Portaria SAS/MS 055/1999.',
    },
    {
      id: 'dia-02',
      solicitacao_id: 'sol-02',
      tipo_concessao: 'Ambos',
      valor_pago: 240.00, // Paciente oncológico + acompanhante com previsão de pernoite para infusão
      forma_pagamento: 'Ordem Bancária',
      recibo_assinado: true,
      data_pagamento: '2026-10-21',
      observacoes: 'Alimentação e pernoite hospitalar em Salvador.',
    },
    {
      id: 'dia-03',
      solicitacao_id: 'sol-03',
      tipo_concessao: 'Alimentação',
      valor_pago: 80.00,
      forma_pagamento: 'PIX',
      recibo_assinado: false,
      data_pagamento: '2026-10-22',
      observacoes: 'Ordem de pagamento emitida aguardando assinatura do termo.',
    },
  ],

  usuarios_sistema: [
    {
      id: 'usr-01',
      cpf: '012.345.678-99',
      nome_completo: 'Dra. Helena Barreto Guimarães',
      perfil: 'Master',
      cargo: 'Coordenadora Geral do TFD Municipal',
      ativo: true,
    },
    {
      id: 'usr-02',
      cpf: '334.556.778-11',
      nome_completo: 'Rodrigo Alcantara Neves',
      perfil: 'Operador',
      cargo: 'Regulador de Vagas e Frotas',
      ativo: true,
    },
    {
      id: 'usr-03',
      cpf: '556.778.990-22',
      nome_completo: 'Silvia Cristina Vasconcelos',
      perfil: 'Atendente_PSF',
      cargo: 'Atendente de Triagem / Recepção UBS',
      ativo: true,
    },
    {
      id: 'usr-04',
      cpf: '778.990.112-33',
      nome_completo: 'Sérgio Murilo Santana',
      perfil: 'Fiscal_Embarque',
      cargo: 'Fiscal de Pátio e Validação de Embarque',
      ativo: true,
    },
  ],
};

// Storage helper
export function getTFDDatabase(): TFDDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
      return INITIAL_DATABASE;
    }
    const parsed = JSON.parse(raw);
    // basic sanity check
    if (!parsed.pacientes || !parsed.solicitacoes_tfd || !parsed.viagens_agendadas) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
      return INITIAL_DATABASE;
    }
    if (!parsed.pontos_espera || parsed.pontos_espera.length === 0) {
      parsed.pontos_espera = INITIAL_DATABASE.pontos_espera;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
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

export function getActiveUser(): UsuarioSistema {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return INITIAL_DATABASE.usuarios_sistema[0]; // Master default
}

export function setActiveUser(user: UsuarioSistema): void {
  localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
}
