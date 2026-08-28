import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { Breadcrumb } from '../../../components/breadcrumb/breadcrumb';
import { ErrorMessageControl } from '../../../components/error-message-control/error-message-control';
import { Wizard, WizardStepContent } from '../../../components/wizard/wizard';
import { WizardStep } from '../../../components/wizard/types/types';
import {
  EstabelecimentoForm,
  StatusEstabelecimento,
  TipoEstabelecimento,
} from '../types/types';
import { EstabelecimentosService } from '../estabelecimentos.service';

interface SelectOption<TValue extends string> {
  label: string;
  value: TValue;
}

@Component({
  selector: 'app-estabelecimento-register',
  imports: [Breadcrumb, Wizard, WizardStepContent, ReactiveFormsModule, ErrorMessageControl],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class EstabelecimentoRegister {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly estabelecimentoService = inject(EstabelecimentosService);

  protected readonly submitLoading = signal(false);
  protected readonly submitError = signal('');

  public readonly tipoOptions: SelectOption<TipoEstabelecimento>[] = [
    { label: 'Academia', value: 'ACADEMIA' },
    { label: 'Studio', value: 'STUDIO' },
    { label: 'Box', value: 'BOX' },
    { label: 'Centro esportivo', value: 'CENTRO_ESPORTIVO' },
    { label: 'Artes marciais', value: 'ARTES_MARCIAIS' },
    { label: 'Outro', value: 'OUTRO' },
  ];

  public readonly statusOptions: SelectOption<StatusEstabelecimento>[] = [
    { label: 'Ativo', value: 'ATIVO' },
    { label: 'Inativo', value: 'INATIVO' },
    { label: 'Bloqueado', value: 'BLOQUEADO' },
  ];

  public readonly estabelecimentoForm = this.fb.group({
    dadosGerais: this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(150)]],
      razaoSocial: ['', [Validators.required, Validators.maxLength(180)]],
      tipo: [null as TipoEstabelecimento | null, [Validators.required]],
      status: ['ATIVO' as StatusEstabelecimento, [Validators.required]],
      ativo: [true, [EstabelecimentoRegister.booleanRequiredValidator]],
    }),

    contato: this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)]],
      site: ['', [Validators.maxLength(200)]],
      logoUrl: ['', [Validators.maxLength(500)]],
    }),
  });

  public readonly registerSteps = signal<WizardStep[]>([
    {
      label: 'Dados gerais',
      description: 'Preencha a identificação e a classificação do estabelecimento',
      icon: 'pi pi-building',
      completed: false,
    },
    {
      label: 'Contato',
      description: 'Informe os canais oficiais de contato e a imagem do estabelecimento',
      icon: 'pi pi-phone',
      completed: false,
    },
    {
      label: 'Confirmação',
      description: 'Revise as informações antes de salvar o cadastro',
      icon: 'pi pi-check-circle',
      completed: false,
    },
  ]);

  public applyTelefoneMask(): void {
    const control = this.estabelecimentoForm.controls.contato.controls.telefone;

    control.setValue(this.formatTelefone(control.value), { emitEvent: false });
  }

  public submitEstabelecimento(): void {
    if (this.estabelecimentoForm.invalid) {
      this.estabelecimentoForm.markAllAsTouched();
      return;
    }

    this.submitLoading.set(true);
    this.submitError.set('');

    this.estabelecimentoService.registerEstabelecimento(this.toRequest()).subscribe({
      next: () => {
        this.router.navigate(['/estabelecimentos']);
      },
      error: (error) => {
        console.error('Erro ao cadastrar estabelecimento', error);
        this.submitError.set('Não foi possível cadastrar o estabelecimento.');
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

  public displayTipo(): string {
    const tipo = this.estabelecimentoForm.controls.dadosGerais.controls.tipo.value;

    return this.tipoOptions.find((option) => option.value === tipo)?.label ?? '-';
  }

  public displayStatus(): string {
    const status = this.estabelecimentoForm.controls.dadosGerais.controls.status.value;

    return this.statusOptions.find((option) => option.value === status)?.label ?? '-';
  }

  private toRequest(): EstabelecimentoForm {
    const { dadosGerais, contato } = this.estabelecimentoForm.getRawValue();

    return {
      nome: dadosGerais.nome ?? '',
      razaoSocial: dadosGerais.razaoSocial ?? '',
      tipo: dadosGerais.tipo as TipoEstabelecimento,
      status: dadosGerais.status as StatusEstabelecimento,
      ativo: dadosGerais.ativo ?? true,
      email: contato.email ?? '',
      telefone: contato.telefone ?? '',
      site: contato.site || undefined,
      logoUrl: contato.logoUrl || undefined,
    };
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

  private onlyDigits(value: string | null): string {
    return value?.replace(/\D/g, '') ?? '';
  }

  private static booleanRequiredValidator(
    control: AbstractControl<boolean | null>,
  ): ValidationErrors | null {
    return typeof control.value === 'boolean' ? null : { required: true };
  }
}
