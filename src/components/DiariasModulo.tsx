import React, { useState } from 'react';
import { 
  Receipt, 
  PlusCircle, 
  FileText, 
  Printer, 
  CheckCircle, 
  DollarSign, 
  CreditCard, 
  Calendar,
  X,
  AlertCircle
} from 'lucide-react';
import { 
  TFDDatabase, 
  DiariaAjudaCusto, 
  TipoConcessao, 
  FormaPagamento, 
  SolicitacaoTFD 
} from '../types/tfd';
import { formatBRL, formatDateBR } from '../utils/masks';

interface DiariasModuloProps {
  db: TFDDatabase;
  onUpdateDb: (updater: (prev: TFDDatabase) => TFDDatabase) => void;
  onOpenReceiptModal: (diaria: DiariaAjudaCusto) => void;
}

export const DiariasModulo: React.FC<DiariasModuloProps> = ({
  db,
  onUpdateDb,
  onOpenReceiptModal,
}) => {
  const [showNewDiariaModal, setShowNewDiariaModal] = useState(false);

  // Form State
  const [selectedSolicitacaoId, setSelectedSolicitacaoId] = useState(
    db.solicitacoes_tfd.find((s) => s.status === 'Aprovado')?.id || db.solicitacoes_tfd[0]?.id || ''
  );
  const [tipoConcessao, setTipoConcessao] = useState<TipoConcessao>('Alimentação');
  const [valorPago, setValorPago] = useState<number>(80.0);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX');
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
  const [reciboAssinado, setReciboAssinado] = useState(true);
  const [observacoes, setObservacoes] = useState('');
  const [formError, setFormError] = useState('');

  // Preset values helper
  const handleSelectPreset = (tipo: TipoConcessao, val: number) => {
    setTipoConcessao(tipo);
    setValorPago(val);
  };

  // Metric computations
  const totalConcedido = db.diarias_ajuda_custo.reduce((acc, d) => acc + d.valor_pago, 0);
  const totalAssinados = db.diarias_ajuda_custo.filter((d) => d.recibo_assinado).length;

  const handleCreateDiaria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSolicitacaoId) {
      setFormError('Selecione uma solicitação de TFD aprovada.');
      return;
    }
    if (valorPago <= 0) {
      setFormError('Informe um valor válido maior que zero.');
      return;
    }

    const newDiaria: DiariaAjudaCusto = {
      id: `dia-${Date.now()}`,
      solicitacao_id: selectedSolicitacaoId,
      tipo_concessao: tipoConcessao,
      valor_pago: Number(valorPago),
      forma_pagamento: formaPagamento,
      recibo_assinado: reciboAssinado,
      data_pagamento: dataPagamento,
      observacoes,
    };

    onUpdateDb((prev) => ({
      ...prev,
      diarias_ajuda_custo: [newDiaria, ...prev.diarias_ajuda_custo],
    }));

    setShowNewDiariaModal(false);
    setObservacoes('');
    setFormError('');
  };

  const handleToggleAssinado = (diariaId: string) => {
    onUpdateDb((prev) => ({
      ...prev,
      diarias_ajuda_custo: prev.diarias_ajuda_custo.map((d) =>
        d.id === diariaId ? { ...d, recibo_assinado: !d.recibo_assinado } : d
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-700" />
            Controle de Diárias & Ajuda de Custo (TFD)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Liberação de recursos para alimentação, hospedagem e passagem terrestre com emissão de recibo formal (Portaria SAS/MS 055/99).
          </p>
        </div>

        <button
          onClick={() => setShowNewDiariaModal(true)}
          className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          Conceder Ajuda de Custo
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Liberado no Exercício
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {formatBRL(totalConcedido)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Recursos do Fundo Municipal de Saúde
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Diárias Concedidas
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {db.diarias_ajuda_custo.length} benefícios
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Alimentação, hospedagem e deslocamento
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Recibos Assinados / Prestados
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {totalAssinados} de {db.diarias_ajuda_custo.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Controle de prestação de contas SUS
          </p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Livro de Concessões Financeiras do TFD
          </span>
          <span className="text-xs text-slate-500">
            Clique em "Recibo A4" para imprimir documento comprobatório
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Nº Recibo / Data</th>
                  <th className="py-3 px-4">Paciente & Destino</th>
                  <th className="py-3 px-4">Tipo Concessão</th>
                  <th className="py-3 px-4">Valor Pago</th>
                  <th className="py-3 px-4">Forma Pagamento</th>
                  <th className="py-3 px-4">Prestação / Termo</th>
                  <th className="py-3 px-4 text-right">Comprovante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.diarias_ajuda_custo.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      Nenhuma diária registrada até o momento.
                    </td>
                  </tr>
                ) : (
                  db.diarias_ajuda_custo.map((d) => {
                    const sol = db.solicitacoes_tfd.find((s) => s.id === d.solicitacao_id);
                    const pac = db.pacientes.find((p) => p.id === sol?.paciente_id);

                    return (
                      <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-bold text-slate-900 text-xs">
                            REC-{d.id.toUpperCase().slice(-6)}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {formatDateBR(d.data_pagamento)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-xs">
                            {pac?.nome_completo || 'Paciente não localizado'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            CPF: {pac?.cpf}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Destino: <b>{sol?.cidade_destino}</b> ({sol?.hospital_destino})
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${
                              d.tipo_concessao === 'Alimentação'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : d.tipo_concessao === 'Hospedagem'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : d.tipo_concessao === 'Ambos'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {d.tipo_concessao}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 font-mono text-xs tabular-nums">
                            {formatBRL(d.valor_pago)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {d.forma_pagamento}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleAssinado(d.id)}
                            className={`px-2.5 py-0.5 text-[10px] font-bold rounded border transition-colors cursor-pointer ${
                              d.recibo_assinado
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            }`}
                          >
                            {d.recibo_assinado ? '✓ Recibo Assinado' : 'Pendente de Assinatura'}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onOpenReceiptModal(d)}
                            className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Recibo A4
                          </button>
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

      {/* MODAL: CONCEDER AJUDA DE CUSTO */}
      {showNewDiariaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-700" />
                Conceder Nova Diária / Ajuda de Custo
              </h3>
              <button
                onClick={() => setShowNewDiariaModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDiaria} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Solicitação TFD Vinculada */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Selecione a Solicitação TFD Aprovada
                </label>
                <select
                  value={selectedSolicitacaoId}
                  onChange={(e) => setSelectedSolicitacaoId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  required
                >
                  {db.solicitacoes_tfd.map((s) => {
                    const pac = db.pacientes.find((p) => p.id === s.paciente_id);
                    return (
                      <option key={s.id} value={s.id}>
                        {pac?.nome_completo} • {s.cidade_destino} ({s.hospital_destino}) [{s.status}]
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Presets de Ajuda de Custo */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tabela Referencial de Valores (Portaria SAS/MS):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('Alimentação', 40.0)}
                    className="p-2 border rounded-lg text-left hover:border-emerald-600 transition-colors bg-slate-50 cursor-pointer"
                  >
                    <span className="font-bold block text-slate-800">Alimentação Simples</span>
                    <span className="text-slate-500 text-[10px]">1 pessoa • R$ 40,00</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('Alimentação', 80.0)}
                    className="p-2 border rounded-lg text-left hover:border-emerald-600 transition-colors bg-slate-50 cursor-pointer"
                  >
                    <span className="font-bold block text-slate-800">Alimentação Dupla</span>
                    <span className="text-slate-500 text-[10px]">Paciente + Acomp. • R$ 80,00</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('Hospedagem', 120.0)}
                    className="p-2 border rounded-lg text-left hover:border-emerald-600 transition-colors bg-slate-50 cursor-pointer"
                  >
                    <span className="font-bold block text-slate-800">Pernoite / Hospedagem</span>
                    <span className="text-slate-500 text-[10px]">Diária hotel • R$ 120,00</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('Ambos', 240.0)}
                    className="p-2 border rounded-lg text-left hover:border-emerald-600 transition-colors bg-slate-50 cursor-pointer"
                  >
                    <span className="font-bold block text-slate-800">Ambos (Alim. + Hosp.)</span>
                    <span className="text-slate-500 text-[10px]">Completo c/ acomp. • R$ 240,00</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Tipo Concessão */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipo de Concessão
                  </label>
                  <select
                    value={tipoConcessao}
                    onChange={(e) => setTipoConcessao(e.target.value as TipoConcessao)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Alimentação">Alimentação</option>
                    <option value="Hospedagem">Hospedagem</option>
                    <option value="Ambos">Ambos (Alimentação e Hospedagem)</option>
                    <option value="Passagem Terrestre">Passagem Terrestre (Avulsa)</option>
                  </select>
                </div>

                {/* Valor Pago */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Valor Concedido (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={valorPago}
                    onChange={(e) => setValorPago(parseFloat(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Forma Pagamento */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="PIX">PIX (Chave CPF do Titular)</option>
                    <option value="Ordem Bancária">Ordem Bancária / Fundo Municipal</option>
                    <option value="Transferência (TED)">Transferência Bancária</option>
                    <option value="Espécie">Espécie (Cheque / Tesouraria)</option>
                  </select>
                </div>

                {/* Data Pagamento */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Data do Pagamento
                  </label>
                  <input
                    type="date"
                    value={dataPagamento}
                    onChange={(e) => setDataPagamento(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
              </div>

              {/* Termo Assinado */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reciboAssinado}
                    onChange={(e) => setReciboAssinado(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-semibold text-slate-800">
                    Beneficiário assinou termo de recebimento e compromisso
                  </span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observações / Justificativa Financeira
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Número de empenho ou detalhes do paciente..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewDiariaModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer"
                >
                  Registrar Liberação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
