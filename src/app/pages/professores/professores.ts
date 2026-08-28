import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import { PROFESSORES_MOCK } from './mocks';
import { Professor, ProfessorStatus, ProfessorUnidade } from './types/types';

@Component({
  selector: 'app-professores',
  imports: [Breadcrumb, RouterLink],
  templateUrl: './professores.html',
  styleUrl: './professores.scss',
})
export class Professores {
  readonly professores = signal<Professor[]>(PROFESSORES_MOCK);
  readonly filterValue = signal('');
  readonly filteredProfessores = computed(() => {
    const normalizedFilter = this.normalizeValue(this.filterValue());

    if (!normalizedFilter) {
      return this.professores();
    }

    return this.professores().filter((professor) => {
      const searchableValues = [
        professor.nome,
        professor.cpf,
        professor.email,
        professor.contato,
        this.formatStatus(professor.status),
        ...professor.unidades.flatMap((item) => [item.estabelecimento, item.unidade]),
        ...professor.modalidades,
      ];

      return searchableValues.some((value) => this.normalizeValue(value).includes(normalizedFilter));
    });
  });

  updateFilter(value: string): void {
    this.filterValue.set(value);
  }

  clearFilter(): void {
    this.filterValue.set('');
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

  private normalizeValue(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
