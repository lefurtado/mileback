import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { mergeClasses } from '@/shared/utils';

@Component({
  selector: 'z-switch',
  template: `
    <button
      type="button"
      class="inline-flex h-7 w-12 items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      [class]="classes()"
      role="switch"
      [attr.aria-checked]="checked()"
      [disabled]="disabled()"
      (click)="toggle()"
    >
      <span
        class="h-5 w-5 rounded-full bg-background shadow-sm transition-transform duration-200"
        [class.translate-x-6]="checked()"
        [class.translate-x-1]="!checked()"
      ></span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchComponent {
  readonly checked = input(false);
  readonly disabled = input(false);
  readonly checkedChange = output<boolean>();

  protected readonly classes = computed(() =>
    mergeClasses(
      this.checked()
        ? 'border-emerald-500/25 bg-emerald-500'
        : 'border-border bg-muted text-muted-foreground',
    ),
  );

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }

    this.checkedChange.emit(!this.checked());
  }
}
