import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environments';
import { Plano, PlanoForm } from '../estabelecimentos/types/types';

@Injectable({
  providedIn: 'root',
})
export class PlanosService {
  constructor(private readonly http: HttpClient) {}

  getPlanos(idEstabelecimento: string, busca = '') {
    const params = new HttpParams()
      .set('idEstabelecimento', idEstabelecimento)
      .set('busca', busca);

    return this.http.get<Plano[]>(`${environment.apiUrl}/plano`, { params });
  }

  getPlanoById(idPlano: string) {
    return this.http.get<Plano>(`${environment.apiUrl}/plano/getPlanoById?idPlano=${idPlano}`);
  }

  registerPlano(req: PlanoForm) {
    return this.http.post<{ message: string; planoId: string }>(`${environment.apiUrl}/plano`, req);
  }
}
