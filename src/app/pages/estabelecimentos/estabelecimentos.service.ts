import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environments';
import { Estabelecimento, EstabelecimentoForm } from './types/types';

@Injectable({
  providedIn: 'root',
})
export class EstabelecimentosService {
  constructor(private readonly http: HttpClient) {}

  getEstabelecimentos(busca = '') {
    const params = new HttpParams().set('busca', busca);

    return this.http.get<Estabelecimento[]>(`${environment.apiUrl}/estabelecimento`, { params });
  }

  registerEstabelecimento(req: EstabelecimentoForm) {
    return this.http.post(`${environment.apiUrl}/estabelecimento`, req);
  }

  getEstabelecimentoById(idEstabelecimento: string) {
    return this.http.get<Estabelecimento>(`${environment.apiUrl}/estabelecimento/getEstabelecimentoById?idEstabelecimento=${idEstabelecimento}`);
  }

  updateEstabelecimento(idEstabelecimento: string, req: EstabelecimentoForm) {
    return this.http.put<{ message: string }>(`${environment.apiUrl}/estabelecimento?idEstabelecimento=${idEstabelecimento}`, req);
  }
}
