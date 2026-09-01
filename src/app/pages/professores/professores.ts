import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import { ProfessoresService } from './professores.service';
import { Professor, ProfessorListagemDto, ProfessorStatus } from './types/types';

@Component({
  selector: 'app-professores',
  imports: [Breadcrumb, RouterLink],
  templateUrl: './professores.html',
  styleUrl: './professores.scss',
})
export class Professores implements OnInit {
  private readonly professoresService = inject(ProfessoresService);

  readonly filteredProfessores = signal<Professor[]>([]);
  readonly filterValue = signal('');

  ngOnInit(): void {
    this.getProfessores('');
  }

  getProfessores(busca: string): void {
    this.professoresService.getProfessores(busca).subscribe((res) => {
      this.filteredProfessores.set(res.content.map((item) => this.toProfessor(item)));
    });
  }

  updateFilter(value: string): void {
    this.filterValue.set(value);
    this.getProfessores(value);
  }

  clearFilter(): void {
    this.filterValue.set('');
    this.getProfessores('');
  }

  initials(professor: Professor): string {
    const [firstWord = '', secondWord = ''] = professor.nome.trim().split(/\s+/);

    return `${firstWord.charAt(0)}${secondWord.charAt(0) || firstWord.charAt(1) || ''}`.toUpperCase();
  }

  formatStatus(status: ProfessorStatus): string {
    return status
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase());
  }

  hiddenCount(values: unknown[]): number {
    return Math.max(values.length - 1, 0);
  }

  private toProfessor(dto: ProfessorListagemDto): Professor {
    return {
      id: String(dto.idProfessor),
      nome: dto.nome,
      cpf: dto.cpf,
      email: dto.email,
      contato: dto.contato,
      status: dto.status,
      unidades: dto.unidades.map((unidade) => ({ estabelecimento: '', unidade })),
      modalidades: dto.modalidades,
    };
  }
}
