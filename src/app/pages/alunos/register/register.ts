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
import { Wizard, WizardStepContent } from '../../../components/wizard/wizard';
import { WizardStep } from '../../../components/wizard/types/types';
import { ToastService } from '../../../components/toast/toast.service';
import { Estabelecimento, PlanoUnidade, Unidade } from '../../estabelecimentos/types/types';
import { EstabelecimentosService } from '../../estabelecimentos/estabelecimentos.service';
import { UnidadesService } from '../../unidades/unidades.service';
import { UnidadePlanosService } from '../../unidade-planos/unidade-planos.service';
import { AlunosService } from '../alunos.service';
import { AlunoForm, MatriculaStatus } from '../types';

interface PlanoOption {
  id: string;
  unidadeId: string;
  nome: string;
  valor: string;
}

interface UnidadeSearchParams {
  idEstabelecimento: string;
  busca: string;
}

@Component({
  selector: 'app-aluno-register',
  imports: [Breadcrumb, Wizard, WizardStepContent, ReactiveFormsModule, ErrorMessageControl],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class AlunoRegister {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly estabelecimentosService = inject(EstabelecimentosService);
  private readonly unidadesService = inject(UnidadesService);
  private readonly unidadePlanosService = inject(UnidadePlanosService);
  private readonly alunosService = inject(AlunosService);
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
  protected readonly planosDaUnidade = signal<PlanoOption[]>([]);
  protected readonly planosLoading = signal(false);
  protected readonly submitLoading = signal(false);
  protected readonly submitError = signal('');

  public readonly sexoOptions = ['Feminino', 'Masculino', 'Outro'];
  public readonly matriculaStatusOptions: MatriculaStatus[] = [
    'ATIVA',
    'PENDENTE',
    'TRANCADA',
    'CANCELADA',
    'ENCERRADA',
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
  public readonly alunoForm = this.fb.group({
    dadosPessoais: this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(150)]],
      cpf: ['', [Validators.required, AlunoRegister.cpfValidator]],
      dataNascimento: [null as Date | null, [Validators.required]],
      sexo: [null as string | null],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)]],
      ativo: [true, [AlunoRegister.booleanRequiredValidator]],
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

    matricula: this.fb.group({
      estabelecimentoId: ['', [Validators.required]],
      unidadeId: ['', [Validators.required]],
      planoId: ['', [Validators.required]],
      dataInicio: [null as Date | null, [Validators.required]],
      dataFim: [null as Date | null],
      diaVencimento: ['', [Validators.required, AlunoRegister.diaVencimentoValidator]],
      status: ['ATIVA' as MatriculaStatus, [Validators.required]],
      motivoCancelamento: [''],
    }),
  });

  public readonly registerSteps = signal<WizardStep[]>([
    {
      label: 'Dados Pessoais',
      description: 'Preencha os dados pessoais do aluno',
      icon: 'pi pi-user',
      completed: false,
    },
    {
      label: 'Endereço',
      description: 'Informe o endereço residencial do aluno',
      icon: 'pi pi-map-marker',
      completed: false,
    },
    {
      label: 'Matrícula',
      description: 'Selecione a unidade, o plano e as condições iniciais da matrícula',
      icon: 'pi pi-file-edit',
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
          this.unidadesService.getUnidades(idEstabelecimento, busca).pipe(
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

  protected updateEstabelecimentoSearch(value: string): void {
    this.estabelecimentoSearch.set(value);
    this.estabelecimentoDropdownOpen.set(true);
    this.searchEstabelecimentos(value);

    if (value !== this.selectedEstabelecimento()?.nomeFantasia) {
      this.clearMatriculaSelection(false);
    }
  }

  protected selectEstabelecimento(estabelecimento: Estabelecimento): void {
    const matricula = this.alunoForm.controls.matricula.controls;

    matricula.estabelecimentoId.setValue(estabelecimento.id);
    matricula.estabelecimentoId.markAsTouched();
    matricula.unidadeId.reset('');
    matricula.planoId.reset('');
    this.selectedEstabelecimentoId.set(estabelecimento.id);
    this.selectedUnidadeId.set('');
    this.estabelecimentoSearch.set(estabelecimento.nomeFantasia);
    this.unidadeSearch.set('');
    this.estabelecimentoDropdownOpen.set(false);
    this.unidadeDropdownOpen.set(true);
    this.planosDaUnidade.set([]);
    this.searchUnidades('', estabelecimento.id);
  }

  protected updateUnidadeSearch(value: string): void {
    this.unidadeSearch.set(value);
    this.unidadeDropdownOpen.set(!!this.selectedEstabelecimento());

    if (value !== this.selectedUnidade()?.nome) {
      this.alunoForm.controls.matricula.controls.unidadeId.reset('');
      this.alunoForm.controls.matricula.controls.planoId.reset('');
      this.selectedUnidadeId.set('');
      this.planosDaUnidade.set([]);
    }

    this.searchUnidades(value);
  }

  protected selectUnidade(unidade: Unidade): void {
    const matricula = this.alunoForm.controls.matricula.controls;

    matricula.unidadeId.setValue(unidade.id);
    matricula.unidadeId.markAsTouched();
    matricula.planoId.reset('');
    this.selectedUnidadeId.set(unidade.id);
    this.unidadeSearch.set(unidade.nome);
    this.unidadeDropdownOpen.set(false);
    this.loadPlanos(unidade.id);
  }

  protected clearEstabelecimentoSelection(): void {
    this.clearMatriculaSelection(true);
    this.alunoForm.controls.matricula.controls.estabelecimentoId.markAsTouched();
    this.alunoForm.controls.matricula.controls.unidadeId.markAsTouched();
    this.alunoForm.controls.matricula.controls.planoId.markAsTouched();
  }

  protected clearUnidadeSelection(): void {
    const matricula = this.alunoForm.controls.matricula.controls;

    matricula.unidadeId.reset('');
    matricula.unidadeId.markAsTouched();
    matricula.planoId.reset('');
    matricula.planoId.markAsTouched();
    this.selectedUnidadeId.set('');
    this.unidadeSearch.set('');
    this.unidadeDropdownOpen.set(false);
    this.planosDaUnidade.set([]);
    this.searchUnidades('');
  }

  protected closeEstabelecimentoDropdown(): void {
    this.alunoForm.controls.matricula.controls.estabelecimentoId.markAsTouched();
    this.estabelecimentoDropdownOpen.set(false);
  }

  protected closeUnidadeDropdown(): void {
    this.alunoForm.controls.matricula.controls.unidadeId.markAsTouched();
    this.unidadeDropdownOpen.set(false);
  }

  public applyCpfMask(): void {
    const control = this.alunoForm.controls.dadosPessoais.controls.cpf;

    control.setValue(this.formatCpf(control.value), { emitEvent: false });
  }

  public applyTelefoneMask(): void {
    const control = this.alunoForm.controls.dadosPessoais.controls.telefone;

    control.setValue(this.formatTelefone(control.value), { emitEvent: false });
  }

  public applyCepMask(): void {
    const control = this.alunoForm.controls.endereco.controls.cep;

    control.setValue(this.formatCep(control.value), { emitEvent: false });
  }

  public applyNumeroMask(): void {
    const control = this.alunoForm.controls.endereco.controls.numero;

    control.setValue(this.onlyDigits(control.value), { emitEvent: false });
  }

  public applyDiaVencimentoMask(): void {
    const control = this.alunoForm.controls.matricula.controls.diaVencimento;

    control.setValue(this.onlyDigits(control.value).slice(0, 2), { emitEvent: false });
  }

  public submitAluno(): void {
    if (this.alunoForm.invalid) {
      this.alunoForm.markAllAsTouched();
      return;
    }

    this.submitLoading.set(true);
    this.submitError.set('');

    this.alunosService.registerAluno(this.toRequest()).subscribe({
      next: () => {
        this.toastService.success('Aluno cadastrado com sucesso!');
        this.router.navigate(['/alunos']);
      },
      error: (error) => {
        console.error('Erro ao cadastrar aluno', error);
        this.submitError.set('Não foi possível cadastrar o aluno.');
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

  public displayEstabelecimento(): string {
    return this.selectedEstabelecimento()?.nomeFantasia ?? '-';
  }

  public displayUnidade(): string {
    return this.selectedUnidade()?.nome ?? '-';
  }

  public displayPlano(): string {
    const plano = this.findPlanoById(this.alunoForm.controls.matricula.controls.planoId.value);

    return plano ? `${plano.nome} · ${plano.valor}` : '-';
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

  protected formatStatus(value: string | null): string {
    return value
      ? value.toLowerCase().replace(/^\w/, (char) => char.toUpperCase())
      : '-';
  }

  private toRequest(): AlunoForm {
    const { dadosPessoais, endereco, matricula } = this.alunoForm.getRawValue();

    return {
      dadosPessoais: {
        nome: dadosPessoais.nome ?? '',
        cpf: dadosPessoais.cpf ?? '',
        dataNascimento: dadosPessoais.dataNascimento as unknown as string,
        sexo: dadosPessoais.sexo || undefined,
        email: dadosPessoais.email ?? '',
        telefone: dadosPessoais.telefone ?? '',
        ativo: dadosPessoais.ativo ?? true,
      },
      endereco: {
        cep: endereco.cep ?? '',
        logradouro: endereco.logradouro ?? '',
        numero: endereco.numero ?? '',
        complemento: endereco.complemento || undefined,
        bairro: endereco.bairro ?? '',
        cidade: endereco.cidade ?? '',
        uf: endereco.uf ?? '',
      },
      matricula: {
        planoUnidadeId: matricula.planoId ?? '',
        dataInicio: matricula.dataInicio as unknown as string,
        dataFim: (matricula.dataFim as unknown as string) || undefined,
        diaVencimento: Number(matricula.diaVencimento),
        status: matricula.status ?? 'ATIVA',
        motivoCancelamento: matricula.motivoCancelamento || undefined,
      },
    };
  }

  private clearMatriculaSelection(clearEstabelecimentoSearch: boolean): void {
    const matricula = this.alunoForm.controls.matricula.controls;

    matricula.estabelecimentoId.reset('');
    matricula.unidadeId.reset('');
    matricula.planoId.reset('');
    this.selectedEstabelecimentoId.set('');
    this.selectedUnidadeId.set('');
    if (clearEstabelecimentoSearch) {
      this.estabelecimentoSearch.set('');
    }
    this.unidadeSearch.set('');
    this.estabelecimentoDropdownOpen.set(false);
    this.unidadeDropdownOpen.set(false);
    this.planosDaUnidade.set([]);
    this.unidades.set([]);
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

  private findEstabelecimentoById(id: string | null): Estabelecimento | undefined {
    return this.estabelecimentos().find((estabelecimento) => estabelecimento.id === id);
  }

  private findUnidadeById(id: string | null): Unidade | undefined {
    return this.unidades().find((unidade) => unidade.id === id);
  }

  private findPlanoById(id: string | null): PlanoOption | undefined {
    return this.planosDaUnidade().find((plano) => plano.id === id);
  }

  private loadPlanos(idUnidade: string): void {
    this.planosLoading.set(true);

    this.unidadePlanosService.getPlanosVinculados(idUnidade).subscribe({
      next: (res) => {
        this.planosDaUnidade.set(res.map((vinculo) => this.toPlanoOption(vinculo)));
        this.planosLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar planos da unidade', error);
        this.planosDaUnidade.set([]);
        this.planosLoading.set(false);
      },
    });
  }

  private toPlanoOption(vinculo: PlanoUnidade): PlanoOption {
    return {
      id: vinculo.id,
      unidadeId: vinculo.unidadeId,
      nome: vinculo.nomeExibicao || vinculo.planoNome,
      valor: this.formatCurrency(vinculo.valor),
    };
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  private static booleanRequiredValidator(control: AbstractControl<boolean | null>): ValidationErrors | null {
    return typeof control.value === 'boolean' ? null : { required: true };
  }

  private static diaVencimentoValidator(control: AbstractControl<string | null>): ValidationErrors | null {
    const value = Number(control.value);

    if (!control.value) {
      return null;
    }

    return Number.isInteger(value) && value >= 1 && value <= 31
      ? null
      : { invalidDay: true };
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
    const firstCheckDigit = AlunoRegister.calculateCpfCheckDigit(digits.slice(0, 9));
    const secondCheckDigit = AlunoRegister.calculateCpfCheckDigit(digits.slice(0, 10));

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
