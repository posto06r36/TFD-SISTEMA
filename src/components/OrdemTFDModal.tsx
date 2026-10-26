import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, AlertTriangle, FileBadge, Bus } from 'lucide-react';
import { SolicitacaoTFD, Paciente, Acompanhante, ViagemAgendada, Veiculo, Motorista } from '../types/tfd';
import { formatDateBR } from '../utils/masks';

interface OrdemTFDModalProps {
  isOpen: boolean;
  onClose: () => void;
  solicitacao: SolicitacaoTFD | null;
  paciente: Paciente | null;
  acompanhante?: Acompanhante | null;
  viagem?: ViagemAgendada | null;
  veiculo?: Veiculo | null;
  motorista?: Motorista | null;
}

export const OrdemTFDModal: React.FC<OrdemTFDModalProps> = ({
  isOpen,
  onClose,
  solicitacao,
  paciente,
  acompanhante,
  viagem,
  veiculo,
  motorista,
}) => {
  if (!isOpen || !solicitacao || !paciente) return null;

  const handlePrint = () => {
    window.print();
  };

  const numeroOrdem = `ORD-TFD-${solicitacao.id.toUpperCase().replace('SOL-', '')}-GRATUITO`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-6">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50/70">
          <div className="flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-emerald-800" />
            <div>
              <h3 className="font-extrabold text-emerald-950 text-sm">
                Ordem de Transporte TFD Gratuita
              </h3>
              <p className="text-xs text-emerald-800">
                Guia Oficial de Deslocamento e Autorização de Embarque do SUS - Isenção Total de Tarifas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-6 bg-slate-100 flex flex-col items-center max-h-[75vh] overflow-y-auto">
          
          <div
            id="receipt-print-area"
            className="w-full bg-white p-8 shadow-sm border border-slate-300 text-slate-900 text-xs font-serif leading-relaxed"
          >
            {/* Timbre Municipal */}
            <div className="text-center border-b-2 border-slate-900 pb-3 mb-4 font-sans">
              <div className="font-bold text-xs uppercase tracking-widest text-slate-900">
                REPÚBLICA FEDERATIVA DO BRASIL • ESTADO DA BAHIA
              </div>
              <div className="font-extrabold text-sm uppercase text-slate-900 mt-0.5">
                PREFEITURA MUNICIPAL • SECRETARIA MUNICIPAL DE SAÚDE
              </div>
              <div className="text-[11px] text-slate-600 font-medium">
                SISTEMA ÚNICO DE SAÚDE (SUS) • CENTRAL DE TRATAMENTO FORA DO DOMICÍLIO (TFD)
              </div>
            </div>

            {/* Tarja de Gratuidade Garantida por Lei */}
            <div className="bg-emerald-800 text-white p-2.5 rounded text-center mb-4 font-sans">
              <div className="flex items-center justify-center gap-2 font-black text-sm tracking-wide uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                ORDEM DE TRANSPORTE TFD • GRATUIDADE ASSEGURADA POR LEI
              </div>
              <div className="text-[10px] text-emerald-100 mt-0.5">
                100% Custeado pelo SUS / Fundo Municipal de Saúde • É expressamente proibida qualquer cobrança de tarifa ou taxa
              </div>
            </div>

            {/* Controle da Ordem */}
            <div className="flex justify-between items-center mb-4 font-sans border-b border-slate-200 pb-2 text-[11px]">
              <div>
                <span className="text-slate-500 uppercase font-semibold block text-[10px]">DOCUMENTO REGULATÓRIO</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{numeroOrdem}</span>
              </div>
              <div className="text-center bg-slate-100 px-3 py-1 rounded border border-slate-200">
                <span className="font-bold text-emerald-800 block uppercase text-[10px]">STATUS DO BENEFÍCIO</span>
                <span className="font-bold text-slate-900">TRANSPORTE GRATUITO AUTORIZADO</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">EMISSÃO</span>
                <span className="font-mono font-bold text-slate-800">
                  {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Bloco 1: Identificação do Paciente Beneficiário */}
            <div className="mb-4 font-sans bg-slate-50 p-3 rounded border border-slate-200">
              <div className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-200 pb-1 mb-2">
                1. DADOS DO PACIENTE BENEFICIÁRIO DA GRATUIDADE
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Nome Completo:</span>
                  <span className="font-bold text-slate-900">{paciente.nome_completo}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">CPF:</span>
                  <span className="font-mono font-bold text-slate-900">{paciente.cpf}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Cartão Nacional de Saúde (CNS/SUS):</span>
                  <span className="font-mono font-bold text-slate-900">{paciente.cartao_sus}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Data de Nascimento / Idade:</span>
                  <span className="font-mono">{formatDateBR(paciente.data_nascimento)}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Endereço Residencial:</span>
                  <span>{paciente.endereco} - {paciente.bairro}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Telefone / WhatsApp:</span>
                  <span className="font-mono">{paciente.telefone_whatsapp}</span>
                </div>
                {paciente.grupo_vulnerabilidade && paciente.grupo_vulnerabilidade !== 'Nenhum' && (
                  <div className="col-span-2 mt-1">
                    <span className="text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[10px] inline-block">
                      Prioridade Legal de Atendimento: {paciente.grupo_vulnerabilidade}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bloco 2: Acompanhante Autorizado */}
            {solicitacao.requer_acompanhante && acompanhante ? (
              <div className="mb-4 font-sans bg-purple-50/50 p-3 rounded border border-purple-200">
                <div className="font-bold text-purple-950 uppercase text-[11px] border-b border-purple-200 pb-1 mb-2">
                  2. ACOMPANHANTE AUTORIZADO COM GRATUIDADE DE TRANSPORTE
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-purple-700 text-[10px] block">Nome do Acompanhante:</span>
                    <span className="font-bold text-slate-900">{acompanhante.nome_completo}</span>
                  </div>
                  <div>
                    <span className="text-purple-700 text-[10px] block">CPF do Acompanhante:</span>
                    <span className="font-mono font-bold text-slate-900">{acompanhante.cpf}</span>
                  </div>
                  <div>
                    <span className="text-purple-700 text-[10px] block">Grau de Parentesco / Vínculo:</span>
                    <span className="font-semibold text-slate-800">{acompanhante.grau_parentesco}</span>
                  </div>
                  <div>
                    <span className="text-purple-700 text-[10px] block">Telefone:</span>
                    <span className="font-mono">{acompanhante.telefone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-purple-700 text-[10px] block">Justificativa Médica Legal da Gratuidade de Acompanhante:</span>
                    <span className="text-slate-700 italic text-[11px]">
                      "{solicitacao.justificativa_acompanhante || 'Paciente com limitação física/cognitiva ou menor/idoso assistido pela Lei 8.080/90'}"
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4 font-sans bg-slate-50 p-2 rounded border border-slate-200 text-[11px] text-slate-600">
                <strong>2. Acompanhante:</strong> Não requerido para esta ordem conforme laudo médico emitido.
              </div>
            )}

            {/* Bloco 3: Dados Clínicos e Procedimento Regulado */}
            <div className="mb-4 font-sans bg-slate-50 p-3 rounded border border-slate-200">
              <div className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-200 pb-1 mb-2">
                3. ENCAMINHAMENTO CLÍNICO E HOSPITAL DE DESTINO
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Cidade de Destino:</span>
                  <span className="font-bold text-slate-900">{solicitacao.cidade_destino}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Hospital / Centro de Referência SUS:</span>
                  <span className="font-bold text-slate-900">{solicitacao.hospital_destino}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Especialidade Médica:</span>
                  <span className="font-semibold text-slate-800">{solicitacao.especialidade_medica}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Diagnóstico Principal (CID-10):</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {solicitacao.cid_10} {solicitacao.cid_10_descricao ? `- ${solicitacao.cid_10_descricao}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Data Agendada da Consulta / Exame:</span>
                  <span className="font-mono font-bold text-slate-900">{formatDateBR(solicitacao.data_agendada_consulta)}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Laudo Médico Solicitante:</span>
                  <span className="font-mono">{solicitacao.laudo_medico_crm || 'CRM Cadastrado'} ({solicitacao.laudo_anexo_nome || 'Anexo Homologado'})</span>
                </div>
              </div>
            </div>

            {/* Bloco 4: Transporte Designado (Frota Municipal Gratuita) */}
            <div className="mb-4 font-sans bg-emerald-50/40 p-3 rounded border border-emerald-200">
              <div className="font-bold text-emerald-950 uppercase text-[11px] border-b border-emerald-200 pb-1 mb-2 flex items-center justify-between">
                <span>4. DETALHES DO TRANSPORTE MUNICIPAL GRATUITO</span>
                <span className="text-[10px] text-emerald-800 font-normal">Assento Garantido</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Data de Embarque:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {viagem ? formatDateBR(viagem.data_partida) : formatDateBR(solicitacao.data_agendada_consulta)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Horário de Saída:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {viagem ? viagem.horario_partida : '04:00 (A Definir)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Veículo Municipal:</span>
                  <span className="font-bold text-slate-900">
                    {veiculo ? `${veiculo.modelo.slice(0, 15)} (${veiculo.placa})` : 'Frota da Saúde'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Motorista:</span>
                  <span className="font-semibold text-slate-900">
                    {motorista ? motorista.nome_completo.split(' ')[0] : 'Escala do Pátio'}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-4 mt-1 pt-1 border-t border-emerald-200/60">
                  <span className="text-slate-500 text-[10px] block">Local de Embarque / Ponto de Encontro:</span>
                  <span className="font-medium text-slate-800">
                    {viagem?.ponto_encontro || 'Pátio da Secretaria Municipal de Saúde'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dispositivos Legais e Advertências */}
            <div className="text-[10.5px] text-slate-700 space-y-1.5 border-t border-slate-300 pt-3 text-justify">
              <p>
                <strong>AMPARO LEGAL:</strong> O presente benefício de transporte gratuito é concedido com fulcro no Art. 196 da Constituição Federal de 1988, na Lei Federal nº 8.080/1990 (Lei Orgânica da Saúde) e na Portaria SAS/MS nº 055/1999, que institui o Tratamento Fora do Domicílio no âmbito do SUS.
              </p>
              <p className="bg-amber-50 p-2 rounded border border-amber-200 text-amber-900 font-sans text-[10px]">
                <strong>ADVERTÊNCIA LEGAL:</strong> O transporte fornecido através desta Ordem de TFD é estritamente <u>GRATUITO</u>. É crime exigir ou aceitar qualquer remuneração, taxa, comissão ou vantagem indevida pelo transporte de pacientes do SUS (Código Penal, Art. 317 e Lei de Improbidade Administrativa nº 8.429/92). Denúncias: Ouvidoria do SUS - Disque 136.
              </p>
            </div>

            {/* Campo de Comprovação de Comparecimento no Hospital de Destino */}
            <div className="mt-4 p-3 border-2 border-dashed border-slate-400 rounded font-sans text-center">
              <div className="font-bold text-[10px] text-slate-600 uppercase">
                COMPROVAÇÃO DE COMPARECIMENTO NO HOSPITAL DE DESTINO (PREENCHIMENTO PELO HOSPITAL)
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6 text-xs text-slate-500">
                <div className="border-t border-slate-400 pt-1">
                  Data e Horário do Atendimento: ____/____/2026 às ____:____
                </div>
                <div className="border-t border-slate-400 pt-1">
                  Carimbo e Assinatura do Médico / Recepção do Hospital
                </div>
              </div>
            </div>

            {/* Assinaturas da Ordem */}
            <div className="mt-6 pt-4 grid grid-cols-2 gap-8 text-center font-sans text-xs">
              <div>
                <div className="border-t border-slate-800 pt-1 font-bold text-slate-900">
                  {paciente.nome_completo}
                </div>
                <div className="text-[10px] text-slate-500">
                  Paciente / Responsável Legal
                </div>
              </div>

              <div>
                <div className="border-t border-slate-800 pt-1 font-bold text-slate-900">
                  Coordenação de Regulação e TFD
                </div>
                <div className="text-[10px] text-slate-500">
                  Secretaria Municipal de Saúde • Visto de Gratuidade SUS
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Documento Oficial Válido em Todo Território Nacional</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Ordem TFD Gratuita (A4)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
