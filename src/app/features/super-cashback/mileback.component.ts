import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronDown,
  lucideRefreshCw,
  lucideArrowUpRight,
} from '@ng-icons/lucide';

import { BadgeDirective } from '@/shared/components/ui/badge.directive';
import { ButtonDirective } from '@/shared/components/ui/button.directive';
import {
  CardContentDirective,
  CardDescriptionDirective,
  CardDirective,
  CardFooterDirective,
  CardHeaderDirective,
  CardTitleDirective,
} from '@/shared/components/ui/card.directive';
import { DrawerComponent } from '@/shared/components/ui/drawer.component';
import { InputDirective } from '@/shared/components/ui/input.directive';
import { SeparatorDirective } from '@/shared/components/ui/separator.directive';
import { SwitchComponent } from '@/shared/components/ui/switch.component';
import { NgxCurrencyConfig, NgxCurrencyDirective, NgxCurrencyInputMode } from 'ngx-currency';
import { SuperCashbackService } from './super-cashback.service';
import {
  calculateSuperCashback,
  normalizeSuperCashbackFormValue,
  parseLocalizedNumber,
} from './super-cashback.utils';
import {
  SavedSimulation,
  SuperCashbackDraft,
  SuperCashbackFormValue,
  SuperCashbackInput,
} from './super-cashback.types';

interface StepDefinition {
  index: number;
  title: string;
  subtitle: string;
}

const DEFAULT_FORM_VALUE: SuperCashbackFormValue = {
  scenarioName: '',
  cotacaoDolar: null,
  valorCompra: null,
  pontosPorRealParceiro: '',
  pontosPorDolarCartao: '',
  bonusTransferenciaParceiro: '',
  custoMilheiroParceiro: null,
  bonusTransferenciaCartao: '',
  custoMilheiroCartao: null,
  seguroProtecaoPreco: null,
  somarPontosCartaoNaAnaliseFinal: true,
};

@Component({
  selector: 'app-mileback',
  imports: [
    ReactiveFormsModule,
    NgIcon,
    BadgeDirective,
    ButtonDirective,
    CardDirective,
    CardHeaderDirective,
    CardTitleDirective,
    CardDescriptionDirective,
    CardContentDirective,
    CardFooterDirective,
    DrawerComponent,
    InputDirective,
    SeparatorDirective,
    SwitchComponent,
    NgxCurrencyDirective,
  ],
  providers: [
    CurrencyPipe,
    DecimalPipe,
    PercentPipe,
    DatePipe,
    provideIcons({
      lucideCheck,
      lucideChevronLeft,
      lucideChevronRight,
      lucideChevronDown,
      lucideRefreshCw,
      lucideArrowUpRight,
    }),
  ],
  templateUrl: './mileback.component.html',
  styleUrl: './mileback.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilebackComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly service = inject(SuperCashbackService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly currencyPipe = inject(CurrencyPipe);
  private readonly decimalPipe = inject(DecimalPipe);
  private readonly percentPipe = inject(PercentPipe);
  private readonly datePipe = inject(DatePipe);

  protected readonly steps: StepDefinition[] = [
    { index: 0, title: 'Cotacao do dolar', subtitle: 'Base do calculo do cartao.' },
    { index: 1, title: 'Compra no parceiro', subtitle: 'Valor da compra e pontos do site.' },
    { index: 2, title: 'Pontos do cartao', subtitle: 'Conversao automatica com a cotacao.' },
    { index: 3, title: 'Milhas do parceiro', subtitle: 'Bonus e valor do milheiro.' },
    { index: 4, title: 'Milhas do cartao', subtitle: 'Ultimo ajuste antes do consolidado.' },
  ];

  protected readonly form = this.formBuilder.group({
    scenarioName: this.formBuilder.nonNullable.control(''),
    cotacaoDolar: this.formBuilder.control<number | null>(null, Validators.required),
    valorCompra: this.formBuilder.control<number | null>(null, Validators.required),
    pontosPorRealParceiro: this.formBuilder.nonNullable.control('', Validators.required),
    pontosPorDolarCartao: this.formBuilder.nonNullable.control('', Validators.required),
    bonusTransferenciaParceiro: this.formBuilder.nonNullable.control('', Validators.required),
    custoMilheiroParceiro: this.formBuilder.control<number | null>(null, Validators.required),
    bonusTransferenciaCartao: this.formBuilder.nonNullable.control('', Validators.required),
    custoMilheiroCartao: this.formBuilder.control<number | null>(null, Validators.required),
    seguroProtecaoPreco: this.formBuilder.control<number | null>(null),
    somarPontosCartaoNaAnaliseFinal: this.formBuilder.nonNullable.control(true),
  });

  /** Cotação: 4 casas, prefixo US$, mesmo modo financeiro do BRL global. */
  protected readonly ngxCurrencyUsdQuote: Partial<NgxCurrencyConfig> = {
    align: 'left',
    allowNegative: false,
    allowZero: true,
    decimal: ',',
    precision: 4,
    prefix: 'US$ ',
    suffix: '',
    thousands: '.',
    nullable: true,
    inputMode: NgxCurrencyInputMode.Financial,
  };

  protected readonly formValue = toSignal(
    this.form.valueChanges.pipe(
      startWith(this.form.getRawValue()),
      map(() => this.form.getRawValue() as SuperCashbackFormValue),
    ),
    { initialValue: this.form.getRawValue() as SuperCashbackFormValue },
  );

  protected readonly activeStep = signal(0);
  protected readonly drawerOpen = signal(false);
  protected readonly historyOpen = signal(false);
  protected readonly quoteLoading = signal(false);
  protected readonly quoteError = signal<string | null>(null);
  protected readonly quoteUpdatedAt = signal<string | null>(null);
  protected readonly quoteSource = signal<'api' | 'manual' | null>(null);
  protected readonly savedSimulations = signal<SavedSimulation[]>(this.service.getSavedSimulations());
  protected readonly saveFeedback = signal<string | null>(null);

  protected readonly parsedInput = computed<SuperCashbackInput>(() => {
    const raw = this.formValue();

    return {
      scenarioName: raw.scenarioName.trim(),
      cotacaoDolar: raw.cotacaoDolar,
      valorCompra: raw.valorCompra,
      pontosPorRealParceiro: parseLocalizedNumber(raw.pontosPorRealParceiro),
      pontosPorDolarCartao: parseLocalizedNumber(raw.pontosPorDolarCartao),
      bonusTransferenciaParceiro: parseLocalizedNumber(raw.bonusTransferenciaParceiro),
      custoMilheiroParceiro: raw.custoMilheiroParceiro,
      bonusTransferenciaCartao: parseLocalizedNumber(raw.bonusTransferenciaCartao),
      custoMilheiroCartao: raw.custoMilheiroCartao,
      seguroProtecaoPreco: raw.seguroProtecaoPreco,
      somarPontosCartaoNaAnaliseFinal: raw.somarPontosCartaoNaAnaliseFinal,
      quoteUpdatedAt: this.quoteUpdatedAt(),
      quoteSource: this.quoteSource(),
    };
  });

  protected readonly output = computed(() => calculateSuperCashback(this.parsedInput()));
  protected readonly scenarioName = computed(() => this.formValue().scenarioName.trim());
  protected readonly canSaveScenario = computed(
    () => this.stepCompletion()[4] && this.scenarioName().length > 0,
  );
  protected readonly quickSummary = computed(() => ({
    valorFinalPedido: this.output().valorFinalPedido,
    descontoReal: this.output().descontoReal,
  }));
  protected readonly baseInDollar = computed(() => {
    const input = this.parsedInput();
    if (input.valorCompra === null || input.cotacaoDolar === null || input.cotacaoDolar <= 0) {
      return null;
    }

    return input.valorCompra / input.cotacaoDolar;
  });

  protected readonly stepCompletion = computed(() => {
    const input = this.parsedInput();

    return [
      (input.cotacaoDolar ?? 0) > 0,
      (input.valorCompra ?? 0) > 0 && (input.pontosPorRealParceiro ?? -1) >= 0,
      (input.pontosPorDolarCartao ?? -1) >= 0 &&
        (input.cotacaoDolar ?? 0) > 0 &&
        (input.valorCompra ?? 0) > 0,
      (input.bonusTransferenciaParceiro ?? -1) >= 0 &&
        (input.custoMilheiroParceiro ?? -1) >= 0 &&
        (input.valorCompra ?? 0) > 0,
      (input.bonusTransferenciaCartao ?? -1) >= 0 &&
        (input.custoMilheiroCartao ?? -1) >= 0 &&
        (input.valorCompra ?? 0) > 0,
    ];
  });

  constructor() {
    this.restoreDraft();

    this.service.wizardClear$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.applyWizardClear();
      });

    this.form.valueChanges
      .pipe(
        debounceTime(180),
        distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.persistDraft();
        this.saveFeedback.set(null);
      });

    this.loadQuoteIfNeeded();
  }

  protected selectStep(stepIndex: number): void {
    this.activeStep.set(stepIndex);
  }

  protected goToAdjacentStep(offset: number): void {
    const next = Math.min(this.steps.length - 1, Math.max(0, this.activeStep() + offset));
    this.activeStep.set(next);
  }

  protected refreshQuote(force = true): void {
    this.quoteLoading.set(true);
    this.quoteError.set(null);

    this.service.fetchDollarQuote().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (quote) => {
        const shouldPatch =
          force || !this.form.controls.cotacaoDolar.value || this.quoteSource() !== 'manual';

        if (shouldPatch) {
          this.form.controls.cotacaoDolar.setValue(quote.value);
        }

        this.quoteUpdatedAt.set(quote.updatedAt);
        this.quoteSource.set('api');
        this.quoteLoading.set(false);
        this.persistDraft();
      },
      error: () => {
        this.quoteError.set('Nao foi possivel atualizar a cotacao agora.');
        this.quoteLoading.set(false);
      },
    });
  }

  protected markQuoteAsManual(): void {
    const v = this.form.controls.cotacaoDolar.value;
    if (v !== null && v !== undefined && Number.isFinite(v)) {
      this.quoteSource.set('manual');
      this.quoteUpdatedAt.set(new Date().toISOString());
      this.persistDraft();
    }
  }

  protected updateIncludeCardPoints(value: boolean): void {
    this.form.controls.somarPontosCartaoNaAnaliseFinal.setValue(value);
  }

  protected saveCurrentScenario(): void {
    if (!this.canSaveScenario()) {
      this.saveFeedback.set('Preencha todos os passos e informe um nome para salvar o cenario.');
      return;
    }

    const simulation: SavedSimulation = {
      id: this.service.createSimulationId(),
      name: this.scenarioName(),
      formValue: this.form.getRawValue() as SuperCashbackFormValue,
      quoteUpdatedAt: this.quoteUpdatedAt(),
      quoteSource: this.quoteSource(),
      discountRate: this.output().descontoReal,
      savedAt: new Date().toISOString(),
    };

    this.savedSimulations.set(this.service.saveNamedSimulation(simulation));
    this.saveFeedback.set('Cenario salvo no historico.');
    this.persistDraft();
  }

  protected loadScenario(simulation: SavedSimulation): void {
    this.form.reset({
      ...DEFAULT_FORM_VALUE,
      ...normalizeSuperCashbackFormValue(simulation.formValue),
    });
    this.quoteUpdatedAt.set(simulation.quoteUpdatedAt);
    this.quoteSource.set(simulation.quoteSource);
    this.activeStep.set(0);
    this.saveFeedback.set(`Cenario "${simulation.name}" carregado.`);
    this.persistDraft();
  }

  protected deleteScenario(simulationId: string): void {
    this.savedSimulations.set(this.service.deleteNamedSimulation(simulationId));
  }

  protected openDrawer(): void {
    this.drawerOpen.set(true);
  }

  protected closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  protected toggleHistory(): void {
    this.historyOpen.update((open) => !open);
  }

  protected stepCircleClass(index: number): string {
    if (this.stepCompletion()[index]) {
      return 'bg-emerald-500 border-emerald-500 text-white';
    }
    if (this.activeStep() === index) {
      return 'bg-primary border-primary text-primary-foreground';
    }
    return 'border-border text-muted-foreground bg-background';
  }

  protected isInvalidCurrencyPositive(value: number | null | undefined): boolean {
    return value !== null && value !== undefined && (!Number.isFinite(value) || value <= 0);
  }

  protected isInvalidCurrencyNonNegative(value: number | null | undefined): boolean {
    return value !== null && value !== undefined && (!Number.isFinite(value) || value < 0);
  }

  protected isInvalidPositive(rawValue: string | null | undefined, parsedValue: number | null): boolean {
    return (rawValue ?? '').trim().length > 0 && (parsedValue === null || parsedValue <= 0);
  }

  protected isInvalidNonNegative(rawValue: string | null | undefined, parsedValue: number | null): boolean {
    return (rawValue ?? '').trim().length > 0 && (parsedValue === null || parsedValue < 0);
  }

  protected formatCurrency(value: number | null): string {
    if (value === null) {
      return '--';
    }

    return this.currencyPipe.transform(value, 'BRL', 'symbol', '1.2-2', 'pt-BR') ?? '--';
  }

  protected formatPoints(value: number | null): string {
    if (value === null) {
      return '--';
    }

    return this.decimalPipe.transform(value, '1.0-2', 'pt-BR') ?? '--';
  }

  protected formatPercent(value: number | null): string {
    if (value === null) {
      return '--';
    }

    return this.percentPipe.transform(value, '1.1-2', 'pt-BR') ?? '--';
  }

  protected formatDate(value: string | null): string {
    if (!value) {
      return 'Sem atualizacao recente';
    }

    return this.datePipe.transform(value, "dd/MM/yyyy 'as' HH:mm", undefined, 'pt-BR') ?? value;
  }

  protected trackScenario(index: number, item: SavedSimulation): string {
    return item.id;
  }

  private restoreDraft(): void {
    const draft = this.service.getDraft();
    if (!draft) {
      return;
    }

    this.form.reset({
      ...DEFAULT_FORM_VALUE,
      ...normalizeSuperCashbackFormValue(draft.formValue),
    });
    this.quoteUpdatedAt.set(draft.quoteUpdatedAt);
    this.quoteSource.set(draft.quoteSource);
  }

  private persistDraft(): void {
    const draft: SuperCashbackDraft = {
      formValue: this.form.getRawValue() as SuperCashbackFormValue,
      quoteUpdatedAt: this.quoteUpdatedAt(),
      quoteSource: this.quoteSource(),
      savedAt: new Date().toISOString(),
    };

    this.service.saveDraft(draft);
  }

  private loadQuoteIfNeeded(): void {
    const q = this.form.controls.cotacaoDolar.value;
    const quoteFieldHasValue = q !== null && q !== undefined && Number.isFinite(q);
    if (quoteFieldHasValue && this.quoteSource() === 'manual') {
      return;
    }

    this.refreshQuote(!quoteFieldHasValue);
  }

  private applyWizardClear(): void {
    this.form.reset({ ...DEFAULT_FORM_VALUE });
    this.activeStep.set(0);
    this.quoteUpdatedAt.set(null);
    this.quoteSource.set(null);
    this.quoteError.set(null);
    this.quoteLoading.set(false);
    this.saveFeedback.set(null);
    this.loadQuoteIfNeeded();
  }

}
