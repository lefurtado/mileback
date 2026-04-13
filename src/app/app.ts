import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSun, lucideMoon } from '@ng-icons/lucide';

import { BadgeDirective } from '@/shared/components/ui/badge.directive';
import { ButtonDirective } from '@/shared/components/ui/button.directive';

interface NavItem {
  label: string;
  path: string;
  disabled?: boolean;
}

const THEME_STORAGE_KEY = 'mileback.theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIcon, ButtonDirective, BadgeDirective],
  providers: [provideIcons({ lucideSun, lucideMoon })],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);

  protected readonly navItems: NavItem[] = [
    { label: 'Super Cashback', path: '/super-cashback' },
    { label: 'Credit Card Fee', path: '/credit-card-fee', disabled: true },
    { label: 'Club Plan', path: '/club-plan', disabled: true },
  ];

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url || '/super-cashback'),
    ),
    { initialValue: this.router.url || '/super-cashback' },
  );

  protected readonly isDarkMode = signal(this.getInitialTheme());
  protected readonly activePath = computed(() => this.currentUrl().split('?')[0] || '/super-cashback');

  constructor() {
    effect(() => {
      const darkMode = this.isDarkMode();
      document.documentElement.classList.toggle('dark', darkMode);
      localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    });
  }

  protected isRouteActive(path: string): boolean {
    return this.activePath() === path;
  }

  protected toggleTheme(): void {
    this.isDarkMode.update((value) => !value);
  }

  protected handlePrimaryNav(event: Event, path: string): void {
    if (this.isRouteActive(path)) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private getInitialTheme(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'dark') {
      return true;
    }

    if (storedTheme === 'light') {
      return false;
    }

    if (typeof window.matchMedia !== 'function') {
      return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
