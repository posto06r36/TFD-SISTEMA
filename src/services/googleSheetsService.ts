import { TFDDatabase, Paciente, SolicitacaoTFD, ViagemAgendada, PassageiroViagem, DiariaAjudaCusto, Veiculo, Motorista, UnidadeSaude, PontoEspera, UsuarioSistema } from '../types/tfd';

const SPREADSHEET_TITLE = 'Central TFD Municipal - Banco de Dados';
const SHEET_ID_KEY = 'tfd_google_sheet_id';

export interface GoogleSheetMeta {
  id: string;
  name: string;
  webViewLink?: string;
}

export function getStoredSpreadsheetId(): string | null {
  return localStorage.getItem(SHEET_ID_KEY);
}

export function setStoredSpreadsheetId(id: string | null): void {
  if (id) {
    localStorage.setItem(SHEET_ID_KEY, id);
  } else {
    localStorage.removeItem(SHEET_ID_KEY);
  }
}

// 1. Search for existing TFD spreadsheet in Google Drive
export async function findTFDSpreadsheet(token: string): Promise<GoogleSheetMeta | null> {
  try {
    const q = encodeURIComponent(`name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.warn('Drive search failed', await res.text());
      return null;
    }
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      const file = data.files[0];
      setStoredSpreadsheetId(file.id);
      return {
        id: file.id,
        name: file.name,
        webViewLink: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
      };
    }
    return null;
  } catch (err) {
    console.error('Error finding spreadsheet in Drive:', err);
    return null;
  }
}

// 2. Headers definition for all 10 tables
export const HEADERS = {
  Pacientes: [
    'ID', 'CPF', 'Cartão SUS', 'Nome Completo', 'Data de Nascimento', 'WhatsApp', 'Endereço', 'Bairro', 'Unidade Saúde ID', 'Grupo Vulnerabilidade', 'Criado Em'
  ],
  Solicitacoes_TFD: [
    'ID', 'Número Ordem OS', 'Paciente ID', 'CID-10', 'Descrição CID', 'Especialidade Médica', 'Hospital de Destino', 'Cidade de Destino', 'Data Consulta', 'Horário Consulta', 'Requer Acompanhante', 'Justificativa Acompanhante', 'Status', 'Ponto Espera', 'Horário Saída Previsto', 'Data Viagem', 'Operador Emissor', 'Data Solicitação', 'Observações'
  ],
  Viagens: [
    'ID', 'Código da Viagem', 'Cidade Destino', 'Data de Partida', 'Horário Partida', 'Ponto de Encontro', 'Veículo ID', 'Motorista ID', 'Status da Viagem', 'Observações'
  ],
  Passageiros_Viagem: [
    'ID', 'Viagem ID', 'Solicitação ID', 'Tipo Passageiro', 'Nome Passageiro', 'CPF Passageiro', 'Cartão SUS', 'Número Poltrona', 'Status Presença', 'Voucher Token', 'Ponto de Espera', 'Horário Embarque'
  ],
  Diarias: [
    'ID', 'Solicitação ID', 'Tipo Concessão', 'Valor Pago (R$)', 'Forma Pagamento', 'Recibo Assinado', 'Data Pagamento', 'Observações'
  ],
  Veiculos: [
    'ID', 'Placa', 'Modelo', 'Capacidade', 'Status', 'Tipo Veículo'
  ],
  Motoristas: [
    'ID', 'Nome Completo', 'CPF', 'CNH', 'Categoria CNH', 'Celular'
  ],
  Unidades_Saude: [
    'ID', 'CNES', 'Nome da Unidade', 'Bairro / Comunidade', 'Telefone'
  ],
  Pontos_Espera: [
    'ID', 'Nome do Ponto', 'Endereço', 'Bairro / Região', 'Horário Estimado', 'Ponto de Referência'
  ],
  Operadores: [
    'ID', 'CPF', 'Nome Completo', 'Perfil', 'Cargo', 'Ponto TFD Lotação', 'Ativo'
  ]
};

// 3. Create fresh Spreadsheet with all tabs and populate initial database
export async function createTFDSpreadsheet(token: string, db: TFDDatabase): Promise<GoogleSheetMeta> {
  const sheetTitles = Object.keys(HEADERS);
  const sheetsPayload = sheetTitles.map((title) => ({
    properties: {
      title,
      gridProperties: {
        frozenRowCount: 1,
      },
    },
  }));

  // Create spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_TITLE,
      },
      sheets: sheetsPayload,
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Falha ao criar planilha: ${errorText}`);
  }

  const created = await createRes.json();
  const spreadsheetId = created.spreadsheetId;
  setStoredSpreadsheetId(spreadsheetId);

  // Now populate with headers and data
  await pushDatabaseToSheets(token, spreadsheetId, db);

  return {
    id: spreadsheetId,
    name: SPREADSHEET_TITLE,
    webViewLink: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

// 4. Push local database to Google Sheets
export async function pushDatabaseToSheets(token: string, spreadsheetId: string, db: TFDDatabase): Promise<void> {
  // Format tables
  const pacientesRows = [
    HEADERS.Pacientes,
    ...db.pacientes.map((p) => [
      p.id, p.cpf, p.cartao_sus, p.nome_completo, p.data_nascimento, p.telefone_whatsapp, p.endereco, p.bairro, p.unidade_saude_id, p.grupo_vulnerabilidade, p.criado_em
    ]),
  ];

  const solicitacoesRows = [
    HEADERS.Solicitacoes_TFD,
    ...db.solicitacoes_tfd.map((s) => [
      s.id, s.ordem_numero || '', s.paciente_id, s.cid_10, s.cid_10_descricao || '', s.especialidade_medica, s.hospital_destino, s.cidade_destino, s.data_agendada_consulta, s.horario_agendado_consulta || '', s.requer_acompanhante ? 'Sim' : 'Não', s.justificativa_acompanhante || '', s.status, s.ponto_espera_nome || '', s.horario_saida_previsto || '', s.data_viagem_prevista || '', s.operador_emissor_nome || '', s.data_solicitacao, s.observacoes || ''
    ]),
  ];

  const viagensRows = [
    HEADERS.Viagens,
    ...db.viagens_agendadas.map((v) => [
      v.id, v.codigo_viagem, v.cidade_destino, v.data_partida, v.horario_partida, v.ponto_encontro, v.veiculo_id, v.motorista_id, v.status_viagem, v.observacoes || ''
    ]),
  ];

  const passageirosRows = [
    HEADERS.Passageiros_Viagem,
    ...db.passageiros_viagem.map((pv) => [
      pv.id, pv.viagem_id, pv.solicitacao_id, pv.tipo_passageiro, pv.nome_passageiro, pv.cpf_passageiro, pv.cartao_sus_passageiro || '', pv.numero_poltrona, pv.status_presenca, pv.voucher_token, pv.ponto_espera_nome || '', pv.horario_embarque || pv.horario_embarque_ponto || ''
    ]),
  ];

  const diariasRows = [
    HEADERS.Diarias,
    ...db.diarias_ajuda_custo.map((d) => [
      d.id, d.solicitacao_id, d.tipo_concessao, d.valor_pago, d.forma_pagamento, d.recibo_assinado ? 'Sim' : 'Não', d.data_pagamento, d.observacoes || ''
    ]),
  ];

  const veiculosRows = [
    HEADERS.Veiculos,
    ...db.veiculos.map((v) => [
      v.id, v.placa, v.modelo, v.capacidade_passageiros, v.status, v.tipo_veiculo
    ]),
  ];

  const motoristasRows = [
    HEADERS.Motoristas,
    ...db.motoristas.map((m) => [
      m.id, m.nome_completo, m.cpf, m.cnh, m.categoria_cnh, m.celular
    ]),
  ];

  const unidadesRows = [
    HEADERS.Unidades_Saude,
    ...db.unidades_saude.map((u) => [
      u.id, u.cnes, u.nome, u.bairro_comunidade, u.telefone
    ]),
  ];

  const pontosRows = [
    HEADERS.Pontos_Espera,
    ...db.pontos_espera.map((pe) => [
      pe.id, pe.nome, pe.endereco, pe.bairro_regiao, pe.horario_estimado_passagem, pe.referencia
    ]),
  ];

  const operadoresRows = [
    HEADERS.Operadores,
    ...db.usuarios_sistema.map((u) => [
      u.id, u.cpf, u.nome_completo, u.perfil, u.cargo, u.ponto_tfd_lotacao, u.ativo ? 'Ativo' : 'Inativo'
    ]),
  ];

  const updateData = [
    { range: 'Pacientes!A1:K', values: pacientesRows },
    { range: 'Solicitacoes_TFD!A1:S', values: solicitacoesRows },
    { range: 'Viagens!A1:J', values: viagensRows },
    { range: 'Passageiros_Viagem!A1:L', values: passageirosRows },
    { range: 'Diarias!A1:H', values: diariasRows },
    { range: 'Veiculos!A1:F', values: veiculosRows },
    { range: 'Motoristas!A1:F', values: motoristasRows },
    { range: 'Unidades_Saude!A1:E', values: unidadesRows },
    { range: 'Pontos_Espera!A1:F', values: pontosRows },
    { range: 'Operadores!A1:G', values: operadoresRows },
  ];

  // Clear existing ranges to avoid ghost rows
  for (const item of updateData) {
    const sheetName = item.range.split('!')[0];
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A2:Z1000:clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }

  // Batch update
  const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: updateData,
    }),
  });

  if (!batchRes.ok) {
    const errText = await batchRes.text();
    throw new Error(`Falha ao sincronizar com Google Sheets: ${errText}`);
  }
}

// 5. Pull database from Google Sheets
export async function pullDatabaseFromSheets(token: string, spreadsheetId: string, currentDb: TFDDatabase): Promise<TFDDatabase> {
  const ranges = [
    'Pacientes!A2:K1000',
    'Solicitacoes_TFD!A2:S1000',
    'Viagens!A2:J1000',
    'Passageiros_Viagem!A2:L1000',
    'Diarias!A2:H1000',
    'Veiculos!A2:F1000',
    'Motoristas!A2:F1000',
    'Unidades_Saude!A2:E1000',
    'Pontos_Espera!A2:F1000',
    'Operadores!A2:G1000',
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join('&')}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro ao ler dados da planilha: ${err}`);
  }

  const data = await res.json();
  const valueRanges = data.valueRanges || [];

  const newDb: TFDDatabase = {
    pacientes: [],
    solicitacoes_tfd: [],
    acompanhantes: currentDb.acompanhantes || [],
    viagens_agendadas: [],
    passageiros_viagem: [],
    diarias_ajuda_custo: [],
    veiculos: [],
    motoristas: [],
    unidades_saude: [],
    pontos_espera: [],
    usuarios_sistema: [],
  };

  // Map Pacientes
  const pacRows = valueRanges[0]?.values || [];
  newDb.pacientes = pacRows.map((r: any[]) => ({
    id: r[0] || `pac-${Date.now()}`,
    cpf: r[1] || '',
    cartao_sus: r[2] || '',
    nome_completo: r[3] || '',
    data_nascimento: r[4] || '',
    telefone_whatsapp: r[5] || '',
    endereco: r[6] || '',
    bairro: r[7] || '',
    unidade_saude_id: r[8] || 'usf-01',
    grupo_vulnerabilidade: (r[9] as any) || 'Nenhum',
    criado_em: r[10] || new Date().toISOString(),
  }));

  // Map Solicitacoes_TFD
  const solRows = valueRanges[1]?.values || [];
  newDb.solicitacoes_tfd = solRows.map((r: any[]) => ({
    id: r[0] || `sol-${Date.now()}`,
    ordem_numero: r[1] || '',
    paciente_id: r[2] || '',
    cid_10: r[3] || '',
    cid_10_descricao: r[4] || '',
    especialidade_medica: r[5] || '',
    hospital_destino: r[6] || '',
    cidade_destino: r[7] || '',
    data_agendada_consulta: r[8] || '',
    horario_agendado_consulta: r[9] || '',
    requer_acompanhante: r[10] === 'Sim' || r[10] === 'true',
    justificativa_acompanhante: r[11] || '',
    status: (r[12] as any) || 'Pendente',
    ponto_espera_nome: r[13] || '',
    horario_saida_previsto: r[14] || '',
    data_viagem_prevista: r[15] || '',
    operador_emissor_nome: r[16] || '',
    data_solicitacao: r[17] || new Date().toISOString(),
    observacoes: r[18] || '',
  }));

  // Map Viagens
  const vgRows = valueRanges[2]?.values || [];
  newDb.viagens_agendadas = vgRows.map((r: any[]) => ({
    id: r[0] || `vg-${Date.now()}`,
    codigo_viagem: r[1] || '',
    cidade_destino: r[2] || '',
    data_partida: r[3] || '',
    horario_partida: r[4] || '',
    ponto_encontro: r[5] || '',
    veiculo_id: r[6] || '',
    motorista_id: r[7] || '',
    status_viagem: (r[8] as any) || 'Programada',
    observacoes: r[9] || '',
  }));

  // Map Passageiros_Viagem
  const pvRows = valueRanges[3]?.values || [];
  newDb.passageiros_viagem = pvRows.map((r: any[]) => ({
    id: r[0] || `pv-${Date.now()}`,
    viagem_id: r[1] || '',
    solicitacao_id: r[2] || '',
    tipo_passageiro: (r[3] as any) || 'Paciente',
    nome_passageiro: r[4] || '',
    cpf_passageiro: r[5] || '',
    cartao_sus_passageiro: r[6] || '',
    numero_poltrona: Number(r[7]) || 1,
    status_presenca: (r[8] as any) || 'Pendente',
    voucher_token: r[9] || '',
    ponto_espera_nome: r[10] || '',
    horario_embarque_ponto: r[11] || '',
  }));

  // Map Diarias
  const diaRows = valueRanges[4]?.values || [];
  newDb.diarias_ajuda_custo = diaRows.map((r: any[]) => ({
    id: r[0] || `dia-${Date.now()}`,
    solicitacao_id: r[1] || '',
    tipo_concessao: (r[2] as any) || 'Alimentação',
    valor_pago: Number(r[3]) || 0,
    forma_pagamento: (r[4] as any) || 'PIX',
    recibo_assinado: r[5] === 'Sim' || r[5] === 'true',
    data_pagamento: r[6] || '',
    observacoes: r[7] || '',
  }));

  // Map Veículos
  const veicRows = valueRanges[5]?.values || [];
  if (veicRows.length > 0) {
    newDb.veiculos = veicRows.map((r: any[]) => ({
      id: r[0] || '',
      placa: r[1] || '',
      modelo: r[2] || '',
      capacidade_passageiros: Number(r[3]) || 15,
      status: (r[4] as any) || 'Ativo',
      tipo_veiculo: (r[5] as any) || 'Van',
    }));
  } else {
    newDb.veiculos = currentDb.veiculos;
  }

  // Map Motoristas
  const motRows = valueRanges[6]?.values || [];
  if (motRows.length > 0) {
    newDb.motoristas = motRows.map((r: any[]) => ({
      id: r[0] || '',
      nome_completo: r[1] || '',
      cpf: r[2] || '',
      cnh: r[3] || '',
      categoria_cnh: (r[4] as any) || 'D',
      celular: r[5] || '',
    }));
  } else {
    newDb.motoristas = currentDb.motoristas;
  }

  // Map Unidades_Saude
  const usfRows = valueRanges[7]?.values || [];
  if (usfRows.length > 0) {
    newDb.unidades_saude = usfRows.map((r: any[]) => ({
      id: r[0] || '',
      cnes: r[1] || '',
      nome: r[2] || '',
      bairro_comunidade: r[3] || '',
      telefone: r[4] || '',
    }));
  } else {
    newDb.unidades_saude = currentDb.unidades_saude;
  }

  // Map Pontos_Espera
  const peRows = valueRanges[8]?.values || [];
  if (peRows.length > 0) {
    newDb.pontos_espera = peRows.map((r: any[]) => ({
      id: r[0] || '',
      nome: r[1] || '',
      endereco: r[2] || '',
      bairro_regiao: r[3] || '',
      horario_estimado_passagem: r[4] || '',
      referencia: r[5] || '',
    }));
  } else {
    newDb.pontos_espera = currentDb.pontos_espera;
  }

  // Map Operadores
  const opRows = valueRanges[9]?.values || [];
  if (opRows.length > 0) {
    newDb.usuarios_sistema = opRows.map((r: any[]) => ({
      id: r[0] || '',
      cpf: r[1] || '',
      nome_completo: r[2] || '',
      perfil: (r[3] as any) || 'Operador',
      cargo: r[4] || 'Operador TFD',
      ponto_tfd_lotacao: r[5] || '',
      ativo: r[6] === 'Ativo' || r[6] === 'true',
      senha: '1234', // Default safe password
    }));
    // Preserve Master credentials if missing
    if (!newDb.usuarios_sistema.some((u) => u.cpf.replace(/\D/g, '') === '13012994483')) {
      newDb.usuarios_sistema.unshift(currentDb.usuarios_sistema[0]);
    }
  } else {
    newDb.usuarios_sistema = currentDb.usuarios_sistema;
  }

  return newDb;
}
