import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Breadcrumb } from '../../../components/breadcrumb/breadcrumb';
import { ErrorMessageControl } from '../../../components/error-message-control/error-message-control';
import { ToastService } from '../../../components/toast/toast.service';
import { Wizard, WizardStepContent } from '../../../components/wizard/wizard';
import { WizardStep } from '../../../components/wizard/types/types';
import { ESTABELECIMENTOS_MOCK } from '../../estabelecimentos/mocks/mocks';
import { UnidadeForm } from '../../estabelecimentos/types/types';
import { UnidadesService } from '../unidades.service';

@Component({
  selector: 'app-unidade-register',
  imports: [Breadcrumb, Wizard, WizardStepContent, ReactiveFormsModule, ErrorMessageControl],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class UnidadeRegister {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly unidadesService = inject(UnidadesService);
  private readonly idEstabelecimento = this.readEstabelecimentoId();

  protected readonly submitLoading = signal(false);
  protected readonly submitError = signal('');

  public readonly ufOptions = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ];

  public readonly unidadeForm = this.fb.group({
    dadosGerais: this.fb.group({
      idEstabelecimento: [this.idEstabelecimento, [Validators.required]],
      nome: ['', [Validators.required, Validators.maxLength(150)]],
      cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)]],
      ativo: [true, [UnidadeRegister.booleanRequiredValidator]],
    }),

    endereco: this.fb.group({
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      logradouro: ['', [Validators.required, Validators.maxLength(200)]],
      numero: ['', [Validators.required, Validators.maxLength(30)]],
      complemento: ['', [Validators.maxLength(100)]],
      bairro: ['', [Validators.required, Validators.maxLength(100)]],
      cidade: ['', [Validators.required, Validators.maxLength(100)]],
      uf: [null as string | null, [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    }),
  });

  public readonly registerSteps = signal<WizardStep[]>([
    {
      label: 'Dados gerais',
      description: 'Preencha a identificacao, CNPJ e contatos da unidade',
      icon: 'pi pi-building',
      completed: false,
    },
    {
      label: 'Endereco',
      description: 'Informe o endereco operacional da unidade',
      icon: 'pi pi-map-marker',
      completed: false,
    },
    {
      label: 'Confirmacao',
      description: 'Revise as informacoes antes de salvar o cadastro',
      icon: 'pi pi-check-circle',
      completed: false,
    },
  ]);

  protected readonly estabelecimentoNome = computed(() => {
    const estabelecimento = ESTABELECIMENTOS_MOCK.find(
      (item) => Number(item.id) === this.idEstabelecimento,
    );

    return estabelecimento?.nomeFantasia ?? `Estabelecimento ${this.idEstabelecimento ?? ''}`.trim();
  });

  public applyCnpjMask(): void {
    const control = this.unidadeForm.controls.dadosGerais.controls.cnpj;

    control.setValue(this.formatCnpj(control.value), { emitEvent: false });
  }

  public applyTelefoneMask(): void {
    const control = this.unidadeForm.controls.dadosGerais.controls.telefone;

    control.setValue(this.formatTelefone(control.value), { emitEvent: false });
  }

  public applyCepMask(): void {
    const control = this.unidadeForm.controls.endereco.controls.cep;

    control.setValue(this.formatCep(control.value), { emitEvent: false });
  }

  public submitUnidade(): void {
    if (this.unidadeForm.invalid) {
      this.unidadeForm.markAllAsTouched();
      return;
    }

    this.submitLoading.set(true);
    this.submitError.set('');

    this.unidadesService.registerUnidade(this.toRequest()).subscribe({
      next: () => {
        this.toastService.success('Unidade cadastrada com sucesso!');
        this.router.navigate(['/estabelecimentos', String(this.idEstabelecimento)]);
      },
      error: (error) => {
        console.error('Erro ao cadastrar unidade', error);
        this.submitError.set('Nao foi possivel cadastrar a unidade.');
        this.submitLoading.set(false);
      },
    });
  }

  public displayValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    return String(value);
  }

  public displayBoolean(value: boolean | null | undefined): string {
    return value ? 'Ativo' : 'Inativo';
  }

  public displayEndereco(): string {
    const endereco = this.unidadeForm.controls.endereco.getRawValue();
    const cidadeUf = [endereco.cidade, endereco.uf].filter(Boolean).join(' / ');

    return cidadeUf || '-';
  }

  private toRequest(): UnidadeForm {
    const { dadosGerais, endereco } = this.unidadeForm.getRawValue();

    return {
      idEstabelecimento: dadosGerais.idEstabelecimento as number,
      nome: dadosGerais.nome ?? '',
      cnpj: dadosGerais.cnpj ?? '',
      email: dadosGerais.email ?? '',
      telefone: dadosGerais.telefone ?? '',
      endereco: {
        cep: endereco.cep ?? '',
        logradouro: endereco.logradouro ?? '',
        numero: endereco.numero ?? '',
        complemento: endereco.complemento || undefined,
        bairro: endereco.bairro ?? '',
        cidade: endereco.cidade ?? '',
        uf: endereco.uf ?? '',
      },
      ativo: dadosGerais.ativo ?? true,
    };
  }

  private formatCnpj(value: string | null): string {
    const digits = this.onlyDigits(value).slice(0, 14);

    if (digits.length <= 2) {
      return digits;
    }

    if (digits.length <= 5) {
      return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    }

    if (digits.length <= 8) {
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    }

    if (digits.length <= 12) {
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    }

    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }

  private formatTelefone(value: string | null): string {
    const digits = this.onlyDigits(value).slice(0, 11);

    if (digits.length <= 2) {
      return digits;
    }

    if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  private formatCep(value: string | null): string {
    const digits = this.onlyDigits(value).slice(0, 8);

    if (digits.length <= 5) {
      return digits;
    }

    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  private onlyDigits(value: string | null): string {
    return value?.replace(/\D/g, '') ?? '';
  }

  private readEstabelecimentoId(): number | null {
    for (const routeSnapshot of this.route.snapshot.pathFromRoot) {
      const rawValue = routeSnapshot.paramMap.get('idEstabelecimento');
      const value = rawValue ? Number(rawValue) : null;

      if (value && Number.isFinite(value)) {
        return value;
      }
    }

    return null;
  }

  private static booleanRequiredValidator(
    control: AbstractControl<boolean | null>,
  ): ValidationErrors | null {
    return typeof control.value === 'boolean' ? null : { required: true };
  }
}
