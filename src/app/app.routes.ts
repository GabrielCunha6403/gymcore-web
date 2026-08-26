import { ResolveFn, Routes } from '@angular/router';
import { ALUNOS_MOCK } from './pages/alunos/mocks';
import { ESTABELECIMENTOS_MOCK, UNIDADES_MOCK } from './pages/estabelecimentos/mocks/mocks';
import { PROFESSORES_MOCK } from './pages/professores/mocks';

export const estabelecimentoBreadcrumbResolver: ResolveFn<string> = (route) => {
  const estabelecimento = ESTABELECIMENTOS_MOCK.find((item) => item.id === route.paramMap.get('idEstabelecimento'));

  return estabelecimento?.nomeFantasia ?? 'Detalhes';
};

export const unidadeBreadcrumbResolver: ResolveFn<string> = (route) => {
  const unidade = UNIDADES_MOCK.find((item) => item.id === route.paramMap.get('idUnidade'));

  return unidade?.nome ?? 'Unidade';
};

export const professorBreadcrumbResolver: ResolveFn<string> = (route) => {
  const professor = PROFESSORES_MOCK.find((item) => item.id === route.paramMap.get('idProfessor'));

  return professor?.nome ?? 'Professor';
};

export const alunoBreadcrumbResolver: ResolveFn<string> = (route) => {
  const aluno = ALUNOS_MOCK.find((item) => item.id === route.paramMap.get('idAluno'));

  return aluno?.nome ?? 'Aluno';
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
    loadComponent: () => import('./pages/estabelecimentos/estabelecimentos').then((m) => m.Estabelecimentos),
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
  {
    path: 'estabelecimentos/:idEstabelecimento',
    data: { breadcrumb: 'Detalhes' },
    resolve: { breadcrumb: estabelecimentoBreadcrumbResolver },
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/unidades/unidades').then((m) => m.Unidades),
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
            path: 'professor/:idProfessor',
            data: { breadcrumb: 'Detalhes' },
            resolve: { breadcrumb: professorBreadcrumbResolver },
            loadComponent: () => import('./pages/professores/detail/detail').then((m) => m.Detail),
          },
          {
            path: 'aluno/:idAluno',
            data: { breadcrumb: 'Detalhes' },
            resolve: { breadcrumb: alunoBreadcrumbResolver },
            loadComponent: () => import('./pages/alunos/detail/detail').then((m) => m.AlunoDetail),
          },
        ],
      },
    ],
  },
];
