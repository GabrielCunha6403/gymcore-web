import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from '../../../environments/environments';
import {ProfessorForm} from './types/types';
import { Estabelecimento, Unidade } from '../estabelecimentos/types/types';

@Injectable({
  providedIn: 'root',
})

export class ProfessoresService {

  constructor(private http: HttpClient) { }

  getProfessores() {
    return this.http.get(`${environment.apiUrl}/professor`);
  }

  getEstabelecimentos(busca: string) {
    const params = new HttpParams().set('busca', busca);

    return this.http.get<Estabelecimento[]>(`${environment.apiUrl}/estabelecimento`, { params });
  }

  getUnidades(idEstabelecimento: string, busca: string) {
    const params = new HttpParams()
      .set('idEstabelecimento', idEstabelecimento)
      .set('busca', busca);

    return this.http.get<Unidade[]>(`${environment.apiUrl}/unidade`, { params });
  }

  registerProfessor(req: ProfessorForm) {
    return this.http.post(`${environment.apiUrl}/professor`, req);
  }
}
