import {Component, computed, inject, OnInit, signal} from '@angular/core';
import { RouterLink } from '@angular/router';

import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import { EstabelecimentoItem } from './components/estabelecimento-item/estabelecimento-item';
import { Estabelecimento, EstabelecimentoViewMode } from './types/types';
import {EstabelecimentosService} from './estabelecimentos.service';

@Component({
  selector: 'app-estabelecimentos',
  imports: [
    Breadcrumb,
    EstabelecimentoItem,
    RouterLink
  ],
  templateUrl: './estabelecimentos.html',
  styleUrl: './estabelecimentos.scss',
})
export class Estabelecimentos implements OnInit{
  readonly viewMode = signal<EstabelecimentoViewMode>('list');
  readonly filterValue = signal('');
  readonly filteredEstabelecimentos = signal<Estabelecimento[]>([]);

  private readonly estabelecimentoService = inject(EstabelecimentosService);

  ngOnInit(): void {
    this.listEstabelecimentos(this.filterValue());
  }

  listEstabelecimentos(busca: string) {
    this.estabelecimentoService.getEstabelecimentos(busca).subscribe(res => {
      this.filteredEstabelecimentos.set(res);
    });
  }

  setViewMode(mode: EstabelecimentoViewMode): void {
    this.viewMode.set(mode);
  }

  updateFilter(value: string): void {
    this.listEstabelecimentos(value);
  }

  clearFilter(): void {
    this.filterValue.set('');
  }
}
