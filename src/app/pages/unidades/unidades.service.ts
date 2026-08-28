import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environments';
import {Estabelecimento, Unidade, UnidadeForm} from '../estabelecimentos/types/types';

@Injectable({
  providedIn: 'root',
})
export class UnidadesService {
  constructor(private readonly http: HttpClient) {}

  getUnidades(idEstabelecimento: string, busca = '') {
    const params = new HttpParams()
      .set('idEstabelecimento', idEstabelecimento)
      .set('busca', busca);

    return this.http.get<Unidade[]>(`${environment.apiUrl}/unidade`, { params });
  }

  registerUnidade(req: UnidadeForm) {
    return this.http.post(`${environment.apiUrl}/unidade`, req);
  }

  getEstabelecimento(idEstabelecimento: string) {
    return this.http.get<Estabelecimento>(`${environment.apiUrl}/estabelecimento/getEstabelecimentoById?idEstabelecimento=${idEstabelecimento}`);
  }
}
