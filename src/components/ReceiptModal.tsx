import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { DiariaAjudaCusto, SolicitacaoTFD, Paciente, Acompanhante } from '../types/tfd';
import { formatBRL, formatDateBR } from '../utils/masks';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  diaria: DiariaAjudaCusto | null;
  solicitacao: SolicitacaoTFD | null;
  paciente: Paciente | null;
  acompanhante?: Acompanhante | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  diaria,
  solicitacao,
  paciente,
  acompanhante,
}) => {
  if (!isOpen || !diaria || !solicitacao || !paciente) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Recibo Oficial de Ajuda de Custo (TFD)</h3>
              <p className="text-xs text-slate-500">Documento comprobatório - Portaria SAS/MS nº 055/1999</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 bg-slate-100 flex flex-col items-center max-h-[75vh] overflow-y-auto">
          <div
            id="receipt-print-area"
            className="w-full bg-white p-8 shadow-sm border border-slate-300 text-slate-900 text-sm font-serif leading-relaxed"
          >
            {/* Timbre Municipal */}
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-5">
              <div className="font-bold text-base uppercase tracking-wider text-slate-900">
                ESTADO DA BAHIA • PREFEITURA MUNICIPAL
              </div>
              <div className="font-semibold text-sm uppercase text-slate-700">
                SECRETARIA MUNICIPAL DE SAÚDE • FUNDO MUNICIPAL DE SAÚDE
              </div>
              <div className="text-xs font-sans text-slate-600 mt-1">
                COORDENADORIA DE REGULAÇÃO, AVALIAÇÃO E CONTROLE • CENTRAL MUNICIPAL DE TFD
              </div>
            </div>

            {/* Recibo Header */}
            <div className="flex justify-between items-center mb-6 font-sans">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block">DOCUMENTO</span>
                <span className="text-lg font-bold text-slate-900">RECIBO DE DIÁRIA / AJUDA DE CUSTO</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Nº CONTROLE</span>
                <span className="font-mono font-bold text-slate-800 tabular-nums">REC-TFD-{diaria.id.toUpperCase()}</span>
                <span className="text-xs text-slate-500 block mt-0.5">Data: {formatDateBR(diaria.data_pagamento)}</span>
              </div>
            </div>

            {/* Valor Box */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded p-4 mb-6 flex justify-between items-center font-sans">
              <div>
                <span className="text-xs text-emerald-800 uppercase font-bold block">Valor Líquido Concedido</span>
                <span className="text-2xl font-black text-emerald-950 tabular-nums font-mono">{formatBRL(diaria.valor_pago)}</span>
              </div>
              <div className="text-right text-xs text-slate-700">
                <div>Tipo: <b className="uppercase">{diaria.tipo_concessao}</b></div>
                <div>Forma de Pagamento: <b>{diaria.forma_pagamento}</b></div>
              </div>
            </div>

            {/* Declaração de Recebimento */}
            <div className="space-y-4 text-justify text-[13px] text-slate-800">
              <p>
                Recebi do <strong>Fundo Municipal de Saúde / Central de Tratamento Fora do Domicílio</strong> a importância líquida de <strong>{formatBRL(diaria.valor_pago)}</strong>, referente ao benefício de ajuda de custo para despesas com <strong>{diaria.tipo_concessao.toLowerCase()}</strong>, em conformidade com as diretrizes do Sistema Único de Saúde (SUS) e da Portaria SAS/MS nº 055 de 24 de fevereiro de 1999.
              </p>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 font-sans text-xs space-y-1.5">
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1">
                  DADOS DO PACIENTE E ENCAMINHAMENTO TFD:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Paciente:</strong> {paciente.nome_completo}</div>
                  <div><strong>CPF:</strong> <span className="tabular-nums font-mono">{paciente.cpf}</span></div>
                  <div><strong>Cartão SUS:</strong> <span className="tabular-nums font-mono">{paciente.cartao_sus}</span></div>
                  <div><strong>Município Origem:</strong> Município Sede</div>
                  <div><strong>Cidade Destino:</strong> {solicitacao.cidade_destino}</div>
                  <div><strong>Hospital/Clínica:</strong> {solicitacao.hospital_destino}</div>
                  <div><strong>Especialidade:</strong> {solicitacao.especialidade_medica}</div>
                  <div><strong>CID-10:</strong> <span className="font-mono">{solicitacao.cid_10}</span></div>
                </div>

                {solicitacao.requer_acompanhante && acompanhante && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <strong>Acompanhante Autorizado:</strong> {acompanhante.nome_completo} (CPF: {acompanhante.cpf} - Parentesco: {acompanhante.grau_parentesco})
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600 italic">
                O beneficiário acima qualificado compromete-se a apresentar, no retorno, o atestado de comparecimento devidamente assinado e carimbado pelo médico assistente no hospital de destino para prestação de contas no prazo máximo de 5 (cinco) dias úteis.
              </p>
            </div>

            {/* Assinaturas */}
            <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-center font-sans text-xs">
              <div>
                <div className="border-t border-slate-800 pt-2 font-semibold text-slate-900">
                  {paciente.nome_completo}
                </div>
                <div className="text-slate-500">
                  Assinatura do Paciente / Responsável
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  CPF: {paciente.cpf}
                </div>
              </div>

              <div>
                <div className="border-t border-slate-800 pt-2 font-semibold text-slate-900">
                  Coordenação Municipal do TFD
                </div>
                <div className="text-slate-500">
                  Secretaria Municipal de Saúde
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Visto da Auditoria / Controle
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Formato A4 para arquivo e prestação de contas municipal
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
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Recibo A4
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
