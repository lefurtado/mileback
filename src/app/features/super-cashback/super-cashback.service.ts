import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, Subject } from 'rxjs';

import { DollarQuoteSnapshot, SavedSimulation, SuperCashbackDraft } from './super-cashback.types';

interface AwesomeApiQuoteResponse {
  USDBRL: {
    bid: string;
    create_date: string;
  };
}

const DRAFT_KEY = 'mileback.super-cashback.draft';
const SAVED_SCENARIOS_KEY = 'mileback.super-cashback.saved-scenarios';
const HISTORY_LIMIT = 10;

@Injectable({ providedIn: 'root' })
export class SuperCashbackService {
  private readonly http = inject(HttpClient);
  private readonly wizardClearSubject = new Subject<void>();

  /** Emite quando a aplicação pede limpeza total do wizard (formulário + rascunho). */
  readonly wizardClear$ = this.wizardClearSubject.asObservable();

  fetchDollarQuote(): Observable<DollarQuoteSnapshot> {
    return this.http
      .get<AwesomeApiQuoteResponse>('https://economia.awesomeapi.com.br/last/USD-BRL')
      .pipe(
        map((response) => ({
          value: Number(response.USDBRL.bid),
          updatedAt: response.USDBRL.create_date,
          source: 'api' as const,
        })),
      );
  }

  getDraft(): SuperCashbackDraft | null {
    return this.readStorage<SuperCashbackDraft>(DRAFT_KEY);
  }

  saveDraft(draft: SuperCashbackDraft): void {
    this.writeStorage(DRAFT_KEY, draft);
  }

  /** Remove o rascunho persistido (ex.: após limpar todos os campos). */
  clearDraft(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.removeItem(DRAFT_KEY);
  }

  /**
   * Limpa o rascunho salvo e notifica o componente do Super Cashback, se estiver carregado,
   * para resetar formulário, passo ativo e estado da cotação na memória.
   */
  requestWizardClear(): void {
    this.clearDraft();
    this.wizardClearSubject.next();
  }

  getSavedSimulations(): SavedSimulation[] {
    return this.readStorage<SavedSimulation[]>(SAVED_SCENARIOS_KEY) ?? [];
  }

  saveNamedSimulation(simulation: SavedSimulation): SavedSimulation[] {
    const current = this.getSavedSimulations().filter((item) => item.id !== simulation.id);
    const next = [simulation, ...current].slice(0, HISTORY_LIMIT);
    this.writeStorage(SAVED_SCENARIOS_KEY, next);
    return next;
  }

  deleteNamedSimulation(simulationId: string): SavedSimulation[] {
    const next = this.getSavedSimulations().filter((item) => item.id !== simulationId);
    this.writeStorage(SAVED_SCENARIOS_KEY, next);
    return next;
  }

  createSimulationId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private readStorage<T>(key: string): T | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private writeStorage(key: string, value: unknown): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(key, JSON.stringify(value));
  }
}
