import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environments';
import { PlanoUnidade, PlanoUnidadeForm } from '../estabelecimentos/types/types';

@Injectable({
  providedIn: 'root',
})
export class UnidadePlanosService {
  constructor(private readonly http: HttpClient) {}

  getPlanosVinculados(idUnidade: string) {
    const params = new HttpParams().set('idUnidade', idUnidade);

    return this.http.get<PlanoUnidade[]>(`${environment.apiUrl}/plano-unidade`, { params });
  }

  vincularPlano(req: PlanoUnidadeForm) {
    return this.http.post<{ message: string; planoUnidadeId: string }>(`${environment.apiUrl}/plano-unidade`, req);
  }
}
