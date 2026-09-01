import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Breadcrumb } from '../../../components/breadcrumb/breadcrumb';
import { ProfessoresService } from '../professores.service';
import { Professor, ProfessorDetalheDto, ProfessorStatus } from '../types/types';

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
  };
  atuacao: {
    codigoInterno: string;
    ativo: boolean;
  };
}

@Component({
  selector: 'app-detail',
  imports: [Breadcrumb, RouterLink],
  templateUrl: './detail.html',
  styleUrl: './detail.scss',
})
export class Detail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly professoresService = inject(ProfessoresService);
  private readonly idEstabelecimento = this.getRouteParam('idEstabelecimento');
  private readonly idUnidade = this.getRouteParam('idUnidade');
  private readonly idProfessor = this.getRouteParam('idProfessor');

  protected readonly professor = signal<Professor | null>(null);
  protected readonly details = signal<ProfessorDetailExtra | null>(null);

  protected readonly backLink = computed(() => (
    this.idEstabelecimento && this.idUnidade
      ? ['/estabelecimentos', this.idEstabelecimento, this.idUnidade]
      : ['/professores']
  ));

  protected readonly initials = computed(() => {
    const professor = this.professor();

    if (!professor) {
      return 'PF';
    }

    return this.getInitials(professor.nome);
  });

  protected readonly primaryUnit = computed(() => this.professor()?.unidades[0] ?? null);

  ngOnInit(): void {
    if (!this.idProfessor) {
      return;
    }

    this.professoresService.getProfessorById(this.idProfessor).subscribe((dto) => {
      this.professor.set(this.toProfessor(dto));
      this.details.set(this.toDetails(dto));
    });
  }

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

  private toProfessor(dto: ProfessorDetalheDto): Professor {
    return {
      id: String(dto.idProfessor),
      nome: dto.nome,
      cpf: dto.cpf,
      email: dto.email,
      contato: dto.contato,
      status: dto.status,
      unidades: dto.unidades.map((unidade) => ({
        estabelecimento: unidade.estabelecimento ?? '-',
        unidade: unidade.unidade,
      })),
      modalidades: dto.modalidades,
    };
  }

  private toDetails(dto: ProfessorDetalheDto): ProfessorDetailExtra {
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
      profissional: {
        registroProfissional: this.displayValue(dto.registroProfissional ?? undefined),
        observacoes: this.displayValue(dto.observacoes ?? undefined),
      },
      atuacao: {
        codigoInterno: this.displayValue(dto.codigoInterno ?? undefined),
        ativo: dto.ativoAtuacao ?? false,
      },
    };
  }

  private formatDate(value: string | null): string {
    if (!value) {
      return '-';
    }

    const [ano, mes, dia] = value.split('-');

    return ano && mes && dia ? `${dia}/${mes}/${ano}` : value;
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
