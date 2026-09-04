import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';

import { Breadcrumb } from '../../../components/breadcrumb/breadcrumb';
import { ErrorMessageControl } from '../../../components/error-message-control/error-message-control';
import { ToastService } from '../../../components/toast/toast.service';
import { Wizard, WizardStepContent } from '../../../components/wizard/wizard';
import { WizardStep } from '../../../components/wizard/types/types';
import { Estabelecimento, ModalidadeForm } from '../../estabelecimentos/types/types';
import { EstabelecimentosService } from '../../estabelecimentos/estabelecimentos.service';
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  private readonly modalidadesService = inject(ModalidadesService);
  private readonly estabelecimentosService = inject(EstabelecimentosService);
  private readonly estabelecimentoSearchTerms = new Subject<string>();
  private readonly idEstabelecimento = this.readEstabelecimentoId();

  protected readonly isEstabelecimentoContext = !!this.idEstabelecimento;

  protected readonly submitLoading = signal(false);
  protected readonly submitError = signal('');
  protected readonly estabelecimento = signal<Estabelecimento | null>(null);
  protected readonly estabelecimentos = signal<Estabelecimento[]>([]);
  protected readonly estabelecimentosLoading = signal(false);
  protected readonly estabelecimentosSearchError = signal(false);
  protected readonly estabelecimentoSearch = signal('');
  protected readonly estabelecimentoDropdownOpen = signal(false);

  protected estabelecimentoNome(): string {
    return (
      this.estabelecimento()?.nomeFantasia
      ?? (this.isEstabelecimentoContext ? `Estabelecimento ${this.idEstabelecimento}`.trim() : '-')
    );
  }

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

  constructor() {
    this.estabelecimentoSearchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.estabelecimentosLoading.set(true);
          this.estabelecimentosSearchError.set(false);
        }),
        switchMap((busca) =>
          this.estabelecimentosService.getEstabelecimentos(busca).pipe(
            catchError((error) => {
              console.error('Erro ao buscar estabelecimentos', error);
              this.estabelecimentosSearchError.set(true);
              return of([]);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((estabelecimentos) => {
        this.estabelecimentos.set(estabelecimentos);
        this.estabelecimentosLoading.set(false);
      });

    if (!this.isEstabelecimentoContext) {
      this.searchEstabelecimentos('');
    }
  }

  ngOnInit(): void {
    if (!this.isEstabelecimentoContext) {
      return;
    }

    this.modalidadesService.getEstabelecimento(this.idEstabelecimento).subscribe((res) => {
      this.estabelecimento.set(res);
    });
  }

  protected updateEstabelecimentoSearch(value: string): void {
    this.estabelecimentoSearch.set(value);
    this.estabelecimentoDropdownOpen.set(true);
    this.searchEstabelecimentos(value);

    if (value !== this.estabelecimento()?.nomeFantasia) {
      this.modalidadeForm.controls.dadosGerais.controls.idEstabelecimento.reset('');
      this.estabelecimento.set(null);
    }
  }

  protected selectEstabelecimento(estabelecimento: Estabelecimento): void {
    const control = this.modalidadeForm.controls.dadosGerais.controls.idEstabelecimento;

    control.setValue(estabelecimento.id);
    control.markAsTouched();
    this.estabelecimento.set(estabelecimento);
    this.estabelecimentoSearch.set(estabelecimento.nomeFantasia);
    this.estabelecimentoDropdownOpen.set(false);
  }

  protected clearEstabelecimentoSelection(): void {
    const control = this.modalidadeForm.controls.dadosGerais.controls.idEstabelecimento;

    control.reset('');
    control.markAsTouched();
    this.estabelecimento.set(null);
    this.estabelecimentoSearch.set('');
    this.estabelecimentoDropdownOpen.set(false);
    this.searchEstabelecimentos('');
  }

  protected closeEstabelecimentoDropdown(): void {
    this.modalidadeForm.controls.dadosGerais.controls.idEstabelecimento.markAsTouched();
    this.estabelecimentoDropdownOpen.set(false);
  }

  protected initials(value: string): string {
    return value
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
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

        if (this.isEstabelecimentoContext) {
          this.router.navigate(['/estabelecimentos', this.idEstabelecimento], {
            queryParams: { tab: 'modalidades' },
          });
        } else {
          this.router.navigate(['/modalidades']);
        }
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

  private searchEstabelecimentos(value: string): void {
    this.estabelecimentoSearchTerms.next(value.trim());
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
