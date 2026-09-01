import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import { AlunosService } from './alunos.service';
import { Aluno, AlunoListagemDto, AlunoStatus, AlunoUnidade, MatriculaStatus } from './types';

@Component({
  selector: 'app-alunos',
  imports: [Breadcrumb, RouterLink],
  templateUrl: './alunos.html',
  styleUrl: './alunos.scss',
})
export class Alunos implements OnInit {
  private readonly alunosService = inject(AlunosService);

  readonly filteredAlunos = signal<Aluno[]>([]);
  readonly filterValue = signal('');

  ngOnInit(): void {
    this.getAlunos('');
  }

  getAlunos(busca: string): void {
    this.alunosService.getAlunos(busca).subscribe((res) => {
      this.filteredAlunos.set(res.content.map((item) => this.toAluno(item)));
    });
  }

  updateFilter(value: string): void {
    this.filterValue.set(value);
    this.getAlunos(value);
  }

  clearFilter(): void {
    this.filterValue.set('');
    this.getAlunos('');
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
    return unidade.estabelecimento ? `${unidade.unidade} - ${unidade.estabelecimento}` : unidade.unidade;
  }

  hiddenCount(values: unknown[]): number {
    return Math.max(values.length - 1, 0);
  }

  private toAluno(dto: AlunoListagemDto): Aluno {
    const matricula = dto.matricula;

    return {
      id: String(dto.idAluno),
      nome: dto.nome,
      cpf: dto.cpf,
      email: dto.email,
      contato: dto.contato,
      status: dto.ativo ? 'ATIVO' : 'INATIVO',
      unidades: dto.unidades.map((unidade) => ({ estabelecimento: '', unidade })),
      planoAtual: dto.planoAtual ?? '-',
      modalidades: dto.modalidades,
      matricula: {
        codigo: matricula ? String(matricula.idMatricula) : '-',
        dataInicio: matricula?.dataInicio ?? '',
        vencimento: matricula?.diaVencimento ?? 0,
        status: matricula?.status ?? 'PENDENTE',
      },
    };
  }
}
