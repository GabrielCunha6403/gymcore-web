import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import { FirstOrDefaultPipe } from '../../pipes/first-or-default';
import { PlanoUnidade, TipoCobranca } from '../estabelecimentos/types/types';
import { UnidadePlanosService } from '../unidade-planos/unidade-planos.service';

@Component({
  selector: 'app-planos',
  imports: [Breadcrumb, RouterLink, FirstOrDefaultPipe],
  templateUrl: './planos.html',
  styleUrl: './planos.scss',
})
export class Planos implements OnInit {
  private readonly unidadePlanosService = inject(UnidadePlanosService);

  readonly filteredPlanos = signal<PlanoUnidade[]>([]);
  readonly filterValue = signal('');

  ngOnInit(): void {
    this.getPlanos('');
  }

  getPlanos(busca: string): void {
    this.unidadePlanosService.getPlanosGeral(busca).subscribe((res) => {
      this.filteredPlanos.set(res);
    });
  }

  updateFilter(value: string): void {
    this.filterValue.set(value);
    this.getPlanos(value);
  }

  clearFilter(): void {
    this.filterValue.set('');
    this.getPlanos('');
  }

  hiddenCount(values: unknown[] | undefined): number {
    return Math.max((values?.length ?? 0) - 1, 0);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  formatTipoCobranca(tipo: TipoCobranca | undefined): string {
    if (!tipo) {
      return '-';
    }

    return tipo
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase());
  }
}
