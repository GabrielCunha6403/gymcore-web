import { ResolveFn, Routes } from '@angular/router';
import { ESTABELECIMENTOS_MOCK, UNIDADES_MOCK } from './pages/estabelecimentos/mocks/mocks';

export const estabelecimentoBreadcrumbResolver: ResolveFn<string> = (route) => {
  const estabelecimento = ESTABELECIMENTOS_MOCK.find((item) => item.id === route.paramMap.get('estabelecimentoId'));

  return estabelecimento?.nomeFantasia ?? 'Detalhes';
};

export const unidadeBreadcrumbResolver: ResolveFn<string> = (route) => {
  const unidade = UNIDADES_MOCK.find((item) => item.id === route.paramMap.get('unidadeId'));

  return unidade?.nome ?? 'Unidade';
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
    path: 'professores',
    data: { breadcrumb: 'Professores' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/professores/professores').then(m => m.Professores),
      },
      {
        path: 'register',
        data: { breadcrumb: 'Cadastrar professor' },
        loadComponent: () => import('./pages/professores/register/register').then(m => m.Register),
      },
    ],
  },
  {
    path: 'estabelecimentos/:estabelecimentoId',
    data: { breadcrumb: 'Detalhes' },
    resolve: { breadcrumb: estabelecimentoBreadcrumbResolver },
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/unidades/unidades').then(m => m.Unidades),
      },
      {
        path: ':unidadeId',
        resolve: { breadcrumb: unidadeBreadcrumbResolver },
        loadComponent: () => import('./pages/unidade-page/unidade-page').then(m => m.UnidadePage),
      },
    ],
  }
];
