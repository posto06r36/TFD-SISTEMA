import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Tag, 
  Search, 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  PlusCircle, 
  CheckCircle2, 
  Building2, 
  Users, 
  HeartHandshake,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { TFDDatabase, SolicitacaoTFD, Paciente, Acompanhante, UsuarioSistema } from '../types/tfd';
import { formatDateBR } from '../utils/masks';

interface OrdensEmitidasModuloProps {
  db: TFDDatabase;
  activeUser: UsuarioSistema;
  onOpenOrdemTFD: (sol: SolicitacaoTFD) => void;
  onOpenEtiqueta: (sol: SolicitacaoTFD) => void;
  onOpenEmitirOS: () => void;
}

export const OrdensEmitidasModulo: React.FC<OrdensEmitidasModuloProps> = ({
  db,
  activeUser,
  onOpenOrdemTFD,
  onOpenEtiqueta,
  onOpenEmitirOS,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming'>('all');
  const [selectedPonto, setSelectedPonto] = useState<string>('all');
  const [isPrintingList, setIsPrintingList] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Match orders with patients and companions
  const ordersWithDetails = db.solicitacoes_tfd.map((sol) => {
    const paciente = db.pacientes.find((p) => p.id === sol.paciente_id);
    const acompanhante = db.acompanhantes.find((a) => a.solicitacao_id === sol.id);
    return {
      sol,
      paciente,
      acompanhante,
    };
  });

  // Filter list
  const filteredOrders = ordersWithDetails.filter(({ sol, paciente }) => {
    // Search text
    const term = searchTerm.toLowerCase().trim();
    const matchSearch =
      !term ||
      (paciente && paciente.nome_completo.toLowerCase().includes(term)) ||
      (paciente && paciente.cartao_sus.includes(term)) ||
      (sol.ordem_numero && sol.ordem_numero.toLowerCase().includes(term)) ||
      sol.cidade_destino.toLowerCase().includes(term) ||
      sol.hospital_destino.toLowerCase().includes(term);

    if (!matchSearch) return false;

    // Date filter
    const solDate = sol.data_viagem_prevista || sol.data_agendada_consulta;
    if (dateFilter === 'today' && solDate !== todayStr) return false;
    if (dateFilter === 'upcoming' && solDate < todayStr) return false;

    // Ponto de espera filter
    if (selectedPonto !== 'all') {
      const pontoMatch =
        sol.ponto_espera_id === selectedPonto ||
        sol.ponto_espera_nome?.includes(selectedPonto);
      if (!pontoMatch) return false;
    }

    return true;
  });

  const handlePrintFullList = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Painel de Ordens TFD • Gestão Master</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              <span>Ordens TFD Emitidas & Impressão</span>
            </h1>
            <p className="text-slate-300 text-xs max-w-2xl mt-1">
              Todos os pacientes com Ordens TFD geradas aparecem listados aqui automaticamente. 
              Imprima guias oficiais A4 com carimbo SUS ou etiquetas térmicas com QR Code com 1 clique.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handlePrintFullList}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs shadow-md border border-slate-700 transition flex items-center gap-2 cursor-pointer"
              title="Imprimir relação completa de ordens para o motorista ou fiscal"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Imprimir Relação do Dia</span>
            </button>

            <button
              onClick={onOpenEmitirOS}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-900/40 transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nova Ordem TFD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do paciente, CNS ou nº da OS..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
          />
        </div>

        {/* Date Filter & Ponto selector */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({ordersWithDetails.length})
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                dateFilter === 'today'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoje ({ordersWithDetails.filter((o) => (o.sol.data_viagem_prevista || o.sol.data_agendada_consulta) === todayStr).length})
            </button>
            <button
              onClick={() => setDateFilter('upcoming')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                dateFilter === 'upcoming'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Próximas
            </button>
          </div>

          <select
            value={selectedPonto}
            onChange={(e) => setSelectedPonto(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">Todos os Pontos de Espera</option>
            {db.pontos_espera.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List / Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Nenhuma Ordem TFD Encontrada</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Assim que você ou um operador emitir uma Ordem TFD, os dados do paciente aparecerão aqui imediatamente prontos para impressão.
          </p>
          <button
            onClick={onOpenEmitirOS}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Emitir Primeira Ordem Agora</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
            <span>Relação de Ordens TFD ({filteredOrders.length} pacientes cadastrados)</span>
            <span className="text-emerald-700 normal-case font-semibold">
              Transporte 100% Gratuito Garantido pelo SUS
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredOrders.map(({ sol, paciente, acompanhante }) => (
              <div
                key={sol.id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                {/* Patient & OS Identification */}
                <div className="space-y-1.5 min-w-[280px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                      {sol.ordem_numero || `OS-TFD-2026/${sol.id.replace('sol-', '')}`}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      {sol.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                    {paciente?.nome_completo || 'Paciente não informado'}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span>CNS: <strong className="text-slate-700 font-mono">{paciente?.cartao_sus || '—'}</strong></span>
                    <span>•</span>
                    <span>Tel: <strong className="text-slate-700">{paciente?.telefone_whatsapp || '—'}</strong></span>
                  </div>

                  {acompanhante && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-medium">
                      <Users className="w-3 h-3 text-amber-700" />
                      <span>Acompanhante: <strong>{acompanhante.nome_completo}</strong> ({acompanhante.grau_parentesco})</span>
                    </div>
                  )}
                </div>

                {/* Logistics details: Destination, Waiting Point, Scheduled time */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100 min-w-[260px]">
                  <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                    <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{sol.hospital_destino}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pl-5.5">
                    {sol.cidade_destino} • {sol.especialidade_medica}
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-700 pt-1 border-t border-slate-200/60">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="font-medium text-[11px]">
                      {sol.ponto_espera_nome || 'Pátio da Secretaria de Saúde'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pl-5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDateBR(sol.data_viagem_prevista || sol.data_agendada_consulta)}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-emerald-800">
                      <Clock className="w-3 h-3 text-emerald-700" />
                      {sol.horario_saida_previsto || '03:30'}
                    </span>
                  </div>
                </div>

                {/* Direct Print Buttons */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 lg:pt-0">
                  <button
                    onClick={() => onOpenOrdemTFD(sol)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition cursor-pointer"
                    title="Imprimir Guia Oficial da Ordem TFD em Folha A4 com carimbo e assinaturas"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Ordem A4</span>
                  </button>

                  <button
                    onClick={() => onOpenEtiqueta(sol)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 transition cursor-pointer"
                    title="Imprimir Etiqueta / Cupom Térmico 58mm do Paciente com QR Code e Ponto de Embarque"
                  >
                    <Tag className="w-4 h-4 text-emerald-700" />
                    <span>Imprimir Etiqueta</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Printable Area for Batch List (Shown when window.print() is called) */}
      <div id="print-full-orders-list" className="hidden print:block p-6 bg-white text-slate-900 text-xs font-serif leading-relaxed">
        <div className="text-center border-b-2 border-slate-900 pb-3 mb-4 font-sans">
          <div className="font-bold text-xs uppercase tracking-widest text-slate-900">
            PREFEITURA MUNICIPAL • SECRETARIA MUNICIPAL DE SAÚDE
          </div>
          <div className="font-extrabold text-sm uppercase text-slate-900 mt-1">
            RELAÇÃO OFICIAL DE ORDENS TFD EMITIDAS E PASSAGEIROS AUTORIZADOS
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-0.5">
            TRANSPORTE E PASSAGEM 100% GRATUITOS PELO SUS • DATA DE EMISSÃO: {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>

        <table className="w-full text-left border-collapse font-sans text-[11px]">
          <thead>
            <tr className="bg-slate-100 border-y border-slate-300 text-slate-900">
              <th className="p-2 font-bold">Nº OS</th>
              <th className="p-2 font-bold">Nome do Paciente</th>
              <th className="p-2 font-bold">Cartão SUS</th>
              <th className="p-2 font-bold">Destino / Hospital</th>
              <th className="p-2 font-bold">Ponto de Espera</th>
              <th className="p-2 font-bold">Horário</th>
              <th className="p-2 font-bold">Acompanhante</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredOrders.map(({ sol, paciente, acompanhante }) => (
              <tr key={sol.id}>
                <td className="p-2 font-mono font-bold">{sol.ordem_numero || sol.id}</td>
                <td className="p-2 font-bold">{paciente?.nome_completo || '—'}</td>
                <td className="p-2 font-mono">{paciente?.cartao_sus || '—'}</td>
                <td className="p-2">{sol.hospital_destino} ({sol.cidade_destino})</td>
                <td className="p-2">{sol.ponto_espera_nome || 'Secretaria'}</td>
                <td className="p-2 font-bold">{sol.horario_saida_previsto || '03:30'}</td>
                <td className="p-2">{acompanhante ? `${acompanhante.nome_completo} (${acompanhante.grau_parentesco})` : 'Não'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-600">
          <div>Central de TFD Municipal • Portaria SAS/MS nº 055/1999</div>
          <div>Visto do Fiscal / Motorista: _____________________________________</div>
        </div>
      </div>
    </div>
  );
};
