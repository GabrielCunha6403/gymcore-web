import {Component, computed, inject, OnInit, signal} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import { ESTABELECIMENTOS_MOCK, UNIDADES_MOCK } from '../estabelecimentos/mocks/mocks';
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

    if (tab === 'modalidades') {
      return this.modalidadesContent();
    }

    if (tab === 'planos') {
      return this.planosContent();
    }

    return this.tabContents[tab];
  });
  readonly shouldShowRecordAvatar = computed(() => (
    this.activeTab() === 'professores' || this.activeTab() === 'alunos'
  ));

  private readonly tabContents: Record<Exclude<UnidadeTabId, 'modalidades' | 'planos'>, TabContent> = {
    professores: {
      title: 'Professores vinculados',
      createLabel: 'Cadastrar professor',
      entityLabel: 'professor',
      metrics: [
        { label: 'Ativos', value: '8', icon: 'pi-check-circle' },
        { label: 'Com turmas', value: '6', icon: 'pi-calendar' },
        { label: 'Sem agenda', value: '2', icon: 'pi-clock' },
      ],
      items: [
        {
          id: 'prof-1',
          title: 'Ana Beatriz Costa',
          photoUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=120&q=80',
          subtitle: 'Musculação e funcional',
          meta: 'Segunda a sexta, 06:00 às 12:00',
          status: 'Ativo',
        },
        {
          id: 'prof-2',
          title: 'Carlos Henrique Lima',
          subtitle: 'Cross training',
          meta: 'Terça e quinta, 18:00 às 22:00',
          status: 'Ativo',
        },
        {
          id: 'prof-3',
          title: 'Mariana Torres Nunes',
          subtitle: 'Pilates e mobilidade',
          meta: 'Agenda pendente para esta unidade',
          status: 'Pendente',
        },
      ],
    },
    alunos: {
      title: 'Alunos matriculados',
      createLabel: 'Cadastrar aluno',
      entityLabel: 'aluno',
      metrics: [
        { label: 'Ativos', value: '214', icon: 'pi-user-plus' },
        { label: 'Novos no mês', value: '18', icon: 'pi-chart-line' },
        { label: 'Pendências', value: '7', icon: 'pi-exclamation-circle' },
      ],
      items: [
        {
          id: 'aluno-1',
          title: 'Bruno Nogueira',
          photoUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=120&q=80',
          subtitle: 'Plano mensal',
          meta: 'Último acesso em 21/08/2026',
          status: 'Ativo',
        },
        {
          id: 'aluno-2',
          title: 'Larissa Moura',
          subtitle: 'Plano trimestral',
          meta: 'Pagamento vence em 25/08/2026',
          status: 'Atenção',
        },
        {
          id: 'aluno-3',
          title: 'Rafael Martins',
          subtitle: 'Plano anual',
          meta: 'Check-in recorrente no turno da noite',
          status: 'Ativo',
        },
      ],
    },
  };

  ngOnInit(): void {
    this.unidadesService.getUnidadeById(this.route.snapshot.params['idUnidade']).subscribe(res => {
      this.unidade.set(res);
    });
    this.unidadesService.getEstabelecimento(this.route.snapshot.params['idEstabelecimento']).subscribe(res => {
      this.estabelecimento.set(res);
    });
    this.loadUnidadeModalidades();
    this.loadPlanos();
    this.loadHorarios();
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

  formatStatus(status: StatusEstabelecimento): string {
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
