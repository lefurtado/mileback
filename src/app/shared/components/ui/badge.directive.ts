import { Directive, computed, input } from '@angular/core';

import { mergeClasses } from '@/shared/utils';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success';

@Directive({
  selector: '[zBadge]',
  host: {
    '[class]': 'classes()',
  },
})
export class BadgeDirective {
  readonly variant = input<BadgeVariant>('default');

  protected readonly classes = computed(() =>
    mergeClasses(
      'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tracking-tight',
      this.variant() === 'default' && 'border-transparent bg-primary text-primary-foreground',
      this.variant() === 'secondary' && 'border-transparent bg-secondary text-secondary-foreground',
      this.variant() === 'outline' && 'border-border bg-background text-muted-foreground',
      this.variant() === 'success' &&
        'border-emerald-500/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
    ),
  );
}
