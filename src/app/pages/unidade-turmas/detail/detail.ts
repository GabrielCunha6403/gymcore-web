import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Breadcrumb } from '../../../components/breadcrumb/breadcrumb';
import { Turma, TurmaAluno } from '../../estabelecimentos/types/types';
import { UnidadeTurmasService } from '../unidade-turmas.service';

const DIA_SEMANA_LABELS: Record<number, string> = {
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
  7: 'Dom',
};

@Component({
  selector: 'app-turma-detail',
  imports: [Breadcrumb, RouterLink],
  templateUrl: './detail.html',
  styleUrl: './detail.scss',
})
export class TurmaDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly unidadeTurmasService = inject(UnidadeTurmasService);
  private readonly idEstabelecimento = this.getRouteParam('idEstabelecimento');
  private readonly idUnidade = this.getRouteParam('idUnidade');
  private readonly idTurma = this.getRouteParam('idTurma');

  protected readonly turma = signal<Turma | null>(null);
  protected readonly alunos = signal<TurmaAluno[]>([]);
  protected readonly alunosLoading = signal(true);

  protected readonly backLink = computed(() => (
    this.idEstabelecimento && this.idUnidade
      ? ['/estabelecimentos', this.idEstabelecimento, this.idUnidade]
      : ['/']
  ));

  ngOnInit(): void {
    if (!this.idTurma) {
      return;
    }

    this.unidadeTurmasService.getTurmaById(this.idTurma).subscribe({
      next: (res) => this.turma.set(res),
      error: (error) => console.error('Erro ao buscar turma', error),
    });

    this.unidadeTurmasService.getAlunosDaTurma(this.idTurma).subscribe({
      next: (res) => {
        this.alunos.set(res);
        this.alunosLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar alunos da turma', error);
        this.alunos.set([]);
        this.alunosLoading.set(false);
      },
    });
  }

  protected formatDate(value: string | undefined): string {
    if (!value) {
      return '-';
    }

    const [ano, mes, dia] = value.split('-');

    return ano && mes && dia ? `${dia}/${mes}/${ano}` : value;
  }

  protected displayHorarios(turma: Turma): string {
    if (!turma.horarios.length) {
      return 'Sem horários cadastrados';
    }

    return turma.horarios
      .map((horario) => `${DIA_SEMANA_LABELS[horario.diaSemana] ?? horario.diaSemana} ${horario.horaInicio}-${horario.horaFim}`)
      .join(', ');
  }

  private getRouteParam(paramName: string): string {
    for (const routeSnapshot of this.route.snapshot.pathFromRoot) {
      const value = routeSnapshot.paramMap.get(paramName);

      if (value) {
        return value;
      }
    }

    return '';
  }
}
