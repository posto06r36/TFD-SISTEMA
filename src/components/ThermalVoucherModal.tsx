import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Printer, CheckCircle, Bus, QrCode as QrIcon } from 'lucide-react';
import { PassageiroViagem, ViagemAgendada, SolicitacaoTFD, Paciente, Veiculo, Motorista, Acompanhante } from '../types/tfd';
import { formatDateBR } from '../utils/masks';

interface ThermalVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: PassageiroViagem | null;
  viagem: ViagemAgendada | null;
  solicitacao: SolicitacaoTFD | null;
  paciente: Paciente | null;
  acompanhante?: Acompanhante | null;
  veiculo: Veiculo | null;
  motorista: Motorista | null;
}

export const ThermalVoucherModal: React.FC<ThermalVoucherModalProps> = ({
  isOpen,
  onClose,
  passageiro,
  viagem,
  solicitacao,
  paciente,
  acompanhante,
  veiculo,
  motorista,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (passageiro?.voucher_token) {
      // Generate QR Code containing verification payload
      const qrPayload = JSON.stringify({
        tfd_token: passageiro.voucher_token,
        viagem_cod: viagem?.codigo_viagem,
        cpf: passageiro.cpf_passageiro,
        poltrona: passageiro.numero_poltrona,
        data: viagem?.data_partida,
      });

      QRCode.toDataURL(qrPayload, {
        width: 140,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Error generating QR code:', err));
    }
  }, [passageiro, viagem]);

  if (!isOpen || !passageiro || !viagem) return null;

  const handlePrint = () => {
    window.print();
  };

  const isAcompanhante = passageiro.tipo_passageiro === 'Acompanhante';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Voucher de Embarque TFD</h3>
              <p className="text-xs text-slate-500">Impressão Térmica Bobina 58mm (POS-58)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / 58mm Thermal Slip Container */}
        <div className="p-6 bg-slate-100 flex flex-col items-center">
          <p className="text-xs text-slate-500 mb-3 text-center">
            Visualização prévia do cupom térmico (58mm). Clique em Imprimir para envio à bobina.
          </p>

          {/* 58mm Simulated Thermal Paper Card */}
          <div
            id="thermal-voucher-print-area"
            className="w-[260px] bg-white p-4 shadow-md border border-slate-300 font-mono text-slate-900 text-xs text-left leading-tight rounded-sm"
          >
            {/* Header Prefeitura */}
            <div className="text-center border-b border-dashed border-slate-400 pb-2 mb-2">
              <div className="font-extrabold uppercase text-[12px] tracking-tight">PREFEITURA MUNICIPAL</div>
              <div className="text-[10px] text-slate-700">SECRETARIA MUNICIPAL DE SAÚDE</div>
              <div className="font-bold text-[11px] text-emerald-800 mt-1">CENTRAL TFD MUNICIPAL</div>
              <div className="text-[9px] text-slate-500">Tratamento Fora do Domicílio</div>
            </div>

            {/* Voucher Title & Seat Big Callout */}
            <div className="text-center my-2 p-1.5 bg-slate-100 rounded border border-slate-300">
              <div className="text-[9px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-100 px-1 py-0.5 rounded mb-1">
                ORDEM TFD GRATUITA • SUS
              </div>
              <span className="text-[10px] uppercase block text-slate-700 font-extrabold">VOUCHER DE EMBARQUE</span>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                POLTRONA {String(passageiro.numero_poltrona).padStart(2, '0')}
              </div>
              <div className="text-[9px] font-bold text-slate-700 mt-0.5">
                {passageiro.voucher_token}
              </div>
              <div className="text-[8px] font-bold text-emerald-700 mt-1 uppercase">
                ★ TARIFA ZERO / ISENÇÃO TOTAL DE TAXAS ★
              </div>
            </div>

            {/* Passenger Info */}
            <div className="border-b border-dashed border-slate-400 pb-2 mb-2 space-y-1 text-[11px]">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">Passageiro ({passageiro.tipo_passageiro}):</span>
                <span className="font-bold text-slate-900 uppercase block">{passageiro.nome_passageiro}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>CPF: <b className="tabular-nums">{passageiro.cpf_passageiro}</b></span>
              </div>
              {passageiro.cartao_sus_passageiro && (
                <div className="text-[10px]">
                  <span>CNS: <b className="tabular-nums">{passageiro.cartao_sus_passageiro}</b></span>
                </div>
              )}
              {isAcompanhante && paciente && (
                <div className="text-[10px] bg-slate-50 p-1 rounded mt-1">
                  <span className="text-slate-500 text-[9px] block">Acompanhante do Paciente:</span>
                  <span className="font-medium text-slate-800">{paciente.nome_completo}</span>
                  {acompanhante?.grau_parentesco && (
                    <span className="text-slate-500 block text-[9px]">Grau: {acompanhante.grau_parentesco}</span>
                  )}
                </div>
              )}
            </div>

            {/* Trip details */}
            <div className="border-b border-dashed border-slate-400 pb-2 mb-2 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>VIAGEM:</span>
                <b className="tabular-nums">{viagem.codigo_viagem}</b>
              </div>
              <div className="flex justify-between">
                <span>DATA PARTIDA:</span>
                <b className="tabular-nums">{formatDateBR(viagem.data_partida)}</b>
              </div>
              <div className="flex justify-between">
                <span>HORA SAÍDA:</span>
                <b className="tabular-nums text-sm font-bold">{viagem.horario_partida}</b>
              </div>
              <div className="pt-1">
                <span className="text-[9px] text-slate-500 uppercase block">Ponto de Encontro:</span>
                <span className="font-semibold block leading-tight">{viagem.ponto_encontro}</span>
              </div>
            </div>

            {/* Destination & Hospital */}
            <div className="border-b border-dashed border-slate-400 pb-2 mb-2 space-y-1 text-[10px]">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">Destino:</span>
                <b className="uppercase">{viagem.cidade_destino}</b>
              </div>
              {solicitacao && (
                <>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Hospital / Clínica:</span>
                    <span className="font-semibold">{solicitacao.hospital_destino}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Especialidade / CID-10:</span>
                    <span>{solicitacao.especialidade_medica} ({solicitacao.cid_10})</span>
                  </div>
                </>
              )}
            </div>

            {/* Vehicle & Driver */}
            <div className="border-b border-dashed border-slate-400 pb-2 mb-2 text-[10px] space-y-0.5">
              <div>
                <span>VEÍCULO: </span>
                <b className="tabular-nums">{veiculo?.placa || 'PLACA NÃO DEF.'}</b> ({veiculo?.modelo?.slice(0, 16) || 'Van TFD'})
              </div>
              <div>
                <span>MOTORISTA: </span>
                <span className="font-semibold">{motorista?.nome_completo?.split(' ')[0]} {motorista?.nome_completo?.split(' ').slice(-1)[0]}</span>
              </div>
              {motorista?.cnh && (
                <div className="text-[9px] text-slate-500">
                  CNH: <span className="tabular-nums">{motorista.cnh}</span> (Cat. {motorista.categoria_cnh})
                </div>
              )}
            </div>

            {/* QR Code Section */}
            <div className="text-center my-3 flex flex-col items-center">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code Validação" className="w-28 h-28 border border-slate-200 p-1" />
              ) : (
                <div className="w-28 h-28 bg-slate-100 flex items-center justify-center border border-slate-200">
                  <QrIcon className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <span className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
                VALIDAÇÃO FISCAL NO EMBARQUE
              </span>
            </div>

            {/* Rules / Footer */}
            <div className="text-[8.5px] text-slate-700 leading-tight space-y-1 text-center pt-1.5 border-t border-dashed border-slate-400">
              <p className="font-bold text-emerald-800 uppercase">★ TRANSPORTE 100% GRATUITO PELO SUS ★</p>
              <p>• Proibida qualquer cobrança de taxa ao usuário.</p>
              <p>• Apresente documento oficial com foto e Cartão SUS.</p>
              <p>• Comparecer com 30 minutos de antecedência.</p>
              <div className="pt-1.5 text-[8px] text-slate-400">
                Emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-[8px] font-bold text-slate-800 mt-0.5">
                CENTRAL MUNICIPAL DE REGULAÇÃO E TFD
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Pronto para impressora de bobina 58mm</span>
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
              Imprimir Cupom 58mm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
