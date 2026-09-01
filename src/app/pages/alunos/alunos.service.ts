import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environments';
import {
  AlunoDetalheDto,
  AlunoForm,
  AlunoListagemDto,
  FrequenciaListagemDto,
  MensalidadeListagemDto,
  PageDto,
} from './types';

@Injectable({
  providedIn: 'root',
})
export class AlunosService {
  constructor(private readonly http: HttpClient) {}

  getAlunos(busca = '') {
    const params = new HttpParams().set('busca', busca);

    return this.http.get<PageDto<AlunoListagemDto>>(`${environment.apiUrl}/aluno`, { params });
  }

  getAlunoById(idAluno: string) {
    return this.http.get<AlunoDetalheDto>(`${environment.apiUrl}/aluno/getAlunoById?idAluno=${idAluno}`);
  }

  getAlunosPorUnidade(idUnidade: string) {
    const params = new HttpParams().set('idUnidade', idUnidade);

    return this.http.get<AlunoListagemDto[]>(`${environment.apiUrl}/aluno/porUnidade`, { params });
  }

  registerAluno(req: AlunoForm) {
    return this.http.post<{ message: string; alunoId: string }>(`${environment.apiUrl}/aluno`, req);
  }

  getMensalidades(idAluno: string) {
    const params = new HttpParams().set('idAluno', idAluno);

    return this.http.get<MensalidadeListagemDto[]>(`${environment.apiUrl}/mensalidade`, { params });
  }

  getFrequencias(idAluno: string) {
    const params = new HttpParams().set('idAluno', idAluno);

    return this.http.get<FrequenciaListagemDto[]>(`${environment.apiUrl}/frequencia`, { params });
  }
}
