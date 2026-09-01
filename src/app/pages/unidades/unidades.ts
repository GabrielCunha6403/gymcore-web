import {Component, computed, inject, OnInit, signal} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import { Estabelecimento, EstabelecimentoViewMode, Modalidade, Unidade } from '../estabelecimentos/types/types';
import { ModalidadeItem } from '../modalidades/components/modalidade-item/modalidade-item';
import { ModalidadesService } from '../modalidades/modalidades.service';
import { UnidadeItem } from './components/unidade-item/unidade-item';
import {UnidadesService} from './unidades.service';

type EstabelecimentoDetailTabId = 'unidades' | 'modalidades';

interface EstabelecimentoDetailTab {
  id: EstabelecimentoDetailTabId;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-detail',
  imports: [
    Breadcrumb,
    UnidadeItem,
    ModalidadeItem,
    RouterLink,
  ],
  templateUrl: './unidades.html',
  styleUrl: './unidades.scss',
})
export class Unidades implements OnInit{
  private readonly route = inject(ActivatedRoute);
  private readonly idEstabelecimento = this.getRouteParam('idEstabelecimento');
  private readonly unidadesService = inject(UnidadesService);
  private readonly modalidadesService = inject(ModalidadesService);

  readonly tabs: EstabelecimentoDetailTab[] = [
    { id: 'unidades', label: 'Unidades', icon: 'pi-sitemap' },
    { id: 'modalidades', label: 'Modalidades', icon: 'pi-tags' },
  ];

  readonly activeTab = signal<EstabelecimentoDetailTabId>('unidades');
  readonly estabelecimento = signal<Estabelecimento | null>(null);
  readonly viewMode = signal<EstabelecimentoViewMode>('list');
  readonly filterValue = signal('');
  readonly filteredUnidades = signal<Unidade[]>([]);
  readonly filteredModalidades = signal<Modalidade[]>([]);
  readonly estabelecimentoInitials = computed(() => {
    const estabelecimento = this.estabelecimento();

    if (!estabelecimento) {
      return 'ND';
    }

    const [firstWord = '', secondWord = ''] = estabelecimento.nomeFantasia.trim().split(/\s+/);

    return `${firstWord.charAt(0)}${secondWord.charAt(0) || firstWord.charAt(1) || ''}`.toUpperCase();
  });
  readonly formattedUnits = computed(() => {
    const total = this.filteredUnidades().length;
    return `${total} ${total === 1 ? 'unidade' : 'unidades'}`;
  });

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('tab') === 'modalidades') {
      this.activeTab.set('modalidades');
    }

    this.getEstabelecimento(this.idEstabelecimento);
    this.getUnidades(this.idEstabelecimento);
    this.getModalidades('');
  }

  getUnidades(busca: string) {
    this.unidadesService.getUnidades(this.idEstabelecimento, busca).subscribe(res => {
      this.filteredUnidades.set(res);
    });
  }

  getModalidades(busca: string) {
    this.modalidadesService.getModalidades(this.idEstabelecimento, busca).subscribe(res => {
      this.filteredModalidades.set(res);
    });
  }

  getEstabelecimento(idEstabelecimento: string) {
    this.unidadesService.getEstabelecimento(idEstabelecimento).subscribe(res => {
      this.estabelecimento.set(res);
    });
  }

  setActiveTab(tabId: EstabelecimentoDetailTabId): void {
    this.activeTab.set(tabId);
    this.clearFilter();
  }

  setViewMode(mode: EstabelecimentoViewMode): void {
    this.viewMode.set(mode);
  }

  updateFilter(value: string): void {
    if (this.activeTab() === 'modalidades') {
      this.getModalidades(value);
      return;
    }

    this.getUnidades(value);
  }

  clearFilter(): void {
    this.filterValue.set('');
  }

  private getRouteParam(paramName: string): string {
    for (const routeSnapshot of this.route.snapshot.pathFromRoot) {
      const value = routeSnapshot.paramMap.get(paramName);

      if (value) {
        return value;
      }
    }

    return '';
  }
}
