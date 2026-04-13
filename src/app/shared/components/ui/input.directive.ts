import { Directive, computed, input } from '@angular/core';

import { mergeClasses } from '@/shared/utils';

@Directive({
  selector: 'input[zInput], textarea[zInput]',
  host: {
    '[class]': 'classes()',
  },
})
export class InputDirective {
  readonly invalid = input(false);

  protected readonly classes = computed(() =>
    mergeClasses(
      'flex h-11 w-full rounded-xl border bg-background px-3 py-2 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      this.invalid()
        ? 'border-destructive focus-visible:ring-destructive/30'
        : 'border-border focus-visible:ring-ring/40',
    ),
  );
}
