import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environments';
import { UnidadeHorarioFuncionamento, UnidadeHorarioFuncionamentoForm } from '../estabelecimentos/types/types';

@Injectable({
  providedIn: 'root',
})
export class UnidadeHorarioFuncionamentoService {
  constructor(private readonly http: HttpClient) {}

  getHorarios(idUnidade: string) {
    const params = new HttpParams().set('idUnidade', idUnidade);

    return this.http.get<UnidadeHorarioFuncionamento[]>(`${environment.apiUrl}/unidade-horario-funcionamento`, { params });
  }

  salvar(req: UnidadeHorarioFuncionamentoForm) {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/unidade-horario-funcionamento`, req);
  }
}
