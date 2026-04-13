export interface SuperCashbackInput {
  scenarioName: string;
  cotacaoDolar: number | null;
  valorCompra: number | null;
  pontosPorRealParceiro: number | null;
  pontosPorDolarCartao: number | null;
  bonusTransferenciaParceiro: number | null;
  custoMilheiroParceiro: number | null;
  bonusTransferenciaCartao: number | null;
  custoMilheiroCartao: number | null;
  somarPontosCartaoNaAnaliseFinal: boolean;
  seguroProtecaoPreco: number | null;
  quoteUpdatedAt: string | null;
  quoteSource: 'api' | 'manual' | null;
}

export interface SuperCashbackOutput {
  pontosAcumuladosParceiro: number | null;
  pontosAcumuladosCartao: number | null;
  milhasParceiro: number | null;
  valorMilhasParceiro: number | null;
  milhasCartao: number | null;
  valorMilhasCartao: number | null;
  vendaMilhasTotal: number | null;
  valorFinalPedido: number | null;
  descontoReal: number | null;
}

export interface SuperCashbackFormValue {
  scenarioName: string;
  cotacaoDolar: number | null;
  valorCompra: number | null;
  pontosPorRealParceiro: string;
  pontosPorDolarCartao: string;
  bonusTransferenciaParceiro: string;
  custoMilheiroParceiro: number | null;
  bonusTransferenciaCartao: string;
  custoMilheiroCartao: number | null;
  seguroProtecaoPreco: number | null;
  somarPontosCartaoNaAnaliseFinal: boolean;
}

export interface DollarQuoteSnapshot {
  value: number;
  updatedAt: string;
  source: 'api' | 'manual';
}

export interface SuperCashbackDraft {
  formValue: SuperCashbackFormValue;
  quoteUpdatedAt: string | null;
  quoteSource: 'api' | 'manual' | null;
  savedAt: string;
}

export interface SavedSimulation {
  id: string;
  name: string;
  formValue: SuperCashbackFormValue;
  quoteUpdatedAt: string | null;
  quoteSource: 'api' | 'manual' | null;
  discountRate: number | null;
  savedAt: string;
}
