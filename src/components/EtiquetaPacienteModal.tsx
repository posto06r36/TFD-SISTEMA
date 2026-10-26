import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Printer, MapPin, Clock, Calendar, CheckCircle, Tag, ShieldCheck, Bus } from 'lucide-react';
import { SolicitacaoTFD, Paciente, Acompanhante, PontoEspera, ViagemAgendada, PassageiroViagem } from '../types/tfd';
import { formatDateBR } from '../utils/masks';

interface EtiquetaPacienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  solicitacao: SolicitacaoTFD | null;
  paciente: Paciente | null;
  acompanhante?: Acompanhante | null;
  pontoEspera?: PontoEspera | null;
  viagem?: ViagemAgendada | null;
  passageiroViagem?: PassageiroViagem | null;
}

export const EtiquetaPacienteModal: React.FC<EtiquetaPacienteModalProps> = ({
  isOpen,
  onClose,
  solicitacao,
  paciente,
  acompanhante,
  pontoEspera,
  viagem,
  passageiroViagem,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const osNumero = solicitacao?.ordem_numero || `OS-TFD-2026/${solicitacao?.id.replace('sol-', '')}`;
  const dataViagem = solicitacao?.data_viagem_prevista || viagem?.data_partida || solicitacao?.data_agendada_consulta;
  const horarioSaida = solicitacao?.horario_saida_previsto || pontoEspera?.horario_estimado_passagem || viagem?.horario_partida || '04:00';
  const nomePonto = solicitacao?.ponto_espera_nome || pontoEspera?.nome || viagem?.ponto_encontro || 'Pátio da Secretaria de Saúde';
  const refPonto = pontoEspera?.referencia || pontoEspera?.endereco || 'Ponto de coleta municipal';

  useEffect(() => {
    if (solicitacao && paciente) {
      const payload = JSON.stringify({
        os: osNumero,
        paciente: paciente.nome_completo,
        cpf: paciente.cpf,
        data: dataViagem,
        horario: horarioSaida,
        ponto: nomePonto,
      });

      QRCode.toDataURL(payload, {
        width: 130,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error(err));
    }
  }, [solicitacao, paciente, dataViagem, horarioSaida, nomePonto, osNumero]);

  if (!isOpen || !solicitacao || !paciente) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 my-6">
        
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Etiqueta / Papel do Paciente (Dia da Viagem)</h3>
              <p className="text-xs text-slate-500">Comprovante de bolso para entrega em mãos no balcão TFD</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slip Preview Body */}
        <div className="p-6 bg-slate-100 flex flex-col items-center">
          <p className="text-xs text-slate-500 mb-3 text-center">
            Entregue este papel / etiqueta ao paciente com o ponto e horário exato que o carro passará.
          </p>

          {/* Printable Ticket / Sticker Box */}
          <div
            id="thermal-voucher-print-area"
            className="w-[280px] bg-white p-4 shadow-md border-2 border-slate-400 font-sans text-slate-900 text-xs text-left leading-tight rounded-sm"
          >
            {/* Header */}
            <div className="text-center border-b-2 border-dashed border-slate-400 pb-2 mb-2">
              <div className="font-extrabold uppercase text-[11px] tracking-tight text-slate-900">
                PREFEITURA MUNICIPAL DE SAÚDE
              </div>
              <div className="text-[10px] text-slate-600 font-semibold">
                CENTRAL TFD • TRANSPORTE GRATUITO SUS
              </div>
              <div className="inline-block mt-1 bg-emerald-800 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                {osNumero}
              </div>
            </div>

            {/* CALLOUT: ONDE E QUE HORAS O CARRO PASSA */}
            <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded my-2 text-center">
              <span className="text-[9px] font-bold text-emerald-900 uppercase block tracking-wider">
                ONDE ESPERAR O VEÍCULO:
              </span>
              <div className="text-xs font-black text-slate-900 mt-0.5 leading-snug">
                📍 {nomePonto}
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5">
                Ref: {refPonto}
              </div>

              <div className="mt-2 pt-2 border-t border-emerald-200 flex justify-around items-center">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">DATA DA VIAGEM</span>
                  <span className="font-mono font-black text-xs text-slate-900">
                    {formatDateBR(dataViagem)}
                  </span>
                </div>
                <div className="border-l border-emerald-300 pl-3">
                  <span className="text-[9px] text-emerald-800 uppercase block font-bold">HORA QUE PASSA</span>
                  <span className="font-mono font-black text-base text-emerald-950">
                    ⏰ {horarioSaida}
                  </span>
                </div>
              </div>
            </div>

            {/* Paciente e Acompanhante */}
            <div className="border-b border-dashed border-slate-300 pb-2 mb-2 space-y-1 text-[11px]">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">Paciente:</span>
                <span className="font-bold text-slate-900 block">{paciente.nome_completo}</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-600">
                <span>CPF: {paciente.cpf}</span>
                <span>CNS: {paciente.cartao_sus.slice(0, 11)}...</span>
              </div>

              {solicitacao.requer_acompanhante && acompanhante && (
                <div className="bg-purple-50 p-1.5 rounded border border-purple-200 text-[10px] mt-1">
                  <span className="text-purple-800 font-bold block uppercase text-[9px]">
                    + Acompanhante Autorizado:
                  </span>
                  <span className="font-semibold text-slate-800">{acompanhante.nome_completo}</span>
                  <span className="text-slate-500 block text-[9px]">({acompanhante.grau_parentesco})</span>
                </div>
              )}
            </div>

            {/* Destino & Hospital */}
            <div className="border-b border-dashed border-slate-300 pb-2 mb-2 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Cidade Destino:</span>
                <span className="font-bold text-slate-900">{solicitacao.cidade_destino}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hospital/Clínica:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[150px]">{solicitacao.hospital_destino}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Especialidade:</span>
                <span>{solicitacao.especialidade_medica}</span>
              </div>
              {passageiroViagem && (
                <div className="flex justify-between pt-1 font-bold text-emerald-800 text-[11px]">
                  <span>Poltrona Reservada:</span>
                  <span className="font-mono text-sm font-black">Nº {passageiroViagem.numero_poltrona}</span>
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="text-center my-2 flex flex-col items-center">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code OS" className="w-24 h-24 border border-slate-200 p-0.5" />
              ) : (
                <div className="w-24 h-24 bg-slate-100 flex items-center justify-center border border-slate-200" />
              )}
              <span className="text-[8.5px] font-mono text-slate-500 mt-1 uppercase font-semibold">
                APRESENTAR NO EMBARQUE DO VEÍCULO
              </span>
            </div>

            {/* Avisos */}
            <div className="text-[8.5px] text-slate-600 leading-snug space-y-1 text-center pt-1 border-t border-dashed border-slate-300">
              <p className="font-bold text-emerald-800">★ TRANSPORTE 100% GRATUITO PELO SUS ★</p>
              <p>• Chegue com <strong>15 minutos de antecedência</strong> ao ponto de espera.</p>
              <p>• Portar RG original com foto, Cartão SUS e laudo.</p>
              <div className="text-[8px] text-slate-400 pt-1">
                Emitido por: {solicitacao.operador_emissor_nome || 'Operador TFD'} • {new Date().toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Formato compacto etiqueta / bolso</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Etiqueta do Paciente
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
