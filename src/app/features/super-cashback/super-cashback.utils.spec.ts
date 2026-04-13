import { calculateSuperCashback, parseLocalizedNumber } from './super-cashback.utils';
import { SuperCashbackInput } from './super-cashback.types';

function buildInput(overrides: Partial<SuperCashbackInput> = {}): SuperCashbackInput {
  return {
    scenarioName: 'Teste',
    cotacaoDolar: 5,
    valorCompra: 1000,
    pontosPorRealParceiro: 10,
    pontosPorDolarCartao: 2,
    bonusTransferenciaParceiro: 80,
    custoMilheiroParceiro: 20,
    bonusTransferenciaCartao: 100,
    custoMilheiroCartao: 18,
    somarPontosCartaoNaAnaliseFinal: true,
    seguroProtecaoPreco: 50,
    quoteUpdatedAt: null,
    quoteSource: 'api',
    ...overrides,
  };
}

describe('parseLocalizedNumber', () => {
  it('should parse pt-BR decimal values with comma', () => {
    expect(parseLocalizedNumber('1.234,56')).toBe(1234.56);
  });

  it('should parse dot decimals', () => {
    expect(parseLocalizedNumber('65.5')).toBe(65.5);
  });

  it('should return null for invalid content', () => {
    expect(parseLocalizedNumber('abc')).toBeNull();
  });
});

describe('calculateSuperCashback', () => {
  it('should calculate all totals including card miles', () => {
    const result = calculateSuperCashback(buildInput());

    expect(result.pontosAcumuladosParceiro).toBe(10000);
    expect(result.pontosAcumuladosCartao).toBe(400);
    expect(result.milhasParceiro).toBe(18000);
    expect(result.valorMilhasParceiro).toBe(360);
    expect(result.milhasCartao).toBe(800);
    expect(result.valorMilhasCartao).toBe(14.4);
    expect(result.vendaMilhasTotal).toBe(374.4);
    expect(result.valorFinalPedido).toBe(575.6);
  });

  it('should exclude card miles from the final total when disabled', () => {
    const result = calculateSuperCashback(
      buildInput({ somarPontosCartaoNaAnaliseFinal: false }),
    );

    expect(result.vendaMilhasTotal).toBe(360);
    expect(result.valorFinalPedido).toBe(590);
  });

  it('should support partial outputs when the form is incomplete', () => {
    const result = calculateSuperCashback(
      buildInput({
        bonusTransferenciaCartao: null,
        custoMilheiroCartao: null,
      }),
    );

    expect(result.valorMilhasParceiro).toBe(360);
    expect(result.valorMilhasCartao).toBeNull();
    expect(result.vendaMilhasTotal).toBe(360);
  });
});
