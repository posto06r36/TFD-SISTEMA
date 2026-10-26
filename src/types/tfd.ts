export type VulnerabilidadeGrupo = 
  | 'Nenhum' 
  | 'Idoso' 
  | 'Gestante' 
  | 'Cadeirante / PNE' 
  | 'Paciente Oncológico' 
  | 'Tratamento Renal Contínuo' 
  | 'Pediatria / Infantil';

export type SolicitacaoStatus = 'Pendente' | 'Aprovado' | 'Cancelado' | 'Concluido';

export type VeiculoStatus = 'Ativo' | 'Em Manutenção' | 'Inativo';

export type ViagemStatus = 'Programada' | 'Em Andamento' | 'Finalizada' | 'Cancelada';

export type TipoPassageiro = 'Paciente' | 'Acompanhante';

export type PresencaStatus = 'Pendente' | 'Embarcou' | 'Faltou';

export type TipoConcessao = 'Alimentação' | 'Hospedagem' | 'Ambos' | 'Passagem Terrestre';

export type FormaPagamento = 'PIX' | 'Ordem Bancária' | 'Transferência (TED)' | 'Espécie';

export type PerfilUsuario = 'Master' | 'Operador' | 'Atendente_PSF' | 'Fiscal_Embarque';

export interface UnidadeSaude {
  id: string;
  cnes: string;
  nome: string;
  bairro_comunidade: string;
  telefone: string;
}

export interface Paciente {
  id: string;
  cpf: string;
  cartao_sus: string;
  nome_completo: string;
  data_nascimento: string;
  telefone_whatsapp: string;
  endereco: string;
  bairro: string;
  unidade_saude_id: string;
  grupo_vulnerabilidade: VulnerabilidadeGrupo;
  criado_em: string;
}

export interface PontoEspera {
  id: string;
  nome: string;
  endereco: string;
  bairro_regiao: string;
  horario_estimado_passagem: string;
  referencia: string;
}

export interface SolicitacaoTFD {
  id: string;
  paciente_id: string;
  cid_10: string;
  cid_10_descricao?: string;
  especialidade_medica: string;
  hospital_destino: string;
  cidade_destino: string;
  data_agendada_consulta: string;
  horario_agendado_consulta?: string;
  requer_acompanhante: boolean;
  justificativa_acompanhante?: string;
  status: SolicitacaoStatus;
  observacoes?: string;
  data_solicitacao: string;
  laudo_anexo_nome?: string;
  laudo_medico_crm?: string;
  // Campos operacionais da OS e Ponto de Espera
  ponto_espera_id?: string;
  ponto_espera_nome?: string;
  horario_saida_previsto?: string;
  data_viagem_prevista?: string;
  ordem_numero?: string;
  operador_emissor_id?: string;
  operador_emissor_nome?: string;
  ponto_tfd_origem?: string;
}

export interface Acompanhante {
  id: string;
  solicitacao_id: string;
  cpf: string;
  nome_completo: string;
  grau_parentesco: string;
  telefone: string;
}

export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  capacidade_passageiros: number;
  status: VeiculoStatus;
  tipo_veiculo: 'Van' | 'Micro-ônibus' | 'Ônibus' | 'Carro Utilitário';
}

export interface Motorista {
  id: string;
  nome_completo: string;
  cpf: string;
  cnh: string;
  categoria_cnh: 'B' | 'C' | 'D' | 'E';
  celular: string;
}

export interface ViagemAgendada {
  id: string;
  codigo_viagem: string;
  cidade_destino: string;
  data_partida: string;
  horario_partida: string;
  ponto_encontro: string;
  veiculo_id: string;
  motorista_id: string;
  status_viagem: ViagemStatus;
  observacoes?: string;
}

export interface PassageiroViagem {
  id: string;
  viagem_id: string;
  solicitacao_id: string;
  tipo_passageiro: TipoPassageiro;
  nome_passageiro: string;
  cpf_passageiro: string;
  cartao_sus_passageiro?: string;
  numero_poltrona: number;
  status_presenca: PresencaStatus;
  voucher_token: string;
  horario_embarque?: string;
  ponto_espera_nome?: string;
  horario_embarque_ponto?: string;
}

export interface DiariaAjudaCusto {
  id: string;
  solicitacao_id: string;
  tipo_concessao: TipoConcessao;
  valor_pago: number;
  forma_pagamento: FormaPagamento;
  recibo_assinado: boolean;
  data_pagamento: string;
  observacoes?: string;
}

export interface UsuarioSistema {
  id: string;
  cpf: string;
  senha_hash?: string;
  nome_completo: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  cargo: string;
  ponto_tfd_lotacao?: string; // Balcão ou Posto onde o operador está alocado
}

export interface TFDDatabase {
  unidades_saude: UnidadeSaude[];
  pontos_espera: PontoEspera[];
  pacientes: Paciente[];
  solicitacoes_tfd: SolicitacaoTFD[];
  acompanhantes: Acompanhante[];
  veiculos: Veiculo[];
  motoristas: Motorista[];
  viagens_agendadas: ViagemAgendada[];
  passageiros_viagem: PassageiroViagem[];
  diarias_ajuda_custo: DiariaAjudaCusto[];
  usuarios_sistema: UsuarioSistema[];
}
