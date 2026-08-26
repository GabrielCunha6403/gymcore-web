import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Breadcrumb } from '../../../components/breadcrumb/breadcrumb';
import { ALUNOS_MOCK } from '../mocks';
import { Aluno, AlunoStatus, MatriculaStatus } from '../types';

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
  turmas: string[];
}

const ALUNO_DETAIL_EXTRA: Record<string, AlunoDetailExtra> = {
  'aluno-1': {
    dataNascimento: '18/08/1998',
    sexo: 'Masculino',
    endereco: {
      cep: '60150-160',
      logradouro: 'Rua Joaquim Nabuco',
      numero: '420',
      bairro: 'Aldeota',
      cidade: 'Fortaleza',
      uf: 'CE',
    },
    matricula: {
      unidade: 'PowerFit Aldeota',
      plano: 'Mensal Full',
      codigo: 'MAT-001',
      dataInicio: '10/01/2026',
      diaVencimento: 10,
      status: 'ATIVA',
    },
    mensalidades: [
      { competencia: '08/2026', vencimento: '10/08/2026', valorTotal: 'R$ 149,90', status: 'Paga' },
      { competencia: '09/2026', vencimento: '10/09/2026', valorTotal: 'R$ 149,90', status: 'Aberta' },
    ],
    frequencias: [
      { unidade: 'PowerFit Aldeota', entrada: '25/08/2026 07:12', saida: '25/08/2026 08:24' },
      { unidade: 'PowerFit Aldeota', entrada: '23/08/2026 07:18', saida: '23/08/2026 08:15' },
    ],
    turmas: ['Funcional 07h', 'Alongamento iniciante'],
  },
  'aluno-2': {
    dataNascimento: '04/11/1995',
    sexo: 'Feminino',
    endereco: {
      cep: '60175-047',
      logradouro: 'Rua Silva Jatahy',
      numero: '810',
      complemento: 'Apto 703',
      bairro: 'Meireles',
      cidade: 'Fortaleza',
      uf: 'CE',
    },
    matricula: {
      unidade: 'Move Studio Meireles',
      plano: 'Trimestral Performance',
      codigo: 'MAT-002',
      dataInicio: '05/03/2026',
      diaVencimento: 15,
      status: 'PENDENTE',
    },
    mensalidades: [
      { competencia: '08/2026', vencimento: '15/08/2026', valorTotal: 'R$ 399,90', status: 'Pendente' },
    ],
    frequencias: [
      { unidade: 'Move Studio Meireles', entrada: '24/08/2026 18:02', saida: '24/08/2026 19:10' },
    ],
    turmas: ['Pilates solo', 'Mobilidade'],
  },
};

@Component({
  selector: 'app-aluno-detail',
  imports: [Breadcrumb, RouterLink],
  templateUrl: './detail.html',
  styleUrl: './detail.scss',
})
export class AlunoDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly idEstabelecimento = this.getRouteParam('idEstabelecimento');
  private readonly idUnidade = this.getRouteParam('idUnidade');
  private readonly idAluno = this.getRouteParam('idAluno');

  protected readonly aluno = computed<Aluno | null>(() => (
    ALUNOS_MOCK.find((item) => item.id === this.idAluno) ?? null
  ));
  protected readonly backLink = computed(() => (
    this.idEstabelecimento && this.idUnidade
      ? ['/estabelecimentos', this.idEstabelecimento, this.idUnidade]
      : ['/alunos']
  ));

  protected readonly details = computed<AlunoDetailExtra | null>(() => {
    const aluno = this.aluno();

    if (!aluno) {
      return null;
    }

    return ALUNO_DETAIL_EXTRA[aluno.id] ?? this.buildDefaultDetails(aluno);
  });

  protected readonly initials = computed(() => {
    const aluno = this.aluno();

    if (!aluno) {
      return 'AL';
    }

    return this.getInitials(aluno.nome);
  });

  protected readonly primaryUnit = computed(() => this.aluno()?.unidades[0] ?? null);

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

  private buildDefaultDetails(aluno: Aluno): AlunoDetailExtra {
    return {
      dataNascimento: '-',
      sexo: '-',
      endereco: {
        cep: '60833-540',
        logradouro: 'Av. Oliveira Paiva',
        numero: '2222',
        bairro: 'Cidade dos Funcionários',
        cidade: 'Fortaleza',
        uf: 'CE',
      },
      matricula: {
        unidade: aluno.unidades[0]?.unidade ?? '-',
        plano: aluno.planoAtual,
        codigo: aluno.matricula.codigo,
        dataInicio: aluno.matricula.dataInicio,
        diaVencimento: aluno.matricula.vencimento,
        status: aluno.matricula.status,
      },
      mensalidades: [
        { competencia: '08/2026', vencimento: '10/08/2026', valorTotal: 'R$ 129,90', status: 'Aberta' },
      ],
      frequencias: [],
      turmas: aluno.modalidades,
    };
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
