import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { UnidadesService } from './pages/unidades/unidades.service';
import { ProfessoresService } from './pages/professores/professores.service';
import { AlunosService } from './pages/alunos/alunos.service';

export const estabelecimentoBreadcrumbResolver: ResolveFn<string> = (route) => {
  const idEstabelecimento = route.paramMap.get('idEstabelecimento') ?? '';

  return inject(UnidadesService).getEstabelecimento(idEstabelecimento).pipe(
    map((estabelecimento) => estabelecimento.nomeFantasia),
    catchError(() => of(`Estabelecimento ${idEstabelecimento}`)),
  );
};

export const unidadeBreadcrumbResolver: ResolveFn<string> = (route) => {
  const idUnidade = route.paramMap.get('idUnidade') ?? '';

  return inject(UnidadesService).getUnidadeById(idUnidade).pipe(
    map((unidade) => unidade.nome),
    catchError(() => of(`Unidade ${idUnidade}`)),
  );
};

export const professorBreadcrumbResolver: ResolveFn<string> = (route) => {
  const idProfessor = route.paramMap.get('idProfessor') ?? '';

  return inject(ProfessoresService).getProfessorById(idProfessor).pipe(
    map((professor) => professor.nome),
    catchError(() => of(`Professor ${idProfessor}`)),
  );
};

export const alunoBreadcrumbResolver: ResolveFn<string> = (route) => {
  const idAluno = route.paramMap.get('idAluno') ?? '';

  return inject(AlunosService).getAlunoById(idAluno).pipe(
    map((aluno) => aluno.nome),
    catchError(() => of(`Aluno ${idAluno}`)),
  );
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
            path: 'edit',
            data: { breadcrumb: 'Editar estabelecimento' },
            loadComponent: () => import('./pages/estabelecimentos/register/register').then((m) => m.EstabelecimentoRegister),
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
                path: 'edit',
                data: { breadcrumb: 'Editar unidade' },
                loadComponent: () => import('./pages/unidades/register/register').then((m) => m.UnidadeRegister),
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
                path: 'professor/:idProfessor/edit',
                data: { breadcrumb: 'Editar professor' },
                loadComponent: () => import('./pages/professores/register/register').then((m) => m.Register),
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
                path: 'aluno/:idAluno/edit',
                data: { breadcrumb: 'Editar aluno' },
                loadComponent: () => import('./pages/alunos/register/register').then((m) => m.AlunoRegister),
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
              {
                path: 'planos/edit/:idPlanoUnidade',
                data: { breadcrumb: 'Editar oferta de plano' },
                loadComponent: () => import('./pages/unidade-planos/register/register').then((m) => m.PlanoRegister),
              },
              {
                path: 'turmas/register',
                data: { breadcrumb: 'Cadastrar turma' },
                loadComponent: () => import('./pages/unidade-turmas/register/register').then((m) => m.TurmaRegister),
              },
              {
                path: 'turma/:idTurma',
                data: { breadcrumb: 'Turma' },
                loadComponent: () => import('./pages/unidade-turmas/detail/detail').then((m) => m.TurmaDetail),
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
      {
        path: ':idProfessor/edit',
        data: { breadcrumb: 'Editar professor' },
        loadComponent: () => import('./pages/professores/register/register').then((m) => m.Register),
      },
    ],
  },
  {
    path: 'modalidades',
    data: { breadcrumb: 'Modalidades' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/modalidades/modalidades').then((m) => m.Modalidades),
      },
      {
        path: 'register',
        data: { breadcrumb: 'Cadastrar modalidade' },
        loadComponent: () => import('./pages/modalidades/register/register').then((m) => m.ModalidadeRegister),
      },
      {
        path: 'edit/:idModalidade',
        data: { breadcrumb: 'Editar modalidade' },
        loadComponent: () => import('./pages/modalidades/register/register').then((m) => m.ModalidadeRegister),
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
      {
        path: ':idAluno/edit',
        data: { breadcrumb: 'Editar aluno' },
        loadComponent: () => import('./pages/alunos/register/register').then((m) => m.AlunoRegister),
      },
    ],
  },
  {
    path: 'planos',
    data: { breadcrumb: 'Planos' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/planos/planos').then((m) => m.Planos),
      },
      {
        path: 'register',
        data: { breadcrumb: 'Cadastrar plano' },
        loadComponent: () => import('./pages/planos/register/register').then((m) => m.PlanoGeralRegister),
      },
      {
        path: 'edit/:idPlanoUnidade',
        data: { breadcrumb: 'Editar oferta de plano' },
        loadComponent: () => import('./pages/unidade-planos/register/register').then((m) => m.PlanoRegister),
      },
    ],
  },
];
