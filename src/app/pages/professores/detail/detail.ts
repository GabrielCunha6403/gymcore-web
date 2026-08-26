import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Breadcrumb } from '../../../components/breadcrumb/breadcrumb';
import { PROFESSORES_MOCK } from '../mocks';
import { Professor, ProfessorStatus } from '../types';

interface ProfessorDetailExtra {
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
  profissional: {
    registroProfissional: string;
    observacoes: string;
    ativo: boolean;
  };
  atuacao: {
    codigoInterno: string;
    ativo: boolean;
  };
}

const PROFESSOR_DETAIL_EXTRA: Record<string, ProfessorDetailExtra> = {
  'prof-1': {
    dataNascimento: '12/04/1991',
    sexo: 'Feminino',
    endereco: {
      cep: '60150-160',
      logradouro: 'Av. Santos Dumont',
      numero: '1500',
      bairro: 'Aldeota',
      cidade: 'Fortaleza',
      uf: 'CE',
    },
    profissional: {
      registroProfissional: 'CREF 012345-G/CE',
      observacoes: 'Responsável por turmas de musculação e acompanhamento inicial.',
      ativo: true,
    },
    atuacao: {
      codigoInterno: 'PROF-001',
      ativo: true,
    },
  },
  'prof-2': {
    dataNascimento: '08/09/1987',
    sexo: 'Masculino',
    endereco: {
      cep: '60175-047',
      logradouro: 'Rua Silva Jatahy',
      numero: '850',
      complemento: 'Sala 02',
      bairro: 'Meireles',
      cidade: 'Fortaleza',
      uf: 'CE',
    },
    profissional: {
      registroProfissional: 'CREF 023456-G/CE',
      observacoes: 'Atuação focada em pilates, mobilidade e recuperação funcional.',
      ativo: true,
    },
    atuacao: {
      codigoInterno: 'PROF-002',
      ativo: true,
    },
  },
};

@Component({
  selector: 'app-detail',
  imports: [Breadcrumb, RouterLink],
  templateUrl: './detail.html',
  styleUrl: './detail.scss',
})
export class Detail {
  private readonly route = inject(ActivatedRoute);
  private readonly idEstabelecimento = this.getRouteParam('idEstabelecimento');
  private readonly idUnidade = this.getRouteParam('idUnidade');
  private readonly idProfessor = this.getRouteParam('idProfessor');

  protected readonly professor = computed<Professor | null>(() => (
    PROFESSORES_MOCK.find((item) => item.id === this.idProfessor) ?? null
  ));
  protected readonly backLink = computed(() => (
    this.idEstabelecimento && this.idUnidade
      ? ['/estabelecimentos', this.idEstabelecimento, this.idUnidade]
      : ['/professores']
  ));

  protected readonly details = computed<ProfessorDetailExtra | null>(() => {
    const professor = this.professor();

    if (!professor) {
      return null;
    }

    return PROFESSOR_DETAIL_EXTRA[professor.id] ?? this.buildDefaultDetails(professor);
  });

  protected readonly initials = computed(() => {
    const professor = this.professor();

    if (!professor) {
      return 'PF';
    }

    return this.getInitials(professor.nome);
  });

  protected readonly primaryUnit = computed(() => this.professor()?.unidades[0] ?? null);

  protected formatStatus(status: ProfessorStatus): string {
    return status
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase());
  }

  protected statusClass(status: ProfessorStatus): string {
    if (status === 'INATIVO') {
      return 'teacher-status--inactive';
    }

    if (status === 'AFASTADO') {
      return 'teacher-status--away';
    }

    return 'teacher-status--active';
  }

  protected displayBoolean(value: boolean): string {
    return value ? 'Ativo' : 'Inativo';
  }

  protected displayValue(value: string | undefined): string {
    return value?.trim() ? value : '-';
  }

  protected getInitials(name: string): string {
    const [firstWord = '', secondWord = ''] = name.trim().split(/\s+/);

    return `${firstWord.charAt(0)}${secondWord.charAt(0) || firstWord.charAt(1) || ''}`.toUpperCase();
  }

  private buildDefaultDetails(professor: Professor): ProfessorDetailExtra {
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
      profissional: {
        registroProfissional: `CREF ${professor.id.replace(/\D/g, '').padStart(6, '0')}-G/CE`,
        observacoes: 'Cadastro complementar pendente de revisão.',
        ativo: professor.status === 'ATIVO',
      },
      atuacao: {
        codigoInterno: professor.id.toUpperCase(),
        ativo: professor.status === 'ATIVO',
      },
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
