import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import { ALUNOS_MOCK } from './mocks';
import { Aluno, AlunoStatus, AlunoUnidade, MatriculaStatus } from './types';

@Component({
  selector: 'app-alunos',
  imports: [Breadcrumb, RouterLink],
  templateUrl: './alunos.html',
  styleUrl: './alunos.scss',
})
export class Alunos {
  readonly alunos = signal<Aluno[]>(ALUNOS_MOCK);
  readonly filterValue = signal('');
  readonly filteredAlunos = computed(() => {
    const normalizedFilter = this.normalizeValue(this.filterValue());

    if (!normalizedFilter) {
      return this.alunos();
    }

    return this.alunos().filter((aluno) => {
      const searchableValues = [
        aluno.nome,
        aluno.cpf,
        aluno.email,
        aluno.contato,
        aluno.planoAtual,
        aluno.matricula.codigo,
        this.formatStatus(aluno.status),
        this.formatMatriculaStatus(aluno.matricula.status),
        ...aluno.unidades.flatMap((item) => [item.estabelecimento, item.unidade]),
        ...aluno.modalidades,
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

  initials(aluno: Aluno): string {
    const [firstWord = '', secondWord = ''] = aluno.nome.trim().split(/\s+/);

    return `${firstWord.charAt(0)}${secondWord.charAt(0) || firstWord.charAt(1) || ''}`.toUpperCase();
  }

  formatStatus(status: AlunoStatus): string {
    return status
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase());
  }

  formatMatriculaStatus(status: MatriculaStatus): string {
    return status
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase());
  }

  unitLabel(unidade: AlunoUnidade): string {
    return `${unidade.unidade} - ${unidade.estabelecimento}`;
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
