import {Component, computed, inject, OnInit, signal} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import {
  Estabelecimento,
  StatusEstabelecimento,
  TipoCobranca,
  TipoEstabelecimento,
  Unidade,
  UnidadeHorarioFuncionamento,
  UnidadeModalidade,
  PlanoUnidade,
} from '../estabelecimentos/types/types';
import { UnidadeHorarioFuncionamentoService } from '../unidade-horario-funcionamento/unidade-horario-funcionamento.service';
import { UnidadeModalidadesService } from '../unidade-modalidades/unidade-modalidades.service';
import { UnidadePlanosService } from '../unidade-planos/unidade-planos.service';
import {UnidadesService} from '../unidades/unidades.service';
import { ProfessoresService } from '../professores/professores.service';
import { ProfessorListagemDto } from '../professores/types/types';
import { AlunosService } from '../alunos/alunos.service';
import { AlunoListagemDto } from '../alunos/types';

const DIAS_ORDENADOS = [1, 2, 3, 4, 5, 6, 7];

const DIA_SEMANA_LABELS: Record<number, string> = {
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
  7: 'Domingo',
};

type UnidadeTabId = 'professores' | 'alunos' | 'modalidades' | 'planos';

interface UnidadeTab {
  id: UnidadeTabId;
  label: string;
  icon: string;
}

interface TabMetric {
  label: string;
  value: string;
  icon: string;
}

interface TabItem {
  id?: string;
  title: string;
  subtitle: string;
  meta: string;
  status: string;
  photoUrl?: string;
}

interface TabContent {
  title: string;
  createLabel: string;
  entityLabel: string;
  metrics: TabMetric[];
  items: TabItem[];
}

@Component({
  selector: 'app-unidade-page',
  imports: [
    Breadcrumb,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './unidade-page.html',
  styleUrl: './unidade-page.scss',
})
export class UnidadePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly unidadesService = inject(UnidadesService);
  private readonly unidadeModalidadesService = inject(UnidadeModalidadesService);
  private readonly unidadePlanosService = inject(UnidadePlanosService);
  private readonly unidadeHorarioFuncionamentoService = inject(UnidadeHorarioFuncionamentoService);
  private readonly professoresService = inject(ProfessoresService);
  private readonly alunosService = inject(AlunosService);
  readonly idEstabelecimento = this.getRouteParam('idEstabelecimento');
  readonly idUnidade = this.getRouteParam('idUnidade');

  readonly activeTab = signal<UnidadeTabId>('professores');
  readonly tabs: UnidadeTab[] = [
    { id: 'professores', label: 'Professores', icon: 'pi-users' },
    { id: 'alunos', label: 'Alunos', icon: 'pi-user' },
    { id: 'modalidades', label: 'Modalidades', icon: 'pi-tags' },
    { id: 'planos', label: 'Planos', icon: 'pi-credit-card' },
  ];

  readonly estabelecimento = signal<Estabelecimento | null>(null)
  readonly unidade = signal<Unidade | null>(null)
  readonly unidadeInitials = computed(() => {
    const unidade = this.unidade();

    if (!unidade) {
      return 'ND';
    }

    const [firstWord = '', secondWord = ''] = unidade.nome.trim().split(/\s+/);

    return `${firstWord.charAt(0)}${secondWord.charAt(0) || firstWord.charAt(1) || ''}`.toUpperCase();
  });
  readonly formattedAddress = computed(() => {
    const unidade = this.unidade();

    if (!unidade) {
      return '';
    }

    const complemento = unidade.endereco.complemento ? `, ${unidade.endereco.complemento}` : '';

    return `${unidade.endereco.logradouro}, ${unidade.endereco.numero}${complemento} - ${unidade.endereco.bairro}, ${unidade.endereco.cidade} - ${unidade.endereco.uf}`;
  });
  readonly professores = signal<ProfessorListagemDto[]>([]);
  readonly professoresLoading = signal(true);
  readonly professoresContent = computed<TabContent>(() => {
    const professores = this.professores();
    const ativos = professores.filter((professor) => professor.status === 'ATIVO').length;
    const comModalidades = professores.filter((professor) => professor.modalidades.length > 0).length;

    return {
      title: 'Professores vinculados',
      createLabel: 'Cadastrar professor',
      entityLabel: 'professor',
      metrics: [
        { label: 'Vinculados', value: String(professores.length), icon: 'pi-users' },
        { label: 'Ativos', value: String(ativos), icon: 'pi-check-circle' },
        { label: 'Com modalidades', value: String(comModalidades), icon: 'pi-tags' },
      ],
      items: professores.map((professor) => ({
        id: String(professor.idProfessor),
        title: professor.nome,
        subtitle: professor.modalidades.length ? professor.modalidades.join(', ') : 'Sem modalidades vinculadas',
        meta: professor.contato || professor.email || 'Sem contato cadastrado',
        status: this.formatStatus(professor.status),
      })),
    };
  });
  readonly alunos = signal<AlunoListagemDto[]>([]);
  readonly alunosLoading = signal(true);
  readonly alunosContent = computed<TabContent>(() => {
    const alunos = this.alunos();
    const ativos = alunos.filter((aluno) => aluno.ativo).length;
    const matriculasAtivas = alunos.filter((aluno) => aluno.matricula?.status === 'ATIVA').length;

    return {
      title: 'Alunos matriculados',
      createLabel: 'Cadastrar aluno',
      entityLabel: 'aluno',
      metrics: [
        { label: 'Vinculados', value: String(alunos.length), icon: 'pi-user-plus' },
        { label: 'Ativos', value: String(ativos), icon: 'pi-check-circle' },
        { label: 'Matrículas ativas', value: String(matriculasAtivas), icon: 'pi-id-card' },
      ],
      items: alunos.map((aluno) => ({
        id: String(aluno.idAluno),
        title: aluno.nome,
        subtitle: aluno.planoAtual ?? 'Sem plano vinculado',
        meta: aluno.matricula
          ? `Vencimento dia ${aluno.matricula.diaVencimento} · ${this.formatStatus(aluno.matricula.status)}`
          : 'Sem matrícula ativa',
        status: aluno.ativo ? 'Ativo' : 'Inativo',
      })),
    };
  });
  readonly unidadeModalidades = signal<UnidadeModalidade[]>([]);
  readonly modalidadesLoading = signal(true);
  readonly modalidadesContent = computed<TabContent>(() => {
    const vinculos = this.unidadeModalidades();
    const ativas = vinculos.filter((vinculo) => vinculo.ativo).length;
    const comCapacidade = vinculos.filter((vinculo) => vinculo.capacidadePadrao != null).length;

    return {
      title: 'Modalidades ofertadas',
      createLabel: 'Vincular modalidade',
      entityLabel: 'modalidade',
      metrics: [
        { label: 'Vinculadas', value: String(vinculos.length), icon: 'pi-tags' },
        { label: 'Ativas', value: String(ativas), icon: 'pi-check' },
        { label: 'Com capacidade definida', value: String(comCapacidade), icon: 'pi-ticket' },
      ],
      items: vinculos.map((vinculo) => ({
        id: vinculo.id,
        title: vinculo.modalidadeNome,
        subtitle: vinculo.descricao || vinculo.modalidadeDescricao || 'Sem descrição',
        meta: vinculo.capacidadePadrao != null
          ? `Capacidade padrão: ${vinculo.capacidadePadrao} alunos`
          : 'Capacidade não definida',
        status: vinculo.ativo ? 'Ativa' : 'Inativa',
      })),
    };
  });
  readonly planoUnidades = signal<PlanoUnidade[]>([]);
  readonly planosLoading = signal(true);
  readonly planosContent = computed<TabContent>(() => {
    const vinculos = this.planoUnidades();
    const ativos = vinculos.filter((vinculo) => vinculo.ativo).length;
    const ticketMedio = vinculos.length
      ? vinculos.reduce((total, vinculo) => total + vinculo.valor, 0) / vinculos.length
      : 0;

    return {
      title: 'Planos disponíveis',
      createLabel: 'Cadastrar plano',
      entityLabel: 'plano',
      metrics: [
        { label: 'Vinculados', value: String(vinculos.length), icon: 'pi-wallet' },
        { label: 'Ativos', value: String(ativos), icon: 'pi-check-circle' },
        { label: 'Ticket médio', value: this.formatCurrency(ticketMedio), icon: 'pi-dollar' },
      ],
      items: vinculos.map((vinculo) => ({
        title: vinculo.nomeExibicao || vinculo.planoNome,
        subtitle: vinculo.descricao || vinculo.planoDescricao || 'Sem descrição',
        meta: vinculo.tipoCobranca
          ? `${this.formatCurrency(vinculo.valor)} · ${this.formatTipoCobranca(vinculo.tipoCobranca)}`
          : this.formatCurrency(vinculo.valor),
        status: vinculo.ativo ? 'Ativo' : 'Inativo',
      })),
    };
  });
  readonly horarios = signal<UnidadeHorarioFuncionamento[]>([]);
  readonly horariosLoading = signal(true);
  readonly horariosEditMode = signal(false);
  readonly horariosSubmitLoading = signal(false);
  readonly horariosSubmitError = signal('');
  readonly horariosSemana = computed(() => this.buildSemana(this.horarios()));
  readonly diasOrdenados = DIAS_ORDENADOS;
  horarioForm = this.fb.group({
    dias: this.fb.array<FormGroup>([]),
  });

  readonly activeContent = computed(() => {
    const tab = this.activeTab();

    if (tab === 'professores') {
      return this.professoresContent();
    }

    if (tab === 'alunos') {
      return this.alunosContent();
    }

    if (tab === 'modalidades') {
      return this.modalidadesContent();
    }

    return this.planosContent();
  });
  readonly shouldShowRecordAvatar = computed(() => (
    this.activeTab() === 'professores' || this.activeTab() === 'alunos'
  ));

  ngOnInit(): void {
    this.unidadesService.getUnidadeById(this.route.snapshot.params['idUnidade']).subscribe(res => {
      this.unidade.set(res);
    });
    this.unidadesService.getEstabelecimento(this.route.snapshot.params['idEstabelecimento']).subscribe(res => {
      this.estabelecimento.set(res);
    });
    this.loadProfessores();
    this.loadAlunos();
    this.loadUnidadeModalidades();
    this.loadPlanos();
    this.loadHorarios();
  }

  private loadProfessores(): void {
    this.professoresLoading.set(true);

    this.professoresService.getProfessoresPorUnidade(this.idUnidade).subscribe({
      next: (res) => {
        this.professores.set(res);
        this.professoresLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar professores da unidade', error);
        this.professoresLoading.set(false);
      },
    });
  }

  private loadAlunos(): void {
    this.alunosLoading.set(true);

    this.alunosService.getAlunosPorUnidade(this.idUnidade).subscribe({
      next: (res) => {
        this.alunos.set(res);
        this.alunosLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar alunos da unidade', error);
        this.alunosLoading.set(false);
      },
    });
  }

  private loadUnidadeModalidades(): void {
    this.modalidadesLoading.set(true);

    this.unidadeModalidadesService.getModalidadesVinculadas(this.idUnidade).subscribe({
      next: (res) => {
        this.unidadeModalidades.set(res);
        this.modalidadesLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar modalidades da unidade', error);
        this.modalidadesLoading.set(false);
      },
    });
  }

  private loadPlanos(): void {
    this.planosLoading.set(true);

    this.unidadePlanosService.getPlanosVinculados(this.idUnidade).subscribe({
      next: (res) => {
        this.planoUnidades.set(res);
        this.planosLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar planos da unidade', error);
        this.planosLoading.set(false);
      },
    });
  }

  private loadHorarios(): void {
    this.horariosLoading.set(true);

    this.unidadeHorarioFuncionamentoService.getHorarios(this.idUnidade).subscribe({
      next: (res) => {
        this.horarios.set(res);
        this.horariosLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar horários de funcionamento da unidade', error);
        this.horariosLoading.set(false);
      },
    });
  }

  diaSemanaLabel(diaSemana: number): string {
    return DIA_SEMANA_LABELS[diaSemana] ?? `Dia ${diaSemana}`;
  }

  startEditHorarios(): void {
    this.horariosSubmitError.set('');

    const dias = this.horarioForm.controls.dias;
    dias.clear();

    this.horariosSemana().forEach((dia) => {
      dias.push(this.fb.group({
        fechado: [!dia.horaAbertura],
        horaAbertura: [dia.horaAbertura],
        horaFechamento: [dia.horaFechamento],
      }));
    });

    this.horariosEditMode.set(true);
  }

  cancelEditHorarios(): void {
    this.horariosEditMode.set(false);
    this.horariosSubmitError.set('');
  }

  submitHorarios(): void {
    const linhas = this.horarioForm.controls.dias.controls.map((grupo, index) => ({
      diaSemana: this.diasOrdenados[index],
      ...grupo.getRawValue(),
    }));

    const invalida = linhas.some((linha) => (
      !linha.fechado && (!linha.horaAbertura || !linha.horaFechamento || linha.horaAbertura >= linha.horaFechamento)
    ));

    if (invalida) {
      this.horariosSubmitError.set(
        'Informe abertura e fechamento válidos (abertura antes do fechamento) ou marque o dia como fechado.',
      );
      return;
    }

    this.horariosSubmitLoading.set(true);
    this.horariosSubmitError.set('');

    this.unidadeHorarioFuncionamentoService.salvar({
      idUnidade: this.idUnidade,
      horarios: linhas.map((linha) => ({
        diaSemana: linha.diaSemana,
        horaAbertura: linha.fechado ? undefined : (linha.horaAbertura ?? undefined),
        horaFechamento: linha.fechado ? undefined : (linha.horaFechamento ?? undefined),
      })),
    }).subscribe({
      next: () => {
        this.horariosSubmitLoading.set(false);
        this.horariosEditMode.set(false);
        this.loadHorarios();
      },
      error: (error) => {
        console.error('Erro ao salvar horários de funcionamento da unidade', error);
        this.horariosSubmitError.set('Não foi possível salvar os horários de funcionamento.');
        this.horariosSubmitLoading.set(false);
      },
    });
  }

  private buildSemana(horarios: UnidadeHorarioFuncionamento[]): UnidadeHorarioFuncionamento[] {
    return DIAS_ORDENADOS.map((diaSemana) => (
      horarios.find((item) => item.diaSemana === diaSemana) ?? {
        diaSemana,
        horaAbertura: null,
        horaFechamento: null,
      }
    ));
  }

  setActiveTab(tabId: UnidadeTabId): void {
    this.activeTab.set(tabId);
  }

  formatStatus(status: string): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  formatTipoCobranca(tipo: TipoCobranca): string {
    return tipo
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase());
  }

  formatType(tipo: TipoEstabelecimento): string {
    return tipo
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  statusClass(status: StatusEstabelecimento): string {
    if (status === 'INATIVO') {
      return 'unit-status--inactive';
    }

    if (status === 'BLOQUEADO') {
      return 'unit-status--blocked';
    }

    return 'unit-status--active';
  }

  getInitials(name: string): string {
    const [firstWord = '', secondWord = ''] = name.trim().split(/\s+/);

    return `${firstWord.charAt(0)}${secondWord.charAt(0) || firstWord.charAt(1) || ''}`.toUpperCase();
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
