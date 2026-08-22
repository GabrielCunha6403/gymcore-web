import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-top-menu',
  imports: [RouterLink],
  templateUrl: './top-menu.html',
  styleUrl: './top-menu.scss',
})
export class TopMenu {
  readonly searchPlaceholder = signal('Buscar alunos, treinos ou aulas');
  public searchValue = signal('');
  public isSideMenuOpen = signal(false);

  readonly loggedUser = {
    name: 'Gabriel Jataí',
    photoUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23F7D6FF"/><stop offset="100%" stop-color="%23B566FF"/></linearGradient></defs><rect width="80" height="80" rx="40" fill="url(%23g)"/><circle cx="40" cy="30" r="14" fill="%23FFF4FF"/><path d="M16 68c4-13 14-20 24-20s20 7 24 20" fill="%23FFF4FF"/></svg>',
  };

  protected readonly menuOptions = signal([
    {
      section: 'Geral',
      items: [{ label: 'Início', icon: 'pi pi-home', route: '/' }],
    },
    {
      section: 'Gestão',
      items: [
        { label: 'Estabelecimentos', icon: 'pi pi-shop', route: '/estabelecimentos' },
        { label: 'Professores', icon: 'pi pi-user', route: '/workouts' },
        { label: 'Alunos', icon: 'pi pi-users', route: '/workouts' },
        { label: 'Modalidades', icon: 'pi pi-tags', route: '/workouts' },
        { label: 'Planos', icon: 'pi pi-id-card', route: '/workouts' },
        { label: 'Matrículas', icon: 'pi pi-file-edit', route: '/workouts' },
      ],
    },
  ]);

  clearSearch(): void {
    this.searchValue.set('');
  }

  openSideMenu(): void {
    this.isSideMenuOpen.set(true);
  }

  closeSideMenu(): void {
    this.isSideMenuOpen.set(false);
  }
}
