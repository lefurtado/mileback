import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'z-drawer',
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" (click)="close.emit()"></div>
      <section
        class="fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] rounded-t-3xl border border-border bg-background p-4 shadow-2xl"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
      >
        <div class="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border"></div>
        <div class="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold tracking-tight">{{ title() }}</h2>
            @if (description()) {
              <p class="mt-1 text-sm text-muted-foreground">{{ description() }}</p>
            }
          </div>
          <button
            type="button"
            class="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            (click)="close.emit()"
            aria-label="Fechar resultado"
          >
            Fechar
          </button>
        </div>
        <div class="overflow-y-auto pb-4">
          <ng-content />
        </div>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerComponent {
  readonly open = input(false);
  readonly title = input('Painel');
  readonly description = input('');
  readonly close = output<void>();
}
