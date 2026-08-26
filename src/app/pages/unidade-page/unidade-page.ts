import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import { ESTABELECIMENTOS_MOCK, UNIDADES_MOCK } from '../estabelecimentos/mocks/mocks';
import { Estabelecimento, StatusEstabelecimento, TipoEstabelecimento, Unidade } from '../estabelecimentos/types/types';

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
  ],
  templateUrl: './unidade-page.html',
  styleUrl: './unidade-page.scss',
})
export class UnidadePage {
  private readonly route = inject(ActivatedRoute);
  readonly idEstabelecimento = this.getRouteParam('idEstabelecimento');
  readonly idUnidade = this.getRouteParam('idUnidade');

  readonly activeTab = signal<UnidadeTabId>('professores');
  readonly tabs: UnidadeTab[] = [
    { id: 'professores', label: 'Professores', icon: 'pi-users' },
    { id: 'alunos', label: 'Alunos', icon: 'pi-user' },
    { id: 'modalidades', label: 'Modalidades', icon: 'pi-tags' },
    { id: 'planos', label: 'Planos', icon: 'pi-credit-card' },
  ];

  readonly estabelecimento = computed<Estabelecimento | null>(() => (
    ESTABELECIMENTOS_MOCK.find((item) => item.id === this.idEstabelecimento) ?? null
  ));
  readonly unidade = computed<Unidade | null>(() => (
    UNIDADES_MOCK.find((item) => item.id === this.idUnidade && item.estabelecimentoId === this.idEstabelecimento) ?? null
  ));
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
  readonly activeContent = computed(() => this.tabContents[this.activeTab()]);
  readonly shouldShowRecordAvatar = computed(() => (
    this.activeTab() === 'professores' || this.activeTab() === 'alunos'
  ));

  private readonly tabContents: Record<UnidadeTabId, TabContent> = {
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
    modalidades: {
      title: 'Modalidades ofertadas',
      createLabel: 'Cadastrar modalidade',
      entityLabel: 'modalidade',
      metrics: [
        { label: 'Ativas', value: '5', icon: 'pi-check' },
        { label: 'Com turmas', value: '4', icon: 'pi-calendar-plus' },
        { label: 'Vagas abertas', value: '36', icon: 'pi-ticket' },
      ],
      items: [
        {
          title: 'Musculação',
          subtitle: 'Acesso livre por faixa de horário',
          meta: 'Capacidade operacional: 80 alunos por turno',
          status: 'Ativa',
        },
        {
          title: 'Funcional',
          subtitle: 'Turmas coletivas',
          meta: '12 vagas por turma',
          status: 'Ativa',
        },
        {
          title: 'Pilates',
          subtitle: 'Agenda com professor responsável',
          meta: 'Cadastro de horários em revisão',
          status: 'Pendente',
        },
      ],
    },
    planos: {
      title: 'Planos disponíveis',
      createLabel: 'Cadastrar plano',
      entityLabel: 'plano',
      metrics: [
        { label: 'Ativos', value: '4', icon: 'pi-wallet' },
        { label: 'Mais vendido', value: 'Mensal', icon: 'pi-star' },
        { label: 'Ticket médio', value: 'R$ 129', icon: 'pi-dollar' },
      ],
      items: [
        {
          title: 'Mensal Basic',
          subtitle: 'Acesso à musculação',
          meta: 'R$ 99,90 por mês',
          status: 'Ativo',
        },
        {
          title: 'Mensal Full',
          subtitle: 'Musculação e aulas coletivas',
          meta: 'R$ 149,90 por mês',
          status: 'Ativo',
        },
        {
          title: 'Trimestral Performance',
          subtitle: 'Todas as modalidades da unidade',
          meta: 'R$ 399,90 por trimestre',
          status: 'Ativo',
        },
      ],
    },
  };

  setActiveTab(tabId: UnidadeTabId): void {
    this.activeTab.set(tabId);
  }

  formatStatus(status: StatusEstabelecimento): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
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
