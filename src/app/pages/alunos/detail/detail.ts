import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Breadcrumb } from '../../../components/breadcrumb/breadcrumb';
import { ToastService } from '../../../components/toast/toast.service';
import { AlunoTurmasService } from '../../aluno-turmas/aluno-turmas.service';
import { AlunoTurma, Turma } from '../../estabelecimentos/types/types';
import { AlunosService } from '../alunos.service';
import {
  Aluno,
  AlunoDetalheDto,
  AlunoStatus,
  FrequenciaListagemDto,
  MatriculaStatus,
  MensalidadeListagemDto,
  MensalidadeStatus,
} from '../types';

interface AlunoDetailExtra {
  dataNascimento: string;
  sexo: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  matricula: {
    unidade: string;
    plano: string;
    codigo: string;
    dataInicio: string;
    dataFim?: string;
    diaVencimento: number;
    status: MatriculaStatus;
    motivoCancelamento?: string;
  };
  mensalidades: {
    competencia: string;
    vencimento: string;
    valorTotal: string;
    status: string;
  }[];
  frequencias: {
    unidade: string;
    entrada: string;
    saida?: string;
  }[];
}

@Component({
  selector: 'app-aluno-detail',
  imports: [Breadcrumb, RouterLink],
  templateUrl: './detail.html',
  styleUrl: './detail.scss',
})
export class AlunoDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly alunosService = inject(AlunosService);
  private readonly alunoTurmasService = inject(AlunoTurmasService);
  private readonly toastService = inject(ToastService);
  private readonly idEstabelecimento = this.getRouteParam('idEstabelecimento');
  private readonly idUnidade = this.getRouteParam('idUnidade');
  private readonly idAluno = this.getRouteParam('idAluno');
  private idMatricula: string | null = null;

  protected readonly aluno = signal<Aluno | null>(null);
  protected readonly details = signal<AlunoDetailExtra | null>(null);

  protected readonly turmasDoAluno = signal<AlunoTurma[]>([]);
  protected readonly turmasDoAlunoLoading = signal(false);
  protected readonly turmasDisponiveis = signal<Turma[]>([]);
  protected readonly turmasDisponiveisLoading = signal(false);
  protected readonly matricularTurmaId = signal('');
  protected readonly matricularLoading = signal(false);
  protected readonly matricularError = signal('');

  protected readonly backLink = computed(() => (
    this.idEstabelecimento && this.idUnidade
      ? ['/estabelecimentos', this.idEstabelecimento, this.idUnidade]
      : ['/alunos']
  ));
  protected readonly backQueryParams = computed(() => (
    this.idEstabelecimento && this.idUnidade ? { tab: 'alunos' } : null
  ));

  protected readonly initials = computed(() => {
    const aluno = this.aluno();

    if (!aluno) {
      return 'AL';
    }

    return this.getInitials(aluno.nome);
  });

  protected readonly primaryUnit = computed(() => this.aluno()?.unidades[0] ?? null);

  ngOnInit(): void {
    if (!this.idAluno) {
      return;
    }

    forkJoin({
      aluno: this.alunosService.getAlunoById(this.idAluno),
      mensalidades: this.alunosService.getMensalidades(this.idAluno),
      frequencias: this.alunosService.getFrequencias(this.idAluno),
    }).subscribe(({ aluno, mensalidades, frequencias }) => {
      this.aluno.set(this.toAluno(aluno));
      this.details.set(this.toDetails(aluno, mensalidades, frequencias));

      if (aluno.matricula && aluno.matricula.status === 'ATIVA') {
        this.idMatricula = String(aluno.matricula.idMatricula);
        this.loadTurmasDoAluno();
        this.loadTurmasDisponiveis();
      }
    });
  }

  protected matricular(): void {
    const idTurma = this.matricularTurmaId();

    if (!this.idMatricula || !idTurma) {
      return;
    }

    this.matricularLoading.set(true);
    this.matricularError.set('');

    this.alunoTurmasService.matricular({ idMatricula: this.idMatricula, idTurma }).subscribe({
      next: () => {
        this.matricularLoading.set(false);
        this.matricularTurmaId.set('');
        this.toastService.success('Aluno inscrito na turma com sucesso!');
        this.loadTurmasDoAluno();
        this.loadTurmasDisponiveis();
      },
      error: (error) => {
        console.error('Erro ao inscrever aluno na turma', error);
        this.matricularError.set(error?.error?.message ?? 'Não foi possível inscrever o aluno na turma.');
        this.matricularLoading.set(false);
      },
    });
  }

  private loadTurmasDoAluno(): void {
    if (!this.idMatricula) {
      return;
    }

    this.turmasDoAlunoLoading.set(true);

    this.alunoTurmasService.getTurmasDaMatricula(this.idMatricula).subscribe({
      next: (res) => {
        this.turmasDoAluno.set(res);
        this.turmasDoAlunoLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar turmas do aluno', error);
        this.turmasDoAluno.set([]);
        this.turmasDoAlunoLoading.set(false);
      },
    });
  }

  private loadTurmasDisponiveis(): void {
    if (!this.idMatricula) {
      return;
    }

    this.turmasDisponiveisLoading.set(true);

    this.alunoTurmasService.getTurmasDisponiveis(this.idMatricula).subscribe({
      next: (res) => {
        this.turmasDisponiveis.set(res);
        this.turmasDisponiveisLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar turmas disponíveis', error);
        this.turmasDisponiveis.set([]);
        this.turmasDisponiveisLoading.set(false);
      },
    });
  }

  protected formatStatus(status: AlunoStatus): string {
    return status
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase());
  }

  protected formatMatriculaStatus(status: MatriculaStatus): string {
    return status
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase());
  }

  protected statusClass(status: AlunoStatus): string {
    if (status === 'INATIVO') {
      return 'teacher-status--inactive';
    }

    if (status === 'PENDENTE') {
      return 'teacher-status--away';
    }

    return 'teacher-status--active';
  }

  protected displayValue(value: string | undefined): string {
    return value?.trim() ? value : '-';
  }

  protected getInitials(name: string): string {
    const [firstWord = '', secondWord = ''] = name.trim().split(/\s+/);

    return `${firstWord.charAt(0)}${secondWord.charAt(0) || firstWord.charAt(1) || ''}`.toUpperCase();
  }

  private toAluno(dto: AlunoDetalheDto): Aluno {
    return {
      id: String(dto.idAluno),
      nome: dto.nome,
      cpf: dto.cpf,
      email: dto.email,
      contato: dto.contato,
      status: dto.ativo ? 'ATIVO' : 'INATIVO',
      unidades: dto.unidades.map((unidade) => ({
        estabelecimento: unidade.estabelecimento ?? '-',
        unidade: unidade.unidade,
      })),
      planoAtual: dto.matricula?.plano ?? '-',
      modalidades: dto.modalidades,
      matricula: {
        codigo: dto.matricula ? String(dto.matricula.idMatricula) : '-',
        dataInicio: dto.matricula?.dataInicio ?? '',
        vencimento: dto.matricula?.diaVencimento ?? 0,
        status: dto.matricula?.status ?? 'PENDENTE',
      },
    };
  }

  private toDetails(
    dto: AlunoDetalheDto,
    mensalidades: MensalidadeListagemDto[],
    frequencias: FrequenciaListagemDto[],
  ): AlunoDetailExtra {
    return {
      dataNascimento: this.formatDate(dto.dataNascimento),
      sexo: this.displayValue(dto.sexo ?? undefined),
      endereco: {
        cep: this.displayValue(dto.endereco?.cep),
        logradouro: this.displayValue(dto.endereco?.logradouro),
        numero: this.displayValue(dto.endereco?.numero),
        complemento: dto.endereco?.complemento,
        bairro: this.displayValue(dto.endereco?.bairro),
        cidade: this.displayValue(dto.endereco?.cidade),
        uf: this.displayValue(dto.endereco?.uf),
      },
      matricula: {
        unidade: this.displayValue(dto.matricula?.unidade),
        plano: this.displayValue(dto.matricula?.plano),
        codigo: dto.matricula ? String(dto.matricula.idMatricula) : '-',
        dataInicio: this.formatDate(dto.matricula?.dataInicio ?? null),
        dataFim: dto.matricula?.dataFim ? this.formatDate(dto.matricula.dataFim) : undefined,
        diaVencimento: dto.matricula?.diaVencimento ?? 0,
        status: dto.matricula?.status ?? 'PENDENTE',
        motivoCancelamento: dto.matricula?.motivoCancelamento ?? undefined,
      },
      mensalidades: mensalidades.map((item) => this.toMensalidade(item)),
      frequencias: frequencias.map((item) => this.toFrequencia(item)),
    };
  }

  private toMensalidade(dto: MensalidadeListagemDto): AlunoDetailExtra['mensalidades'][number] {
    return {
      competencia: this.formatCompetencia(dto.competencia),
      vencimento: this.formatDate(dto.dataVencimento),
      valorTotal: this.formatCurrency(dto.valorTotal),
      status: this.formatMensalidadeStatus(dto.status),
    };
  }

  private toFrequencia(dto: FrequenciaListagemDto): AlunoDetailExtra['frequencias'][number] {
    return {
      unidade: dto.unidade ?? '-',
      entrada: this.formatDateTime(dto.dataHoraEntrada),
      saida: dto.dataHoraSaida ? this.formatDateTime(dto.dataHoraSaida) : undefined,
    };
  }

  private formatDate(value: string | null): string {
    if (!value) {
      return '-';
    }

    const [ano, mes, dia] = value.split('-');

    return ano && mes && dia ? `${dia}/${mes}/${ano}` : value;
  }

  private formatCompetencia(value: string): string {
    const [ano, mes] = value.split('-');

    return ano && mes ? `${mes}/${ano}` : value;
  }

  private formatDateTime(value: string): string {
    const [datePart, timePart] = value.split('T');
    const [ano, mes, dia] = (datePart ?? '').split('-');
    const [hora = '00', minuto = '00'] = (timePart ?? '').split(':');

    return ano && mes && dia ? `${dia}/${mes}/${ano} ${hora}:${minuto}` : value;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  protected formatHorarios(turma: AlunoTurma | Turma): string {
    const abreviacoes: Record<number, string> = { 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb', 7: 'Dom' };

    if (!turma.horarios.length) {
      return 'Sem horários';
    }

    return turma.horarios
      .map((horario) => `${abreviacoes[horario.diaSemana] ?? horario.diaSemana} ${horario.horaInicio}-${horario.horaFim}`)
      .join(', ');
  }

  private formatMensalidadeStatus(status: MensalidadeStatus): string {
    return status
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase());
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
