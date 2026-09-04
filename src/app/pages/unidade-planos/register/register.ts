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
import { PlanoForm, PlanoUnidadeForm, TipoCobranca, Unidade, UnidadeModalidade } from '../../estabelecimentos/types/types';
import { PlanosService } from '../../planos/planos.service';
import { UnidadesService } from '../../unidades/unidades.service';
import { UnidadeModalidadesService } from '../../unidade-modalidades/unidade-modalidades.service';
import { UnidadePlanosService } from '../unidade-planos.service';

@Component({
  selector: 'app-plano-register',
  imports: [Breadcrumb, Wizard, WizardStepContent, ReactiveFormsModule, ErrorMessageControl],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class PlanoRegister implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly unidadesService = inject(UnidadesService);
  private readonly planosService = inject(PlanosService);
  private readonly unidadePlanosService = inject(UnidadePlanosService);
  private readonly unidadeModalidadesService = inject(UnidadeModalidadesService);

  private readonly idEstabelecimento = this.readRouteParam('idEstabelecimento');
  private readonly idUnidade = this.readRouteParam('idUnidade');

  protected readonly submitLoading = signal(false);
  protected readonly submitError = signal('');
  protected readonly unidade = signal<Unidade | null>(null);
  protected readonly modalidadesDaUnidade = signal<UnidadeModalidade[]>([]);
  protected readonly modalidadesLoading = signal(false);

  protected readonly unidadeNome = computed(() => this.unidade()?.nome ?? `Unidade ${this.idUnidade}`.trim());

  public readonly tipoCobrancaOptions: { value: TipoCobranca; label: string }[] = [
    { value: 'MENSAL', label: 'Mensal' },
    { value: 'RECORRENTE', label: 'Recorrente' },
    { value: 'UNICO', label: 'Único' },
  ];

  public readonly planoForm = this.fb.group({
    dadosPlano: this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(120)]],
      descricao: ['', [Validators.maxLength(1000)]],
      ativo: [true, [PlanoRegister.booleanRequiredValidator]],
    }),

    oferta: this.fb.group({
      nomeExibicao: ['', [Validators.required, Validators.maxLength(120)]],
      descricao: ['', [Validators.maxLength(1000)]],
      valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
      duracaoMeses: [null as number | null, [Validators.min(1)]],
      tipoCobranca: [null as TipoCobranca | null, [Validators.required]],
      taxaAdesao: [null as number | null, [Validators.min(0)]],
      diaVencimentoPadrao: [null as number | null, [Validators.required, Validators.min(1), Validators.max(31)]],
      ativo: [true, [PlanoRegister.booleanRequiredValidator]],
      modalidades: this.fb.control<string[]>([], { nonNullable: true }),
    }),
  });

  public readonly registerSteps = signal<WizardStep[]>([
    {
      label: 'Dados do plano',
      description: 'Identifique o plano que será oferecido pelo estabelecimento',
      icon: 'pi pi-wallet',
      completed: false,
    },
    {
      label: 'Oferta na unidade',
      description: 'Defina preço, cobrança e condições do plano nesta unidade',
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

  ngOnInit(): void {
    if (!this.idUnidade) {
      return;
    }

    this.unidadesService.getUnidadeById(this.idUnidade).subscribe((res) => {
      this.unidade.set(res);
    });

    this.modalidadesLoading.set(true);

    this.unidadeModalidadesService.getModalidadesVinculadas(this.idUnidade).subscribe({
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

  private vincularOferta(idPlano: string): void {
    this.unidadePlanosService.vincularPlano(this.toOfertaRequest(idPlano)).subscribe({
      next: () => {
        this.toastService.success('Plano cadastrado e vinculado com sucesso!');
        this.router.navigate(['/estabelecimentos', this.idEstabelecimento, this.idUnidade], {
          queryParams: { tab: 'planos' },
        });
      },
      error: (error) => {
        console.error('Erro ao vincular plano à unidade', error);
        this.submitError.set('O plano foi cadastrado, mas não foi possível vinculá-lo a esta unidade.');
        this.submitLoading.set(false);
      },
    });
  }

  private toPlanoRequest(): PlanoForm {
    const { dadosPlano } = this.planoForm.getRawValue();

    return {
      idEstabelecimento: this.idEstabelecimento,
      nome: dadosPlano.nome ?? '',
      descricao: dadosPlano.descricao || undefined,
      ativo: dadosPlano.ativo ?? true,
    };
  }

  private toOfertaRequest(idPlano: string): PlanoUnidadeForm {
    const { oferta } = this.planoForm.getRawValue();

    return {
      idUnidade: this.idUnidade,
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
