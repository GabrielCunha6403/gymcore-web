import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { Breadcrumb } from '../../../components/breadcrumb/breadcrumb';
import { ErrorMessageControl } from '../../../components/error-message-control/error-message-control';
import { Wizard, WizardStepContent } from '../../../components/wizard/wizard';
import { WizardStep } from '../../../components/wizard/types/types';
import { ESTABELECIMENTOS_MOCK, UNIDADES_MOCK } from '../../estabelecimentos/mocks/mocks';
import { Estabelecimento, Unidade } from '../../estabelecimentos/types/types';

interface PlanoOption {
  id: string;
  unidadeId: string;
  nome: string;
  valor: string;
}

const PLANOS_POR_UNIDADE: PlanoOption[] = [
  { id: 'plano-1', unidadeId: '1-1', nome: 'Mensal Basic', valor: 'R$ 99,90' },
  { id: 'plano-2', unidadeId: '1-1', nome: 'Mensal Full', valor: 'R$ 149,90' },
  { id: 'plano-3', unidadeId: '1-2', nome: 'Trimestral Performance', valor: 'R$ 399,90' },
  { id: 'plano-4', unidadeId: '2-1', nome: 'Pilates Individual', valor: 'R$ 289,90' },
  { id: 'plano-5', unidadeId: '3-1', nome: 'Cross Training Livre', valor: 'R$ 179,90' },
];

@Component({
  selector: 'app-aluno-register',
  imports: [Breadcrumb, Wizard, WizardStepContent, ReactiveFormsModule, ErrorMessageControl],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class AlunoRegister {
  private readonly fb = inject(FormBuilder);

  protected readonly estabelecimentoSearch = signal('');
  protected readonly unidadeSearch = signal('');
  protected readonly estabelecimentoDropdownOpen = signal(false);
  protected readonly unidadeDropdownOpen = signal(false);
  protected readonly selectedEstabelecimentoId = signal('');
  protected readonly selectedUnidadeId = signal('');

  public readonly sexoOptions = ['Feminino', 'Masculino', 'Outro'];
  public readonly matriculaStatusOptions = ['ATIVA', 'PENDENTE', 'CANCELADA', 'ENCERRADA'];
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
  public readonly estabelecimentos = ESTABELECIMENTOS_MOCK;
  public readonly unidades = UNIDADES_MOCK;

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
      codigoMatricula: ['', [Validators.required]],
      dataInicio: [null as Date | null, [Validators.required]],
      dataFim: [null as Date | null],
      diaVencimento: ['', [Validators.required, AlunoRegister.diaVencimentoValidator]],
      status: ['ATIVA', [Validators.required]],
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

  protected readonly filteredEstabelecimentos = computed(() => {
    const term = this.normalizeSearch(this.estabelecimentoSearch());

    if (!term) {
      return this.estabelecimentos;
    }

    return this.estabelecimentos.filter((estabelecimento) =>
      this.normalizeSearch(
        `${estabelecimento.nomeFantasia} ${estabelecimento.razaoSocial} ${estabelecimento.cnpj}`,
      ).includes(term),
    );
  });

  protected readonly unidadesDoEstabelecimento = computed(() => {
    const estabelecimentoId = this.selectedEstabelecimentoId();

    if (!estabelecimentoId) {
      return [];
    }

    return this.unidades.filter((unidade) => unidade.estabelecimentoId === estabelecimentoId);
  });

  protected readonly filteredUnidades = computed(() => {
    const term = this.normalizeSearch(this.unidadeSearch());
    const unidades = this.unidadesDoEstabelecimento();

    if (!term) {
      return unidades;
    }

    return unidades.filter((unidade) =>
      this.normalizeSearch(
        `${unidade.nome} ${unidade.tipo} ${unidade.endereco.bairro} ${unidade.endereco.cidade}`,
      ).includes(term),
    );
  });

  protected readonly planosDaUnidade = computed(() => {
    const unidadeId = this.selectedUnidadeId();

    return unidadeId ? PLANOS_POR_UNIDADE.filter((plano) => plano.unidadeId === unidadeId) : [];
  });

  protected readonly selectedEstabelecimento = computed(() =>
    this.findEstabelecimentoById(this.selectedEstabelecimentoId()),
  );

  protected readonly selectedUnidade = computed(() =>
    this.findUnidadeById(this.selectedUnidadeId()),
  );

  protected updateEstabelecimentoSearch(value: string): void {
    this.estabelecimentoSearch.set(value);
    this.estabelecimentoDropdownOpen.set(true);

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
  }

  protected updateUnidadeSearch(value: string): void {
    this.unidadeSearch.set(value);
    this.unidadeDropdownOpen.set(true);

    if (value !== this.selectedUnidade()?.nome) {
      this.alunoForm.controls.matricula.controls.unidadeId.reset('');
      this.alunoForm.controls.matricula.controls.planoId.reset('');
      this.selectedUnidadeId.set('');
    }
  }

  protected selectUnidade(unidade: Unidade): void {
    const matricula = this.alunoForm.controls.matricula.controls;

    matricula.unidadeId.setValue(unidade.id);
    matricula.unidadeId.markAsTouched();
    matricula.planoId.reset('');
    this.selectedUnidadeId.set(unidade.id);
    this.unidadeSearch.set(unidade.nome);
    this.unidadeDropdownOpen.set(false);
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

    console.log('Aluno cadastrado', this.alunoForm.getRawValue());
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
    return this.estabelecimentos.find((estabelecimento) => estabelecimento.id === id);
  }

  private findUnidadeById(id: string | null): Unidade | undefined {
    return this.unidades.find((unidade) => unidade.id === id);
  }

  private findPlanoById(id: string | null): PlanoOption | undefined {
    return PLANOS_POR_UNIDADE.find((plano) => plano.id === id);
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
