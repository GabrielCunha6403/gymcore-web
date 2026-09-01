import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { Estabelecimento, ModalidadeForm } from '../../estabelecimentos/types/types';
import { ModalidadesService } from '../modalidades.service';

@Component({
  selector: 'app-modalidade-register',
  imports: [Breadcrumb, Wizard, WizardStepContent, ReactiveFormsModule, ErrorMessageControl],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class ModalidadeRegister implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly modalidadesService = inject(ModalidadesService);
  private readonly idEstabelecimento = this.readEstabelecimentoId();

  protected readonly submitLoading = signal(false);
  protected readonly submitError = signal('');
  protected readonly estabelecimento = signal<Estabelecimento | null>(null);

  protected readonly estabelecimentoNome = computed(() => (
    this.estabelecimento()?.nomeFantasia ?? `Estabelecimento ${this.idEstabelecimento}`.trim()
  ));

  public readonly modalidadeForm = this.fb.group({
    dadosGerais: this.fb.group({
      idEstabelecimento: [this.idEstabelecimento, [Validators.required]],
      nome: ['', [Validators.required, Validators.maxLength(120)]],
      descricao: ['', [Validators.maxLength(1000)]],
      ativo: [true, [ModalidadeRegister.booleanRequiredValidator]],
    }),
  });

  public readonly registerSteps = signal<WizardStep[]>([
    {
      label: 'Dados da modalidade',
      description: 'Preencha a identificação da modalidade oferecida pelo estabelecimento',
      icon: 'pi pi-tags',
      completed: false,
    },
    {
      label: 'Confirmação',
      description: 'Revise as informações antes de salvar o cadastro',
      icon: 'pi pi-check-circle',
      completed: false,
    },
  ]);

  ngOnInit(): void {
    if (!this.idEstabelecimento) {
      return;
    }

    this.modalidadesService.getEstabelecimento(this.idEstabelecimento).subscribe((res) => {
      this.estabelecimento.set(res);
    });
  }

  public submitModalidade(): void {
    if (this.modalidadeForm.invalid) {
      this.modalidadeForm.markAllAsTouched();
      return;
    }

    this.submitLoading.set(true);
    this.submitError.set('');

    this.modalidadesService.registerModalidade(this.toRequest()).subscribe({
      next: () => {
        this.toastService.success('Modalidade cadastrada com sucesso!');
        this.router.navigate(['/estabelecimentos', this.idEstabelecimento], {
          queryParams: { tab: 'modalidades' },
        });
      },
      error: (error) => {
        console.error('Erro ao cadastrar modalidade', error);
        this.submitError.set('Não foi possível cadastrar a modalidade.');
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
    return value ? 'Ativa' : 'Inativa';
  }

  private toRequest(): ModalidadeForm {
    const { dadosGerais } = this.modalidadeForm.getRawValue();

    return {
      idEstabelecimento: dadosGerais.idEstabelecimento ?? '',
      nome: dadosGerais.nome ?? '',
      descricao: dadosGerais.descricao || undefined,
      ativo: dadosGerais.ativo ?? true,
    };
  }

  private readEstabelecimentoId(): string {
    for (const routeSnapshot of this.route.snapshot.pathFromRoot) {
      const value = routeSnapshot.paramMap.get('idEstabelecimento');

      if (value) {
        return value;
      }
    }

    return '';
  }

  private static booleanRequiredValidator(
    control: AbstractControl<boolean | null>,
  ): ValidationErrors | null {
    return typeof control.value === 'boolean' ? null : { required: true };
  }
}
