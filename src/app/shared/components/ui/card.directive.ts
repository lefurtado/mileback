import { Directive } from '@angular/core';

@Directive({
  selector: '[zCard]',
  host: {
    class:
      'block rounded-3xl border border-border/80 bg-card/90 text-card-foreground shadow-[0_18px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm',
  },
})
export class CardDirective {}

@Directive({
  selector: '[zCardHeader]',
  host: {
    class: 'flex flex-col gap-2 p-6',
  },
})
export class CardHeaderDirective {}

@Directive({
  selector: '[zCardTitle]',
  host: {
    class: 'text-lg font-semibold tracking-tight text-foreground',
  },
})
export class CardTitleDirective {}

@Directive({
  selector: '[zCardDescription]',
  host: {
    class: 'text-sm text-muted-foreground',
  },
})
export class CardDescriptionDirective {}

@Directive({
  selector: '[zCardContent]',
  host: {
    class: 'block px-6 pb-6',
  },
})
export class CardContentDirective {}

@Directive({
  selector: '[zCardFooter]',
  host: {
    class: 'flex items-center gap-3 px-6 pb-6 pt-0',
  },
})
export class CardFooterDirective {}
