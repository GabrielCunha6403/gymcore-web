import { ResolveFn, Routes } from '@angular/router';
import { ESTABELECIMENTOS_MOCK } from './pages/estabelecimentos/mocks/mocks';

export const estabelecimentoBreadcrumbResolver: ResolveFn<string> = (route) => {
  const estabelecimento = ESTABELECIMENTOS_MOCK.find((item) => item.id === route.paramMap.get('id'));

  return estabelecimento?.nomeFantasia ?? 'Detalhes';
};

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    data: { breadcrumb: 'Início' },
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
  },
  {
    path: 'estabelecimentos',
    data: { breadcrumb: 'Estabelecimentos' },
    loadComponent: () => import('./pages/estabelecimentos/estabelecimentos').then(m => m.Estabelecimentos),
  },
  {
    path: 'estabelecimentos/:id',
    data: { breadcrumb: 'Detalhes' },
    resolve: { breadcrumb: estabelecimentoBreadcrumbResolver },
    loadComponent: () => import('./pages/estabelecimentos/detail/detail').then(m => m.Detail),
  }
];
