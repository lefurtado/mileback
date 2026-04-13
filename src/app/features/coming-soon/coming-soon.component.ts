import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  CardContentDirective,
  CardDescriptionDirective,
  CardDirective,
  CardHeaderDirective,
  CardTitleDirective,
} from '@/shared/components/ui/card.directive';
import { ButtonDirective } from '@/shared/components/ui/button.directive';

@Component({
  selector: 'app-coming-soon',
  imports: [
    RouterLink,
    CardDirective,
    CardHeaderDirective,
    CardTitleDirective,
    CardDescriptionDirective,
    CardContentDirective,
    ButtonDirective,
  ],
  template: `
    <section class="mx-auto flex min-h-[calc(100dvh-88px)] max-w-4xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div zCard class="w-full">
        <div zCardHeader>
          <p class="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Mileback</p>
          <h1 zCardTitle>{{ title }}</h1>
          <p zCardDescription>
            Esta calculadora já tem rota pública, mas a experiência ainda está em construção.
          </p>
        </div>

        <div zCardContent class="space-y-6">
          <div class="rounded-2xl border border-dashed border-border bg-muted/35 p-5 text-sm text-muted-foreground">
            Em breve você poderá abrir esta tela diretamente e compartilhar o link como qualquer outra
            calculadora do Mileback.
          </div>

          <a zButton variant="accent" routerLink="/super-cashback">
            Ir para Super Cashback
          </a>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComingSoonComponent {
  protected readonly title =
    inject(ActivatedRoute).snapshot.data['title'] ?? 'Calculadora em breve';
}
