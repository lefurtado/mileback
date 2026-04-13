import { Directive, computed, input } from '@angular/core';

import { mergeClasses } from '@/shared/utils';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'accent';

@Directive({
  selector: 'button[zButton], a[zButton]',
  host: {
    '[class]': 'classes()',
  },
})
export class ButtonDirective {
  readonly variant = input<ButtonVariant>('default');

  protected readonly classes = computed(() =>
    mergeClasses(
      'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
      'min-h-10 px-4 py-2',
      this.variant() === 'default' &&
        'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
      this.variant() === 'outline' &&
        'border border-border bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground',
      this.variant() === 'ghost' && 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      this.variant() === 'accent' &&
        'bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400',
    ),
  );
}
