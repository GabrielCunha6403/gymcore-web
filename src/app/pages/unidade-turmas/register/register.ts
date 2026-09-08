import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Breadcrumb } from '../../../components/breadcrumb/breadcrumb';
import { ErrorMessageControl } from '../../../components/error-message-control/error-message-control';
import { ToastService } from '../../../components/toast/toast.service';
import { Wizard, WizardStepContent } from '../../../components/wizard/wizard';
import { WizardStep } from '../../../components/wizard/types/types';
import { TurmaForm, Unidade, UnidadeModalidade } from '../../estabelecimentos/types/types';
import { ProfessorListagemDto } from '../../professores/types/types';
import { ProfessoresService } from '../../professores/professores.service';
import { UnidadeModalidadesService } from '../../unidade-modalidades/unidade-modalidades.service';
import { UnidadesService } from '../../unidades/unidades.service';
import { UnidadeTurmasService } from '../unidade-turmas.service';

type HorarioFormGroup = FormGroup<{
  diaSemana: FormControl<number | null>;
  horaInicio: FormControl<string | null>;
  horaFim: FormControl<string | null>;
}>;

const DIA_SEMANA_OPTIONS = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

@Component({
  selector: 'app-turma-register',
  imports: [Breadcrumb, RouterLink, Wizard, WizardStepContent, ReactiveFormsModule, ErrorMessageControl],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class TurmaRegister implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly unidadesService = inject(UnidadesService);
  private readonly professoresService = inject(ProfessoresService);
  private readonly unidadeModalidadesService = inject(UnidadeModalidadesService);
  private readonly unidadeTurmasService = inject(UnidadeTurmasService);

  private readonly idEstabelecimento = this.readRouteParam('idEstabelecimento');
  private readonly idUnidade = this.readRouteParam('idUnidade');

  protected readonly backLink = ['/estabelecimentos', this.idEstabelecimento, this.idUnidade];
  protected readonly backQueryParams = { tab: 'turmas' };

  protected readonly submitLoading = signal(false);
  protected readonly submitError = signal('');
  protected readonly submitEmptyHorariosError = signal(false);
  protected readonly unidade = signal<Unidade | null>(null);
  protected readonly modalidades = signal<UnidadeModalidade[]>([]);
  protected readonly modalidadesLoading = signal(true);
  protected readonly professores = signal<ProfessorListagemDto[]>([]);
  protected readonly professoresLoading = signal(true);

  protected readonly unidadeNome = computed(() => this.unidade()?.nome ?? `Unidade ${this.idUnidade}`.trim());

  public readonly diaSemanaOptions = DIA_SEMANA_OPTIONS;

  public readonly turmaForm = this.fb.group({
    dadosTurma: this.fb.group({
      idUnidadeModalidade: ['', [Validators.required]],
      idProfessor: ['', [Validators.required]],
      nome: ['', [Validators.required, Validators.maxLength(120)]],
      capacidade: [null as number | null, [Validators.required, Validators.min(1)]],
      ativo: [true, [TurmaRegister.booleanRequiredValidator]],
    }),

    horarios: this.fb.array<HorarioFormGroup>([]),
  });

  public readonly registerSteps = signal<WizardStep[]>([
    {
      label: 'Turma',
      description: 'Selecione a modalidade e o professor responsável',
      icon: 'pi pi-users',
      completed: false,
    },
    {
      label: 'Horários',
      description: 'Defina os horários recorrentes da turma',
      icon: 'pi pi-clock',
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
    this.addHorario();
  }

  ngOnInit(): void {
    if (!this.idUnidade) {
      return;
    }

    this.unidadesService.getUnidadeById(this.idUnidade).subscribe((res) => {
      this.unidade.set(res);
    });

    this.unidadeModalidadesService.getModalidadesVinculadas(this.idUnidade).subscribe({
      next: (res) => {
        this.modalidades.set(res.filter((modalidade) => modalidade.ativo));
        this.modalidadesLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar modalidades da unidade', error);
        this.modalidades.set([]);
        this.modalidadesLoading.set(false);
      },
    });

    this.professoresService.getProfessoresPorUnidade(this.idUnidade).subscribe({
      next: (res) => {
        this.professores.set(res);
        this.professoresLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao buscar professores da unidade', error);
        this.professores.set([]);
        this.professoresLoading.set(false);
      },
    });
  }

  protected get horariosArray(): FormArray<HorarioFormGroup> {
    return this.turmaForm.controls.horarios;
  }

  public addHorario(): void {
    this.horariosArray.push(this.fb.group({
      diaSemana: [null as number | null, [Validators.required]],
      horaInicio: ['', [Validators.required]],
      horaFim: ['', [Validators.required]],
    }));
    this.submitEmptyHorariosError.set(false);
  }

  public removeHorario(index: number): void {
    this.horariosArray.removeAt(index);
  }

  public onModalidadeChange(idUnidadeModalidade: string): void {
    const capacidadeControl = this.turmaForm.controls.dadosTurma.controls.capacidade;

    if (capacidadeControl.value) {
      return;
    }

    const modalidade = this.modalidades().find((item) => item.id === idUnidadeModalidade);

    if (modalidade?.capacidadePadrao) {
      capacidadeControl.setValue(modalidade.capacidadePadrao);
    }
  }

  public submitTurma(): void {
    if (this.turmaForm.invalid || this.horariosArray.length === 0) {
      this.turmaForm.markAllAsTouched();
      this.submitEmptyHorariosError.set(this.horariosArray.length === 0);
      return;
    }

    this.submitLoading.set(true);
    this.submitError.set('');

    this.unidadeTurmasService.registerTurma(this.toRequest()).subscribe({
      next: () => {
        this.toastService.success('Turma cadastrada com sucesso!');
        this.router.navigate(['/estabelecimentos', this.idEstabelecimento, this.idUnidade], {
          queryParams: { tab: 'turmas' },
        });
      },
      error: (error) => {
        console.error('Erro ao cadastrar turma', error);
        this.submitError.set(error?.error?.message ?? 'Não foi possível cadastrar a turma.');
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
    const idUnidadeModalidade = this.turmaForm.controls.dadosTurma.controls.idUnidadeModalidade.value;

    return this.modalidades().find((item) => item.id === idUnidadeModalidade)?.modalidadeNome ?? '-';
  }

  public displayProfessor(): string {
    const idProfessor = this.turmaForm.controls.dadosTurma.controls.idProfessor.value;

    return this.professores().find((item) => String(item.idProfessor) === idProfessor)?.nome ?? '-';
  }

  public displayHorarios(): string {
    if (!this.horariosArray.length) {
      return '-';
    }

    return this.horariosArray.controls
      .map((horario) => {
        const { diaSemana, horaInicio, horaFim } = horario.getRawValue();
        const label = this.diaSemanaOptions.find((option) => option.value === diaSemana)?.label ?? '-';

        return `${label} ${horaInicio || '--:--'}-${horaFim || '--:--'}`;
      })
      .join(', ');
  }

  private toRequest(): TurmaForm {
    const { dadosTurma } = this.turmaForm.getRawValue();

    return {
      idUnidadeModalidade: dadosTurma.idUnidadeModalidade ?? '',
      idProfessor: dadosTurma.idProfessor ?? '',
      nome: dadosTurma.nome ?? '',
      capacidade: dadosTurma.capacidade ?? 0,
      ativo: dadosTurma.ativo ?? true,
      horarios: this.horariosArray.controls.map((horario) => {
        const raw = horario.getRawValue();

        return {
          diaSemana: raw.diaSemana as number,
          horaInicio: raw.horaInicio ?? '',
          horaFim: raw.horaFim ?? '',
        };
      }),
    };
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
