import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environments';
import { AlunoTurma, AlunoTurmaForm, Turma } from '../estabelecimentos/types/types';

@Injectable({
  providedIn: 'root',
})
export class AlunoTurmasService {
  constructor(private readonly http: HttpClient) {}

  getTurmasDaMatricula(idMatricula: string) {
    const params = new HttpParams().set('idMatricula', idMatricula);

    return this.http.get<AlunoTurma[]>(`${environment.apiUrl}/aluno-turma`, { params });
  }

  getTurmasDisponiveis(idMatricula: string) {
    const params = new HttpParams().set('idMatricula', idMatricula);

    return this.http.get<Turma[]>(`${environment.apiUrl}/turma/disponiveis`, { params });
  }

  matricular(req: AlunoTurmaForm) {
    return this.http.post<{ message: string; alunoTurmaId: string }>(`${environment.apiUrl}/aluno-turma`, req);
  }
}
