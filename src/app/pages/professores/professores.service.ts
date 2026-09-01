import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from '../../../environments/environments';
import {PageDto, ProfessorDetalheDto, ProfessorForm, ProfessorListagemDto} from './types/types';
import { Estabelecimento, Unidade } from '../estabelecimentos/types/types';

@Injectable({
  providedIn: 'root',
})

export class ProfessoresService {

  constructor(private http: HttpClient) { }

  getProfessores(busca = '') {
    const params = new HttpParams().set('busca', busca);

    return this.http.get<PageDto<ProfessorListagemDto>>(`${environment.apiUrl}/professor`, { params });
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

  getProfessorById(idProfessor: string) {
    return this.http.get<ProfessorDetalheDto>(`${environment.apiUrl}/professor/getProfessorById?idProfessor=${idProfessor}`);
  }

  getProfessoresPorUnidade(idUnidade: string) {
    const params = new HttpParams().set('idUnidade', idUnidade);

    return this.http.get<ProfessorListagemDto[]>(`${environment.apiUrl}/professor/porUnidade`, { params });
  }
}
