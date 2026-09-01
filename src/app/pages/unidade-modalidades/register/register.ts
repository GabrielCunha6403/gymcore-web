import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
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
import { Modalidade, Unidade, UnidadeModalidadeForm } from '../../estabelecimentos/types/types';
import { ModalidadesService } from '../../modalidades/modalidades.service';
import { UnidadesService } from '../../unidades/unidades.service';
import { UnidadeModalidadesService } from '../unidade-modalidades.service';

@Component({
  selector: 'app-unidade-modalidade-register',
  imports: [Breadcrumb, Wizard, WizardStepContent, ReactiveFormsModule, ErrorMessageControl],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class UnidadeModalidadeRegister implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  private readonly unidadesService = inject(UnidadesService);
  private readonly modalidadesService = inject(ModalidadesService);
  private readonly unidadeModalidadesService = inject(UnidadeModalidadesService);
  private readonly modalidadeSearchTerms = new Subject<string>();

  private readonly idEstabelecimento = this.readRouteParam('idEstabelecimento');
  private readonly idUnidade = this.readRouteParam('idUnidade');

  protected readonly submitLoading = signal(false);
  protected readonly submitError = signal('');
  protected readonly unidade = signal<Unidade | null>(null);

  protected readonly modalidades = signal<Modalidade[]>([]);
  protected readonly modalidadesLoading = signal(false);
  protected readonly modalidadesSearchError = signal(false);
  protected readonly vinculadasIds = signal<Set<string>>(new Set());

  protected readonly modalidadeSearch = signal('');
  protected readonly modalidadeDropdownOpen = signal(false);
  protected readonly selectedModalidade = signal<Modalidade | null>(null);

  protected readonly unidadeNome = computed(() => this.unidade()?.nome ?? `Unidade ${this.idUnidade}`.trim());

  public readonly vinculoForm = this.fb.group({
    dadosVinculo: this.fb.group({
      idModalidade: ['', [Validators.required]],
      descricao: ['', [Validators.maxLength(1000)]],
      capacidadePadrao: [null as number | null, [Validators.min(1)]],
      ativo: [true, [UnidadeModalidadeRegister.booleanRequiredValidator]],
    }),
  });

  public readonly registerSteps = signal<WizardStep[]>([
    {
      label: 'Modalidade',
      description: 'Selecione a modalidade do estabelecimento a ser vinculada a esta unidade',
      icon: 'pi pi-tags',
      completed: false,
    },
    {
      label: 'Confirmação',
      description: 'Revise as informações antes de salvar o vínculo',
      icon: 'pi pi-check-circle',
      completed: false,
    },
  ]);

  constructor() {
    this.modalidadeSearchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.modalidadesLoading.set(true);
          this.modalidadesSearchError.set(false);
        }),
        switchMap((busca) =>
          this.modalidadesService.getModalidades(this.idEstabelecimento, busca).pipe(
            catchError((error) => {
              console.error('Erro ao buscar modalidades', error);
              this.modalidadesSearchError.set(true);
              return of([]);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((modalidades) => {
        this.modalidades.set(modalidades);
        this.modalidadesLoading.set(false);
      });

    this.searchModalidades('');
  }

  ngOnInit(): void {
    this.unidadesService.getUnidadeById(this.idUnidade).subscribe((res) => {
      this.unidade.set(res);
    });

    this.unidadeModalidadesService.getModalidadesVinculadas(this.idUnidade).subscribe((res) => {
      this.vinculadasIds.set(new Set(res.map((vinculo) => vinculo.modalidadeId)));
    });
  }

  protected isVinculada(modalidade: Modalidade): boolean {
    return this.vinculadasIds().has(modalidade.id);
  }

  protected updateModalidadeSearch(value: string): void {
    this.modalidadeSearch.set(value);
    this.modalidadeDropdownOpen.set(true);
    this.searchModalidades(value);

    if (value !== this.selectedModalidade()?.nome) {
      this.vinculoForm.controls.dadosVinculo.controls.idModalidade.reset('');
      this.selectedModalidade.set(null);
    }
  }

  protected selectModalidade(modalidade: Modalidade): void {
    if (this.isVinculada(modalidade)) {
      return;
    }

    const control = this.vinculoForm.controls.dadosVinculo.controls.idModalidade;

    control.setValue(modalidade.id);
    control.markAsTouched();
    this.selectedModalidade.set(modalidade);
    this.modalidadeSearch.set(modalidade.nome);
    this.modalidadeDropdownOpen.set(false);
  }

  protected clearModalidadeSelection(): void {
    this.vinculoForm.controls.dadosVinculo.controls.idModalidade.reset('');
    this.vinculoForm.controls.dadosVinculo.controls.idModalidade.markAsTouched();
    this.selectedModalidade.set(null);
    this.modalidadeSearch.set('');
    this.modalidadeDropdownOpen.set(false);
    this.searchModalidades('');
  }

  protected closeModalidadeDropdown(): void {
    this.vinculoForm.controls.dadosVinculo.controls.idModalidade.markAsTouched();
    this.modalidadeDropdownOpen.set(false);
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

  public submitVinculo(): void {
    if (this.vinculoForm.invalid) {
      this.vinculoForm.markAllAsTouched();
      return;
    }

    this.submitLoading.set(true);
    this.submitError.set('');

    this.unidadeModalidadesService.vincularModalidade(this.toRequest()).subscribe({
      next: () => {
        this.toastService.success('Modalidade vinculada com sucesso!');
        this.router.navigate(['/estabelecimentos', this.idEstabelecimento, this.idUnidade], {
          queryParams: { tab: 'modalidades' },
        });
      },
      error: (error) => {
        console.error('Erro ao vincular modalidade', error);
        this.submitError.set('Não foi possível vincular a modalidade a esta unidade.');
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

  public displayModalidade(): string {
    return this.selectedModalidade()?.nome ?? '-';
  }

  private toRequest(): UnidadeModalidadeForm {
    const { dadosVinculo } = this.vinculoForm.getRawValue();

    return {
      idUnidade: this.idUnidade,
      idModalidade: dadosVinculo.idModalidade ?? '',
      descricao: dadosVinculo.descricao || undefined,
      capacidadePadrao: dadosVinculo.capacidadePadrao ?? undefined,
      ativo: dadosVinculo.ativo ?? true,
    };
  }

  private searchModalidades(value: string): void {
    this.modalidadeSearchTerms.next(value.trim());
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
