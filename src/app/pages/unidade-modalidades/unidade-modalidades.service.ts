import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environments';
import { UnidadeModalidade, UnidadeModalidadeForm } from '../estabelecimentos/types/types';

@Injectable({
  providedIn: 'root',
})
export class UnidadeModalidadesService {
  constructor(private readonly http: HttpClient) {}

  getModalidadesVinculadas(idUnidade: string) {
    const params = new HttpParams().set('idUnidade', idUnidade);

    return this.http.get<UnidadeModalidade[]>(`${environment.apiUrl}/unidade-modalidade`, { params });
  }

  vincularModalidade(req: UnidadeModalidadeForm) {
    return this.http.post(`${environment.apiUrl}/unidade-modalidade`, req);
  }

  updateUnidadeModalidade(idUnidadeModalidade: string, req: UnidadeModalidadeForm) {
    return this.http.put<{ message: string }>(`${environment.apiUrl}/unidade-modalidade?idUnidadeModalidade=${idUnidadeModalidade}`, req);
  }

  inativarUnidadeModalidade(idUnidadeModalidade: string) {
    return this.http.put<{ message: string }>(`${environment.apiUrl}/unidade-modalidade/inativar?idUnidadeModalidade=${idUnidadeModalidade}`, {});
  }
}
