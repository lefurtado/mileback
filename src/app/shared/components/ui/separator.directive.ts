import { Directive } from '@angular/core';

@Directive({
  selector: '[zSeparator]',
  host: {
    class: 'block h-px w-full shrink-0 bg-border/80',
  },
})
export class SeparatorDirective {}
