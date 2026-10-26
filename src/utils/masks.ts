/**
 * Utility functions for masks, validations and formatting
 */

// Format CPF: 000.000.000-00
export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

// Validate CPF algorithm (modulo 11)
export function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

// Format CNS (Cartão Nacional de Saúde) - 15 digits: 000 0000 0000 0000
export function maskCNS(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 15);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  if (digits.length <= 11) return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)} ${digits.slice(11, 15)}`;
}

// Validate CNS length (must be 15 digits and starts with 1, 2, 7, 8 or 9)
export function isValidCNS(cns: string): boolean {
  const clean = cns.replace(/\D/g, '');
  if (clean.length !== 15) return false;
  return /^[12789]\d{14}$/.test(clean);
}

// Format WhatsApp / Celular: (00) 00000-0000
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

// Format Currency BRL: R$ 150,00
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Format Brazilian Date: 2026-10-25 -> 25/10/2026
export function formatDateBR(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-BR');
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

// Format Date and Time
export function formatDateTimeBR(dateStr?: string, timeStr?: string): string {
  if (!dateStr) return '-';
  const formattedDate = formatDateBR(dateStr);
  return timeStr ? `${formattedDate} às ${timeStr}` : formattedDate;
}

// Common Brazilian CID-10 catalog for TFD procedures
export interface CID10Item {
  code: string;
  name: string;
  specialty: string;
}

export const COMMON_CID10: CID10Item[] = [
  { code: 'C50.9', name: 'Neoplasia maligna da mama não especificada', specialty: 'Oncologia' },
  { code: 'C61', name: 'Neoplasia maligna da próstata', specialty: 'Oncologia' },
  { code: 'C18.9', name: 'Neoplasia maligna do cólon', specialty: 'Oncologia' },
  { code: 'N18.0', name: 'Doença renal em estágio terminal / Hemodiálise', specialty: 'Nefrologia' },
  { code: 'N18.9', name: 'Doença renal crônica não especificada', specialty: 'Nefrologia' },
  { code: 'I20.0', name: 'Angina instável / Avaliação hemodinâmica', specialty: 'Cardiologia' },
  { code: 'I25.1', name: 'Doença cardíaca aterosclerótica', specialty: 'Cardiologia' },
  { code: 'I42.0', name: 'Cardiomiopatia dilatada', specialty: 'Cardiologia' },
  { code: 'M16.9', name: 'Coxartrose (Artrose do quadril)', specialty: 'Ortopedia' },
  { code: 'M17.9', name: 'Gonartrose (Artrose do joelho)', specialty: 'Ortopedia' },
  { code: 'M54.5', name: 'Dor lombar baixa / Hérnia de disco', specialty: 'Neurocirurgia / Ortopedia' },
  { code: 'H25.9', name: 'Catarata senil não especificada', specialty: 'Oftalmologia' },
  { code: 'H40.1', name: 'Glaucoma primário de ângulo aberto', specialty: 'Oftalmologia' },
  { code: 'H35.3', name: 'Degeneração de mácula e polo posterior', specialty: 'Oftalmologia' },
  { code: 'G40.9', name: 'Epilepsia não especificada', specialty: 'Neurologia' },
  { code: 'Q24.9', name: 'Malformação congênita do coração', specialty: 'Cardiopediatria' },
  { code: 'E10.9', name: 'Diabetes mellitus tipo 1 com complicações', specialty: 'Endocrinologia' },
];

export const COMMON_HOSPITALS = [
  { nome: 'Hospital das Clínicas da UFBA', cidade: 'Salvador', estado: 'BA' },
  { nome: 'Hospital Geral Roberto Santos', cidade: 'Salvador', estado: 'BA' },
  { nome: 'Hospital Aristides Maltez (Liga Contra o Câncer)', cidade: 'Salvador', estado: 'BA' },
  { nome: 'Hospital Santa Izabel', cidade: 'Salvador', estado: 'BA' },
  { nome: 'Hospital das Clínicas de Ribeirão Preto - USP', cidade: 'Ribeirão Preto', estado: 'SP' },
  { nome: 'Hospital de Amor de Barretos (Fundação Pio XII)', cidade: 'Barretos', estado: 'SP' },
  { nome: 'Hospital da Restauração', cidade: 'Recife', estado: 'PE' },
  { nome: 'IMIP - Instituto de Medicina Integral Professor Fernando Figueira', cidade: 'Recife', estado: 'PE' },
  { nome: 'Hospital das Clínicas da UFMG', cidade: 'Belo Horizonte', estado: 'MG' },
  { nome: 'Hospital Universitário Walter Cantídio', cidade: 'Fortaleza', estado: 'CE' },
];
