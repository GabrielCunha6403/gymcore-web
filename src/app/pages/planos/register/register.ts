import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';

import { Breadcrumb } from '../../../components/breadcrumb/breadcrumb';
import { ErrorMessageControl } from '../../../components/error-message-control/error-message-control';
import { ToastService } from '../../../components/toast/toast.service';
import { Wizard, WizardStepContent } from '../../../components/wizard/wizard';
import { WizardStep } from '../../../components/wizard/types/types';
import {
  Estabelecimento,
  PlanoForm,
  PlanoUnidadeForm,
  TipoCobranca,
  Unidade,
  UnidadeModalidade,
} from '../../estabelecimentos/types/types';
import { PlanosService } from '../planos.service';
import { UnidadeModalidadesService } from '../../unidade-modalidades/unidade-modalidades.service';
import { UnidadePlanosService } from '../../unidade-planos/unidade-planos.service';

interface UnidadeSearchParams {
  idEstabelecimento: string;
  busca: string;
}

@Component({
  selector: 'app-plano-geral-register',
  imports: [Breadcrumb, Wizard, WizardStepContent, ReactiveFormsModule, ErrorMessageControl],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class PlanoGeralRegister {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly planosService = inject(PlanosService);
  private readonly unidadePlanosService = inject(UnidadePlanosService);
  private readonly unidadeModalidadesService = inject(UnidadeModalidadesService);
  private readonly estabelecimentoSearchTerms = new Subject<string>();
  private readonly unidadeSearchTerms = new Subject<UnidadeSearchParams>();

  protected readonly submitLoading = signal(false);
  protected readonly submitError = signal('');

  protected readonly estabelecimentoSearch = signal('');
  protected readonly unidadeSearch = signal('');
  protected readonly estabelecimentoDropdownOpen = signal(false);
  protected readonly unidadeDropdownOpen = signal(false);
  protected readonly selectedEstabelecimentoId = signal('');
  protected readonly selectedUnidadeId = signal('');
  protected readonly estabelecimentos = signal<Estabelecimento[]>([]);
  protected readonly estabelecimentosLoading = signal(false);
  protected readonly estabelecimentosSearchError = signal(false);
  protected readonly unidades = signal<Unidade[]>([]);
  protected readonly unidadesLoading = signal(false);
  protected readonly unidadesSearchError = signal(false);
  protected readonly modalidadesDaUnidade = signal<UnidadeModalidade[]>([]);
  protected readonly modalidadesLoading = signal(false);

  public readonly tipoCobrancaOptions: { value: TipoCobranca; label: string }[] = [
    { value: 'MENSAL', label: 'Mensal' },
    { value: 'RECORRENTE', label: 'Recorrente' },
    { value: 'UNICO', label: 'Único' },
  ];

  public readonly planoForm = this.fb.group({
    vinculo: this.fb.group({
      estabelecimentoId: ['', [Validators.required]],
      unidadeId: ['', [Validators.required]],
    }),

    dadosPlano: this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(120)]],
      descricao: ['', [Validators.maxLength(1000)]],
      ativo: [true, [PlanoGeralRegister.booleanRequiredValidator]],
    }),

    oferta: this.fb.group({
      nomeExibicao: ['', [Validators.required, Validators.maxLength(120)]],
      descricao: ['', [Validators.maxLength(1000)]],
      valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
      duracaoMeses: [null as number | null, [Validators.min(1)]],
      tipoCobranca: [null as TipoCobranca | null, [Validators.required]],
      taxaAdesao: [null as number | null, [Validators.min(0)]],
      diaVencimentoPadrao: [null as number | null, [Validators.required, Validators.min(1), Validators.max(31)]],
      ativo: [true, [PlanoGeralRegister.booleanRequiredValidator]],
      modalidades: this.fb.control<string[]>([], { nonNullable: true }),
    }),
  });

  public readonly registerSteps = signal<WizardStep[]>([
    {
      label: 'Vínculo',
      description: 'Selecione o estabelecimento e a unidade que oferecerão o plano',
      icon: 'pi pi-sitemap',
      completed: false,
    },
    {
      label: 'Dados do plano',
      description: 'Identifique o plano que será oferecido pelo estabelecimento',
      icon: 'pi pi-wallet',
      completed: false,
    },
    {
      label: 'Oferta na unidade',
      description: 'Defina preço, cobrança e modalidades contempladas nesta unidade',
      icon: 'pi pi-dollar',
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
          this.planosService.getEstabelecimentos(busca).pipe(
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

    this.unidadeSearchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (previous, current) =>
            previous.idEstabelecimento === current.idEstabelecimento &&
            previous.busca === current.busca,
        ),
        tap(() => {
          this.unidadesLoading.set(true);
          this.unidadesSearchError.set(false);
        }),
        switchMap(({ idEstabelecimento, busca }) =>
          this.planosService.getUnidades(idEstabelecimento, busca).pipe(
            catchError((error) => {
              console.error('Erro ao buscar unidades', error);
              this.unidadesSearchError.set(true);
              return of([]);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((unidades) => {
        this.unidades.set(unidades);
        this.unidadesLoading.set(false);
      });

    this.searchEstabelecimentos('');
  }

  protected readonly filteredEstabelecimentos = computed(() => this.estabelecimentos());

  protected readonly filteredUnidades = computed(() => this.unidades());

  protected readonly selectedEstabelecimento = computed(() =>
    this.findEstabelecimentoById(this.selectedEstabelecimentoId()),
  );

  protected readonly selectedUnidade = computed(() =>
    this.findUnidadeById(this.selectedUnidadeId()),
  );

  public toggleModalidade(idVinculo: string, checked: boolean): void {
    const control = this.planoForm.controls.oferta.controls.modalidades;
    const modalidades = control.value;

    control.setValue(
      checked
        ? Array.from(new Set([...modalidades, idVinculo]))
        : modalidades.filter((item) => item !== idVinculo),
    );
    control.markAsTouched();
  }

  public isModalidadeSelected(idVinculo: string): boolean {
    return this.planoForm.controls.oferta.controls.modalidades.value.includes(idVinculo);
  }

  public displaySelectedModalidades(): string {
    const selecionadas = this.planoForm.controls.oferta.controls.modalidades.value;
    const nomes = this.modalidadesDaUnidade()
      .filter((modalidade) => selecionadas.includes(modalidade.id))
      .map((modalidade) => modalidade.modalidadeNome);

    return nomes.length ? nomes.join(', ') : '-';
  }

  protected updateEstabelecimentoSearch(value: string): void {
    this.estabelecimentoSearch.set(value);
    this.estabelecimentoDropdownOpen.set(true);
    this.searchEstabelecimentos(value);

    if (value !== this.selectedEstabelecimento()?.nomeFantasia) {
      this.clearVinculoSelection(false);
    }
  }

  protected selectEstabelecimento(estabelecimento: Estabelecimento): void {
    const vinculo = this.planoForm.controls.vinculo.controls;

    vinculo.estabelecimentoId.setValue(estabelecimento.id);
    vinculo.estabelecimentoId.markAsTouched();
    vinculo.unidadeId.reset('');
    this.planoForm.controls.oferta.controls.modalidades.setValue([]);
    this.selectedEstabelecimentoId.set(estabelecimento.id);
    this.selectedUnidadeId.set('');
    this.estabelecimentoSearch.set(estabelecimento.nomeFantasia);
    this.unidadeSearch.set('');
    this.estabelecimentoDropdownOpen.set(false);
    this.unidadeDropdownOpen.set(true);
    this.modalidadesDaUnidade.set([]);
    this.searchUnidades('', estabelecimento.id);
  }

  protected updateUnidadeSearch(value: string): void {
    this.unidadeSearch.set(value);
    this.unidadeDropdownOpen.set(!!this.selectedEstabelecimentoId());

    if (value !== this.selectedUnidade()?.nome) {
      this.planoForm.controls.vinculo.controls.unidadeId.reset('');
      this.planoForm.controls.oferta.controls.modalidades.setValue([]);
      this.selectedUnidadeId.set('');
      this.modalidadesDaUnidade.set([]);
    }

    this.searchUnidades(value);
  }

  protected selectUnidade(unidade: Unidade): void {
    const vinculo = this.planoForm.controls.vinculo.controls;

    vinculo.unidadeId.setValue(unidade.id);
    vinculo.unidadeId.markAsTouched();
    this.planoForm.controls.oferta.controls.modalidades.setValue([]);
    this.selectedUnidadeId.set(unidade.id);
    this.unidadeSearch.set(unidade.nome);
    this.unidadeDropdownOpen.set(false);
    this.loadModalidades(unidade.id);
  }

  protected clearEstabelecimentoSelection(): void {
    this.clearVinculoSelection(true);
    this.planoForm.controls.vinculo.controls.estabelecimentoId.markAsTouched();
    this.planoForm.controls.vinculo.controls.unidadeId.markAsTouched();
  }

  protected clearUnidadeSelection(): void {
    const vinculo = this.planoForm.controls.vinculo.controls;

    vinculo.unidadeId.reset('');
    vinculo.unidadeId.markAsTouched();
    this.planoForm.controls.oferta.controls.modalidades.setValue([]);
    this.selectedUnidadeId.set('');
    this.unidadeSearch.set('');
    this.unidadeDropdownOpen.set(false);
    this.modalidadesDaUnidade.set([]);
    this.searchUnidades('');
  }

  protected closeEstabelecimentoDropdown(): void {
    this.planoForm.controls.vinculo.controls.estabelecimentoId.markAsTouched();
    this.estabelecimentoDropdownOpen.set(false);
  }

  protected closeUnidadeDropdown(): void {
    this.planoForm.controls.vinculo.controls.unidadeId.markAsTouched();
    this.unidadeDropdownOpen.set(false);
  }

  public submitPlano(): void {
    if (this.planoForm.invalid) {
      this.planoForm.markAllAsTouched();
      return;
    }

    this.submitLoading.set(true);
    this.submitError.set('');

    this.planosService.registerPlano(this.toPlanoRequest()).subscribe({
      next: (res) => {
        this.vincularOferta(res.planoId);
      },
      error: (error) => {
        console.error('Erro ao cadastrar plano', error);
        this.submitError.set('Não foi possível cadastrar o plano.');
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

  public displayCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }

    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  public displayTipoCobranca(value: TipoCobranca | null | undefined): string {
    return this.tipoCobrancaOptions.find((option) => option.value === value)?.label ?? '-';
  }

  public displayEstabelecimento(): string {
    return this.selectedEstabelecimento()?.nomeFantasia ?? '-';
  }

  public displayUnidade(): string {
    return this.selectedUnidade()?.nome ?? '-';
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

  private vincularOferta(idPlano: string): void {
    this.unidadePlanosService.vincularPlano(this.toOfertaRequest(idPlano)).subscribe({
      next: () => {
        this.toastService.success('Plano cadastrado e vinculado com sucesso!');
        this.router.navigate(['/planos']);
      },
      error: (error) => {
        console.error('Erro ao vincular plano à unidade', error);
        this.submitError.set('O plano foi cadastrado, mas não foi possível vinculá-lo à unidade selecionada.');
        this.submitLoading.set(false);
      },
    });
  }

  private toPlanoRequest(): PlanoForm {
    const { vinculo, dadosPlano } = this.planoForm.getRawValue();

    return {
      idEstabelecimento: vinculo.estabelecimentoId ?? '',
      nome: dadosPlano.nome ?? '',
      descricao: dadosPlano.descricao || undefined,
      ativo: dadosPlano.ativo ?? true,
    };
  }

  private toOfertaRequest(idPlano: string): PlanoUnidadeForm {
    const { vinculo, oferta } = this.planoForm.getRawValue();

    return {
      idUnidade: vinculo.unidadeId ?? '',
      idPlano,
      nomeExibicao: oferta.nomeExibicao ?? '',
      descricao: oferta.descricao || undefined,
      valor: oferta.valor ?? 0,
      duracaoMeses: oferta.duracaoMeses ?? undefined,
      tipoCobranca: oferta.tipoCobranca ?? 'MENSAL',
      taxaAdesao: oferta.taxaAdesao ?? undefined,
      diaVencimentoPadrao: oferta.diaVencimentoPadrao ?? undefined,
      ativo: oferta.ativo ?? true,
      modalidades: oferta.modalidades?.length ? oferta.modalidades : undefined,
    };
  }

  private clearVinculoSelection(clearEstabelecimentoSearch: boolean): void {
    const vinculo = this.planoForm.controls.vinculo.controls;

    vinculo.estabelecimentoId.reset('');
    vinculo.unidadeId.reset('');
    this.planoForm.controls.oferta.controls.modalidades.setValue([]);
    this.selectedEstabelecimentoId.set('');
    this.selectedUnidadeId.set('');
    this.unidades.set([]);
    this.modalidadesDaUnidade.set([]);
    if (clearEstabelecimentoSearch) {
      this.estabelecimentoSearch.set('');
    }
    this.unidadeSearch.set('');
    this.estabelecimentoDropdownOpen.set(false);
    this.unidadeDropdownOpen.set(false);
  }

  private findEstabelecimentoById(id: string | null): Estabelecimento | undefined {
    return this.estabelecimentos().find((estabelecimento) => estabelecimento.id === id);
  }

  private findUnidadeById(id: string | null): Unidade | undefined {
    return this.unidades().find((unidade) => unidade.id === id);
  }

  private searchEstabelecimentos(value: string): void {
    this.estabelecimentoSearchTerms.next(value.trim());
  }

  private searchUnidades(value: string, idEstabelecimento = this.selectedEstabelecimentoId()): void {
    if (!idEstabelecimento) {
      this.unidades.set([]);
      this.unidadesLoading.set(false);
      this.unidadesSearchError.set(false);
      return;
    }

    this.unidadeSearchTerms.next({
      idEstabelecimento,
      busca: value.trim(),
    });
  }

  private loadModalidades(idUnidade: string): void {
    this.modalidadesLoading.set(true);

    this.unidadeModalidadesService.getModalidadesVinculadas(idUnidade).subscribe({
      next: (res) => {
        this.modalidadesDaUnidade.set(res);
        this.modalidadesLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar modalidades da unidade', error);
        this.modalidadesDaUnidade.set([]);
        this.modalidadesLoading.set(false);
      },
    });
  }

  private static booleanRequiredValidator(
    control: AbstractControl<boolean | null>,
  ): ValidationErrors | null {
    return typeof control.value === 'boolean' ? null : { required: true };
  }
}
