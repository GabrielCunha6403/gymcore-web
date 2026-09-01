import { ResolveFn, Routes } from '@angular/router';
import { ESTABELECIMENTOS_MOCK, UNIDADES_MOCK } from './pages/estabelecimentos/mocks/mocks';
import { PROFESSORES_MOCK } from './pages/professores/mocks';

export const estabelecimentoBreadcrumbResolver: ResolveFn<string> = (route) => {
  return `Estabelecimento ${route.paramMap.get('idEstabelecimento')}`;
};

export const unidadeBreadcrumbResolver: ResolveFn<string> = (route) => {
  return `Unidade ${route.paramMap.get('idUnidade')}`;
};

export const professorBreadcrumbResolver: ResolveFn<string> = (route) => {
  return `Professor ${route.paramMap.get('idProfessor')}`;
};

export const alunoBreadcrumbResolver: ResolveFn<string> = (route) => {
  return `Aluno ${route.paramMap.get('idAluno')}`;
};

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    data: { breadcrumb: 'Início' },
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'estabelecimentos',
    data: { breadcrumb: 'Estabelecimentos' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/estabelecimentos/estabelecimentos').then((m) => m.Estabelecimentos),
      },
      {
        path: 'register',
        data: { breadcrumb: 'Cadastrar estabelecimento' },
        loadComponent: () => import('./pages/estabelecimentos/register/register').then((m) => m.EstabelecimentoRegister),
      },
      {
        path: ':idEstabelecimento',
        data: { breadcrumb: 'Estabelecimento' },
        resolve: { breadcrumb: estabelecimentoBreadcrumbResolver },
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () => import('./pages/unidades/unidades').then((m) => m.Unidades),
          },
          {
            path: 'register',
            data: { breadcrumb: 'Cadastrar unidade' },
            loadComponent: () => import('./pages/unidades/register/register').then((m) => m.UnidadeRegister),
          },
          {
            path: 'modalidades/register',
            data: { breadcrumb: 'Cadastrar modalidade' },
            loadComponent: () => import('./pages/modalidades/register/register').then((m) => m.ModalidadeRegister),
          },
          {
            path: ':idUnidade',
            resolve: { breadcrumb: unidadeBreadcrumbResolver },
            children: [
              {
                path: '',
                pathMatch: 'full',
                loadComponent: () => import('./pages/unidade-page/unidade-page').then((m) => m.UnidadePage),
              },
              {
                path: 'professor/register',
                data: { breadcrumb: 'Cadastrar professor' },
                loadComponent: () => import('./pages/professores/register/register').then((m) => m.Register),
              },
              {
                path: 'professor/:idProfessor',
                data: { breadcrumb: 'Detalhes' },
                resolve: { breadcrumb: professorBreadcrumbResolver },
                loadComponent: () => import('./pages/professores/detail/detail').then((m) => m.Detail),
              },
              {
                path: 'aluno/register',
                data: { breadcrumb: 'Cadastrar aluno' },
                loadComponent: () => import('./pages/alunos/register/register').then((m) => m.AlunoRegister),
              },
              {
                path: 'aluno/:idAluno',
                data: { breadcrumb: 'Detalhes' },
                resolve: { breadcrumb: alunoBreadcrumbResolver },
                loadComponent: () => import('./pages/alunos/detail/detail').then((m) => m.AlunoDetail),
              },
              {
                path: 'modalidades/vincular',
                data: { breadcrumb: 'Vincular modalidade' },
                loadComponent: () => import('./pages/unidade-modalidades/register/register').then((m) => m.UnidadeModalidadeRegister),
              },
              {
                path: 'planos/register',
                data: { breadcrumb: 'Cadastrar plano' },
                loadComponent: () => import('./pages/unidade-planos/register/register').then((m) => m.PlanoRegister),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: 'professores',
    data: { breadcrumb: 'Professores' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/professores/professores').then((m) => m.Professores),
      },
      {
        path: 'register',
        data: { breadcrumb: 'Cadastrar professor' },
        loadComponent: () => import('./pages/professores/register/register').then((m) => m.Register),
      },
      {
        path: ':idProfessor',
        data: { breadcrumb: 'Detalhes' },
        resolve: { breadcrumb: professorBreadcrumbResolver },
        loadComponent: () => import('./pages/professores/detail/detail').then((m) => m.Detail),
      },
    ],
  },
  {
    path: 'alunos',
    data: { breadcrumb: 'Alunos' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/alunos/alunos').then((m) => m.Alunos),
      },
      {
        path: 'register',
        data: { breadcrumb: 'Cadastrar aluno' },
        loadComponent: () => import('./pages/alunos/register/register').then((m) => m.AlunoRegister),
      },
      {
        path: ':idAluno',
        data: { breadcrumb: 'Detalhes' },
        resolve: { breadcrumb: alunoBreadcrumbResolver },
        loadComponent: () => import('./pages/alunos/detail/detail').then((m) => m.AlunoDetail),
      },
    ],
  },
];
