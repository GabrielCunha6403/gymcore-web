import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environments';
import { Turma, TurmaAluno, TurmaForm } from '../estabelecimentos/types/types';

@Injectable({
  providedIn: 'root',
})
export class UnidadeTurmasService {
  constructor(private readonly http: HttpClient) {}

  getTurmas(idUnidade: string) {
    const params = new HttpParams().set('idUnidade', idUnidade);

    return this.http.get<Turma[]>(`${environment.apiUrl}/turma`, { params });
  }

  getTurmaById(idTurma: string) {
    return this.http.get<Turma>(`${environment.apiUrl}/turma/getTurmaById?idTurma=${idTurma}`);
  }

  getAlunosDaTurma(idTurma: string) {
    const params = new HttpParams().set('idTurma', idTurma);

    return this.http.get<TurmaAluno[]>(`${environment.apiUrl}/turma/alunos`, { params });
  }

  registerTurma(req: TurmaForm) {
    return this.http.post<{ message: string; turmaId: string }>(`${environment.apiUrl}/turma`, req);
  }
}
