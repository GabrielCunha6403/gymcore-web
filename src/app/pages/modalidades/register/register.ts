import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';

import { Breadcrumb } from '../../../components/breadcrumb/breadcrumb';
import { ErrorMessageControl } from '../../../components/error-message-control/error-message-control';
import { ToastService } from '../../../components/toast/toast.service';
import { Wizard, WizardStepContent } from '../../../components/wizard/wizard';
import { WizardStep } from '../../../components/wizard/types/types';
import { Estabelecimento, ModalidadeForm, Unidade, UnidadeModalidadeForm } from '../../estabelecimentos/types/types';
import { EstabelecimentosService } from '../../estabelecimentos/estabelecimentos.service';
import { ModalidadesService } from '../modalidades.service';
import { UnidadesService } from '../../unidades/unidades.service';
import { UnidadeModalidadesService } from '../../unidade-modalidades/unidade-modalidades.service';

@Component({
  selector: 'app-modalidade-register',
  imports: [Breadcrumb, RouterLink, Wizard, WizardStepContent, ReactiveFormsModule, ErrorMessageControl],
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
  private readonly unidadesService = inject(UnidadesService);
  private readonly unidadeModalidadesService = inject(UnidadeModalidadesService);
  private readonly estabelecimentoSearchTerms = new Subject<string>();
  private readonly idEstabelecimento = this.readEstabelecimentoId();
  private readonly idUnidade = this.readRouteParam('idUnidade');
  private readonly idModalidade = this.readRouteParam('idModalidade');
  private idUnidadeModalidade = '';

  protected readonly isEditMode = !!this.idModalidade;
  protected readonly isEstabelecimentoContext = !!this.idEstabelecimento || this.isEditMode;
  protected readonly unitScoped = !!this.idUnidade;
  protected readonly backLink = computed(() => {
    if (this.unitScoped) {
      return ['/estabelecimentos', this.idEstabelecimento, this.idUnidade];
    }

    return this.idEstabelecimento ? ['/estabelecimentos', this.idEstabelecimento] : ['/modalidades'];
  });
  protected readonly backQueryParams = computed(() => (
    this.idEstabelecimento ? { tab: 'modalidades' } : null
  ));

  protected readonly ofertaLoading = signal(false);
  protected readonly unidade = signal<Unidade | null>(null);
  protected readonly unidadeNome = computed(() => (
    this.unidade()?.nome ?? (this.unitScoped ? `Unidade ${this.idUnidade}`.trim() : '-')
  ));

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

    oferta: this.fb.group({
      capacidadePadrao: [null as number | null, [Validators.min(1)]],
      descricao: ['', [Validators.maxLength(1000)]],
      ativo: [true, [ModalidadeRegister.booleanRequiredValidator]],
    }),
  });

  public readonly registerSteps = signal<WizardStep[]>(this.buildSteps());

  private buildSteps(): WizardStep[] {
    const steps: WizardStep[] = [
      {
        label: 'Dados da modalidade',
        description: 'Preencha a identificação da modalidade oferecida pelo estabelecimento',
        icon: 'pi pi-tags',
        completed: false,
      },
    ];

    if (this.unitScoped) {
      steps.push({
        label: 'Oferta',
        description: 'Defina a capacidade, a descrição e o status desta modalidade na unidade',
        icon: 'pi pi-sliders-h',
        completed: false,
      });
    }

    steps.push({
      label: 'Confirmação',
      description: 'Revise as informações antes de salvar o cadastro',
      icon: 'pi pi-check-circle',
      completed: false,
    });

    return steps;
  }

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
    if (this.isEditMode) {
      this.loadModalidadeParaEdicao();
      return;
    }

    if (!this.isEstabelecimentoContext) {
      return;
    }

    this.modalidadesService.getEstabelecimento(this.idEstabelecimento).subscribe((res) => {
      this.estabelecimento.set(res);
    });
  }

  private loadModalidadeParaEdicao(): void {
    this.modalidadesService.getModalidadeById(this.idModalidade).subscribe((res) => {
      this.modalidadeForm.patchValue({
        dadosGerais: {
          idEstabelecimento: res.estabelecimentoId,
          nome: res.nome,
          descricao: res.descricao ?? '',
          ativo: res.ativo,
        },
      });

      this.modalidadesService.getEstabelecimento(res.estabelecimentoId).subscribe((estabelecimento) => {
        this.estabelecimento.set(estabelecimento);
      });
    });

    if (this.unitScoped) {
      this.loadOfertaNaUnidade();
    }
  }

  private loadOfertaNaUnidade(): void {
    this.ofertaLoading.set(true);

    this.unidadesService.getUnidadeById(this.idUnidade).subscribe((unidade) => {
      this.unidade.set(unidade);
    });

    this.unidadeModalidadesService.getModalidadesVinculadas(this.idUnidade).subscribe({
      next: (vinculos) => {
        const vinculo = vinculos.find((item) => item.modalidadeId === this.idModalidade);

        if (vinculo) {
          this.idUnidadeModalidade = vinculo.id;
          this.modalidadeForm.controls.oferta.patchValue({
            capacidadePadrao: vinculo.capacidadePadrao ?? null,
            descricao: vinculo.descricao ?? '',
            ativo: vinculo.ativo,
          });
        }

        this.ofertaLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar a oferta desta modalidade na unidade', error);
        this.ofertaLoading.set(false);
      },
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

    if (!this.isEditMode) {
      this.modalidadesService.registerModalidade(this.toRequest()).subscribe({
        next: () => this.onSaveSuccess(),
        error: (error) => {
          console.error('Erro ao salvar modalidade', error);
          this.submitError.set('Não foi possível cadastrar a modalidade.');
          this.submitLoading.set(false);
        },
      });
      return;
    }

    this.modalidadesService.updateModalidade(this.idModalidade, this.toRequest()).subscribe({
      next: () => {
        if (this.unitScoped && this.idUnidadeModalidade) {
          this.updateOfertaNaUnidade();
          return;
        }

        this.onSaveSuccess();
      },
      error: (error) => {
        console.error('Erro ao salvar modalidade', error);
        this.submitError.set('Não foi possível atualizar a modalidade.');
        this.submitLoading.set(false);
      },
    });
  }

  private updateOfertaNaUnidade(): void {
    this.unidadeModalidadesService.updateUnidadeModalidade(this.idUnidadeModalidade, this.toOfertaRequest()).subscribe({
      next: () => this.onSaveSuccess(),
      error: (error) => {
        console.error('Erro ao atualizar a oferta desta modalidade na unidade', error);
        this.submitError.set('A modalidade foi atualizada, mas não foi possível atualizar a oferta desta unidade.');
        this.submitLoading.set(false);
      },
    });
  }

  private onSaveSuccess(): void {
    this.toastService.success(this.isEditMode ? 'Modalidade atualizada com sucesso!' : 'Modalidade cadastrada com sucesso!');

    if (this.unitScoped) {
      this.router.navigate(['/estabelecimentos', this.idEstabelecimento, this.idUnidade], {
        queryParams: { tab: 'modalidades' },
      });
    } else if (this.idEstabelecimento) {
      this.router.navigate(['/estabelecimentos', this.idEstabelecimento], {
        queryParams: { tab: 'modalidades' },
      });
    } else {
      this.router.navigate(['/modalidades']);
    }
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

  private toOfertaRequest(): UnidadeModalidadeForm {
    const { oferta } = this.modalidadeForm.getRawValue();

    return {
      idUnidade: this.idUnidade,
      idModalidade: this.idModalidade,
      descricao: oferta.descricao || undefined,
      capacidadePadrao: oferta.capacidadePadrao ?? undefined,
      ativo: oferta.ativo ?? true,
    };
  }

  private searchEstabelecimentos(value: string): void {
    this.estabelecimentoSearchTerms.next(value.trim());
  }

  private readEstabelecimentoId(): string {
    return this.readRouteParam('idEstabelecimento');
  }

  private readRouteParam(paramName: string): string {
    for (const routeSnapshot of this.route.snapshot.pathFromRoot) {
      const value = routeSnapshot.paramMap.get(paramName);

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
