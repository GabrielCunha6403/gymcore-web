import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environments';
import { Estabelecimento, Modalidade, ModalidadeForm } from '../estabelecimentos/types/types';

@Injectable({
  providedIn: 'root',
})
export class ModalidadesService {
  constructor(private readonly http: HttpClient) {}

  getModalidades(idEstabelecimento: string, busca = '') {
    const params = new HttpParams()
      .set('idEstabelecimento', idEstabelecimento)
      .set('busca', busca);

    return this.http.get<Modalidade[]>(`${environment.apiUrl}/modalidade`, { params });
  }

  registerModalidade(req: ModalidadeForm) {
    return this.http.post(`${environment.apiUrl}/modalidade`, req);
  }

  getEstabelecimento(idEstabelecimento: string) {
    return this.http.get<Estabelecimento>(`${environment.apiUrl}/estabelecimento/getEstabelecimentoById?idEstabelecimento=${idEstabelecimento}`);
  }
}
