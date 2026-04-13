import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { SuperCashbackService } from './super-cashback.service';
import { SavedSimulation, SuperCashbackDraft } from './super-cashback.types';

describe('SuperCashbackService', () => {
  let service: SuperCashbackService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [SuperCashbackService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SuperCashbackService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should fetch the USD quote from AwesomeAPI', () => {
    let receivedValue = 0;

    service.fetchDollarQuote().subscribe((quote) => {
      receivedValue = quote.value;
      expect(quote.updatedAt).toBe('2026-04-13 15:00:00');
      expect(quote.source).toBe('api');
    });

    const request = httpMock.expectOne('https://economia.awesomeapi.com.br/last/USD-BRL');
    request.flush({
      USDBRL: {
        bid: '5.6789',
        create_date: '2026-04-13 15:00:00',
      },
    });

    expect(receivedValue).toBe(5.6789);
  });

  it('should persist and restore the draft', () => {
    const draft: SuperCashbackDraft = {
      formValue: {
        scenarioName: 'Rascunho',
        cotacaoDolar: 5.67,
        valorCompra: 1000,
        pontosPorRealParceiro: '10',
        pontosPorDolarCartao: '2',
        bonusTransferenciaParceiro: '80',
        custoMilheiroParceiro: 20,
        bonusTransferenciaCartao: '100',
        custoMilheiroCartao: 15,
        seguroProtecaoPreco: 0,
        somarPontosCartaoNaAnaliseFinal: true,
      },
      quoteUpdatedAt: '2026-04-13T15:00:00.000Z',
      quoteSource: 'manual',
      savedAt: '2026-04-13T15:00:00.000Z',
    };

    service.saveDraft(draft);

    expect(service.getDraft()).toEqual(draft);
  });

  it('should save, list and delete named simulations', () => {
    const simulation: SavedSimulation = {
      id: 'sim-1',
      name: 'Cenário 1',
      formValue: {
        scenarioName: 'Cenário 1',
        cotacaoDolar: 5.67,
        valorCompra: 1000,
        pontosPorRealParceiro: '10',
        pontosPorDolarCartao: '2',
        bonusTransferenciaParceiro: '80',
        custoMilheiroParceiro: 20,
        bonusTransferenciaCartao: '100',
        custoMilheiroCartao: 15,
        seguroProtecaoPreco: 0,
        somarPontosCartaoNaAnaliseFinal: true,
      },
      quoteUpdatedAt: '2026-04-13T15:00:00.000Z',
      quoteSource: 'api',
      discountRate: 0.34,
      savedAt: '2026-04-13T15:00:00.000Z',
    };

    service.saveNamedSimulation(simulation);
    expect(service.getSavedSimulations()).toEqual([simulation]);

    const remaining = service.deleteNamedSimulation('sim-1');
    expect(remaining).toEqual([]);
    expect(service.getSavedSimulations()).toEqual([]);
  });
});
