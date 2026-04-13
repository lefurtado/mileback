import { SuperCashbackFormValue, SuperCashbackInput, SuperCashbackOutput } from './super-cashback.types';

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function validPositive(value: number | null | undefined): number | null {
  return isFiniteNumber(value) && value > 0 ? value : null;
}

function validNonNegative(value: number | null | undefined): number | null {
  return isFiniteNumber(value) && value >= 0 ? value : null;
}

function sumNullable(...values: Array<number | null>): number | null {
  const availableValues = values.filter(isFiniteNumber);
  if (availableValues.length === 0) {
    return null;
  }

  return availableValues.reduce((total, current) => total + current, 0);
}

export function parseLocalizedNumber(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .trim()
    .replace(/\s+/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.');

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Migra valores monetários salvos como string (localStorage) para number. */
export function coerceCurrencyFromStorage(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    if (value.trim() === '') {
      return null;
    }
    return parseLocalizedNumber(value);
  }
  return null;
}

function stringifyFormField(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return String(value);
}

export function normalizeSuperCashbackFormValue(
  source: SuperCashbackFormValue | Record<string, unknown>,
): SuperCashbackFormValue {
  const s = source as Record<string, unknown>;
  return {
    scenarioName: typeof s['scenarioName'] === 'string' ? s['scenarioName'] : '',
    cotacaoDolar: coerceCurrencyFromStorage(s['cotacaoDolar']),
    valorCompra: coerceCurrencyFromStorage(s['valorCompra']),
    pontosPorRealParceiro: stringifyFormField(s['pontosPorRealParceiro']),
    pontosPorDolarCartao: stringifyFormField(s['pontosPorDolarCartao']),
    bonusTransferenciaParceiro: stringifyFormField(s['bonusTransferenciaParceiro']),
    custoMilheiroParceiro: coerceCurrencyFromStorage(s['custoMilheiroParceiro']),
    bonusTransferenciaCartao: stringifyFormField(s['bonusTransferenciaCartao']),
    custoMilheiroCartao: coerceCurrencyFromStorage(s['custoMilheiroCartao']),
    seguroProtecaoPreco: coerceCurrencyFromStorage(s['seguroProtecaoPreco']),
    somarPontosCartaoNaAnaliseFinal:
      typeof s['somarPontosCartaoNaAnaliseFinal'] === 'boolean' ? s['somarPontosCartaoNaAnaliseFinal'] : true,
  };
}

export function calculateSuperCashback(input: SuperCashbackInput): SuperCashbackOutput {
  const valorCompra = validPositive(input.valorCompra);
  const cotacaoDolar = validPositive(input.cotacaoDolar);
  const pontosPorRealParceiro = validNonNegative(input.pontosPorRealParceiro);
  const pontosPorDolarCartao = validNonNegative(input.pontosPorDolarCartao);
  const bonusTransferenciaParceiro = validNonNegative(input.bonusTransferenciaParceiro);
  const custoMilheiroParceiro = validNonNegative(input.custoMilheiroParceiro);
  const bonusTransferenciaCartao = validNonNegative(input.bonusTransferenciaCartao);
  const custoMilheiroCartao = validNonNegative(input.custoMilheiroCartao);
  const seguroProtecaoPreco = validNonNegative(input.seguroProtecaoPreco) ?? 0;

  const pontosAcumuladosParceiro =
    valorCompra !== null && pontosPorRealParceiro !== null
      ? valorCompra * pontosPorRealParceiro
      : null;

  const pontosAcumuladosCartao =
    valorCompra !== null && cotacaoDolar !== null && pontosPorDolarCartao !== null
      ? (valorCompra / cotacaoDolar) * pontosPorDolarCartao
      : null;

  const milhasParceiro =
    pontosAcumuladosParceiro !== null && bonusTransferenciaParceiro !== null
      ? pontosAcumuladosParceiro * (1 + bonusTransferenciaParceiro / 100)
      : null;

  const valorMilhasParceiro =
    milhasParceiro !== null && custoMilheiroParceiro !== null
      ? (milhasParceiro * custoMilheiroParceiro) / 1000
      : null;

  const milhasCartao =
    pontosAcumuladosCartao !== null && bonusTransferenciaCartao !== null
      ? pontosAcumuladosCartao * (1 + bonusTransferenciaCartao / 100)
      : null;

  const valorMilhasCartao =
    milhasCartao !== null && custoMilheiroCartao !== null
      ? (milhasCartao * custoMilheiroCartao) / 1000
      : null;

  const vendaMilhasTotal = input.somarPontosCartaoNaAnaliseFinal
    ? sumNullable(valorMilhasParceiro, valorMilhasCartao)
    : valorMilhasParceiro;

  const valorFinalPedido =
    valorCompra !== null ? valorCompra - (vendaMilhasTotal ?? 0) - seguroProtecaoPreco : null;

  const descontoReal =
    valorCompra !== null && valorCompra > 0 && valorFinalPedido !== null
      ? 1 - valorFinalPedido / valorCompra
      : null;

  return {
    pontosAcumuladosParceiro,
    pontosAcumuladosCartao,
    milhasParceiro,
    valorMilhasParceiro,
    milhasCartao,
    valorMilhasCartao,
    vendaMilhasTotal,
    valorFinalPedido,
    descontoReal,
  };
}
