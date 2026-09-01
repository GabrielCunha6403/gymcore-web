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
import { Wizard, WizardStepContent } from '../../../components/wizard/wizard';
import { WizardStep } from '../../../components/wizard/types/types';
import { ErrorMessageControl } from '../../../components/error-message-control/error-message-control';
import { Estabelecimento, Unidade } from '../../estabelecimentos/types/types';
import {ProfessorForm, ProfessorStatus} from '../types/types';
import {ProfessoresService} from '../professores.service';
import {ToastService} from '../../../components/toast/toast.service';

interface UnidadeSearchParams {
  idEstabelecimento: string;
  busca: string;
}

const UNIDADE_MODALIDADES: Record<string, string[]> = {
  '1-1': ['Musculação', 'Funcional', 'Pilates'],
  '1-2': ['Musculação', 'Lutas', 'Dança'],
  '2-1': ['Pilates', 'Funcional', 'Dança'],
  '3-1': ['Funcional', 'Lutas'],
};

@Component({
  selector: 'app-professor-register',
  imports: [Breadcrumb, Wizard, WizardStepContent, ReactiveFormsModule, ErrorMessageControl],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly professorService = inject(ProfessoresService);
  private readonly estabelecimentoSearchTerms = new Subject<string>();
  private readonly unidadeSearchTerms = new Subject<UnidadeSearchParams>();

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

  public readonly sexoOptions = ['Feminino', 'Masculino', 'Outro'];
  public readonly statusOptions: { value: ProfessorStatus; label: string }[] = [
    { value: 'ATIVO', label: 'Ativo' },
    { value: 'INATIVO', label: 'Inativo' },
    { value: 'AFASTADO', label: 'Afastado' },
  ];
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
  public readonly professorForm = this.fb.group({
    dadosPessoais: this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(150)]],
      cpf: [
        '',
        [
          Validators.required,
          Register.cpfValidator,
        ],
      ],
      dataNascimento: [null as Date | null, [Validators.required]],
      sexo: [null as string | null],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)]],
    }),

    endereco: this.fb.group({
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      logradouro: ['', [Validators.required]],
      numero: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      complemento: [''],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      uf: [null as string | null, [Validators.required]],
    }),

    profissional: this.fb.group({
      registroProfissional: ['', [Validators.required]],
      observacoes: [''],
      status: ['ATIVO' as ProfessorStatus | null, [Validators.required]],
    }),

    atuacao: this.fb.group({
      estabelecimentoId: ['', [Validators.required]],
      unidadeId: ['', [Validators.required]],
      codigoInterno: ['', [Validators.required]],
      modalidades: this.fb.control<string[]>([], {
        nonNullable: true,
      }),
      ativo: [true, [Register.booleanRequiredValidator]],
    }),
  });

  public readonly registerSteps = signal<WizardStep[]>([
    {
      label: 'Dados Pessoais',
      description: 'Preencha os dados pessoais do professor',
      icon: 'pi pi-user',
      completed: false,
    },
    {
      label: 'Endereço',
      description: 'Informe o endereço de contato do professor',
      icon: 'pi pi-map-marker',
      completed: false,
    },
    {
      label: 'Profissional',
      description: 'Adicione os dados profissionais e observações internas',
      icon: 'pi pi-id-card',
      completed: false,
    },
    {
      label: 'Atuação',
      description: 'Selecione o estabelecimento, a unidade e as configurações de atuação',
      icon: 'pi pi-briefcase',
      completed: false,
    },
    {
      label: 'Confirmação',
      description: 'Revise as informações antes de salvar o cadastro',
      icon: 'pi pi-check-circle',
      completed: false,
    }
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
          this.professorService.getEstabelecimentos(busca).pipe(
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
          this.professorService.getUnidades(idEstabelecimento, busca).pipe(
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

  protected readonly modalidadesOptions = computed(() => {
    const unidadeId = this.selectedUnidadeId();

    return unidadeId ? UNIDADE_MODALIDADES[unidadeId] ?? [] : [];
  });

  protected readonly selectedEstabelecimento = computed(() =>
    this.findEstabelecimentoById(this.selectedEstabelecimentoId()),
  );

  protected readonly selectedUnidade = computed(() =>
    this.findUnidadeById(this.selectedUnidadeId()),
  );

  public toggleModalidade(modalidade: string, checked: boolean): void {
    const control = this.professorForm.controls.atuacao.controls.modalidades;
    const modalidades = control.value;

    control.setValue(
      checked
        ? Array.from(new Set([...modalidades, modalidade]))
        : modalidades.filter((item) => item !== modalidade),
    );
    control.markAsTouched();
    control.updateValueAndValidity();
  }

  public isModalidadeSelected(modalidade: string): boolean {
    return this.professorForm.controls.atuacao.controls.modalidades.value.includes(modalidade);
  }

  protected updateEstabelecimentoSearch(value: string): void {
    this.estabelecimentoSearch.set(value);
    this.estabelecimentoDropdownOpen.set(true);
    this.searchEstabelecimentos(value);

    if (value !== this.selectedEstabelecimento()?.nomeFantasia) {
      const atuacao = this.professorForm.controls.atuacao.controls;

      atuacao.estabelecimentoId.reset('');
      atuacao.unidadeId.reset('');
      atuacao.modalidades.setValue([]);
      this.selectedEstabelecimentoId.set('');
      this.selectedUnidadeId.set('');
      this.unidades.set([]);
      this.unidadeSearch.set('');
      this.unidadeDropdownOpen.set(false);
    }
  }

  protected selectEstabelecimento(estabelecimento: Estabelecimento): void {
    const atuacao = this.professorForm.controls.atuacao.controls;

    atuacao.estabelecimentoId.setValue(estabelecimento.id);
    atuacao.estabelecimentoId.markAsTouched();
    atuacao.unidadeId.reset('');
    atuacao.modalidades.setValue([]);
    this.selectedEstabelecimentoId.set(estabelecimento.id);
    this.selectedUnidadeId.set('');
    this.estabelecimentoSearch.set(estabelecimento.nomeFantasia);
    this.unidadeSearch.set('');
    this.estabelecimentoDropdownOpen.set(false);
    this.unidadeDropdownOpen.set(true);
    this.searchUnidades('', estabelecimento.id);
  }

  protected updateUnidadeSearch(value: string): void {
    this.unidadeSearch.set(value);
    this.unidadeDropdownOpen.set(!!this.selectedEstabelecimentoId());

    if (value !== this.selectedUnidade()?.nome) {
      this.professorForm.controls.atuacao.controls.unidadeId.reset('');
      this.professorForm.controls.atuacao.controls.modalidades.setValue([]);
      this.selectedUnidadeId.set('');
    }

    this.searchUnidades(value);
  }

  protected selectUnidade(unidade: Unidade): void {
    const atuacao = this.professorForm.controls.atuacao.controls;

    atuacao.unidadeId.setValue(unidade.id);
    atuacao.unidadeId.markAsTouched();
    atuacao.modalidades.setValue([]);
    this.selectedUnidadeId.set(unidade.id);
    this.unidadeSearch.set(unidade.nome);
    this.unidadeDropdownOpen.set(false);
  }

  protected clearEstabelecimentoSelection(): void {
    this.clearAtuacaoSelection(true);
    this.professorForm.controls.atuacao.controls.estabelecimentoId.markAsTouched();
    this.professorForm.controls.atuacao.controls.unidadeId.markAsTouched();
  }

  protected clearUnidadeSelection(): void {
    const atuacao = this.professorForm.controls.atuacao.controls;

    atuacao.unidadeId.reset('');
    atuacao.unidadeId.markAsTouched();
    atuacao.modalidades.setValue([]);
    this.selectedUnidadeId.set('');
    this.unidadeSearch.set('');
    this.unidadeDropdownOpen.set(false);
    this.searchUnidades('');
  }

  protected closeEstabelecimentoDropdown(): void {
    this.professorForm.controls.atuacao.controls.estabelecimentoId.markAsTouched();
    this.estabelecimentoDropdownOpen.set(false);
  }

  protected closeUnidadeDropdown(): void {
    this.professorForm.controls.atuacao.controls.unidadeId.markAsTouched();
    this.unidadeDropdownOpen.set(false);
  }

  public applyCpfMask(): void {
    const control = this.professorForm.controls.dadosPessoais.controls.cpf;

    control.setValue(this.formatCpf(control.value), { emitEvent: false });
  }

  public applyTelefoneMask(): void {
    const control = this.professorForm.controls.dadosPessoais.controls.telefone;

    control.setValue(this.formatTelefone(control.value), { emitEvent: false });
  }

  public applyCepMask(): void {
    const control = this.professorForm.controls.endereco.controls.cep;

    control.setValue(this.formatCep(control.value), { emitEvent: false });
  }

  public applyNumeroMask(): void {
    const control = this.professorForm.controls.endereco.controls.numero;

    control.setValue(this.onlyDigits(control.value), { emitEvent: false });
  }

  public submitProfessor(): void {
    if (this.professorForm.invalid) {
      this.professorForm.markAllAsTouched();
      return;
    }

    console.log('Professor cadastrado', this.professorForm.getRawValue());

    const professor: ProfessorForm = this.professorForm.getRawValue() as unknown as ProfessorForm;

    this.professorService.registerProfessor(professor).subscribe(res => {
      console.log(res);
      this.router.navigate(['/professores']);
      this.toastService.success("Professor cadastrado com sucesso!");
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

  public displayStatus(value: ProfessorStatus | null | undefined): string {
    return this.statusOptions.find((option) => option.value === value)?.label ?? '-';
  }

  public displayList(values: string[] | null | undefined): string {
    return values?.length ? values.join(', ') : '-';
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

  private formatCpf(value: string | null): string {
    const digits = this.onlyDigits(value).slice(0, 11);

    if (digits.length <= 3) {
      return digits;
    }

    if (digits.length <= 6) {
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }

    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
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

  private clearAtuacaoSelection(clearEstabelecimentoSearch: boolean): void {
    const atuacao = this.professorForm.controls.atuacao.controls;

    atuacao.estabelecimentoId.reset('');
    atuacao.unidadeId.reset('');
    atuacao.modalidades.setValue([]);
    this.selectedEstabelecimentoId.set('');
    this.selectedUnidadeId.set('');
    this.unidades.set([]);
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

  private searchEstabelecimentos(value: string): void {
    this.estabelecimentoSearchTerms.next(value.trim());
  }

  private findUnidadeById(id: string | null): Unidade | undefined {
    return this.unidades().find((unidade) => unidade.id === id);
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

  private normalizeSearch(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private static booleanRequiredValidator(control: AbstractControl<boolean | null>): ValidationErrors | null {
    return typeof control.value === 'boolean' ? null : { required: true };
  }

  private static cpfValidator(control: AbstractControl<string | null>): ValidationErrors | null {
    const cpf = control.value?.replace(/\D/g, '') ?? '';

    if (!cpf) {
      return null;
    }

    if (cpf.length !== 11) {
      return { invalidCpf: true };
    }

    if (/^(\d)\1{10}$/.test(cpf)) {
      return { invalidCpf: true };
    }

    const digits = cpf.split('').map(Number);
    const firstCheckDigit = Register.calculateCpfCheckDigit(digits.slice(0, 9));
    const secondCheckDigit = Register.calculateCpfCheckDigit(digits.slice(0, 10));

    return firstCheckDigit === digits[9] && secondCheckDigit === digits[10]
      ? null
      : { invalidCpf: true };
  }

  private static calculateCpfCheckDigit(digits: number[]): number {
    const factor = digits.length + 1;
    const total = digits.reduce((sum, digit, index) => sum + digit * (factor - index), 0);
    const remainder = (total * 10) % 11;

    return remainder === 10 ? 0 : remainder;
  }
}
