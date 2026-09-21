import {Component, computed, inject, OnInit, signal} from '@angular/core';
import { RouterLink } from '@angular/router';

import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import { ToastService } from '../../components/toast/toast.service';
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
  private readonly toastService = inject(ToastService);

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

  onInativarEstabelecimento(idEstabelecimento: string): void {
    this.estabelecimentoService.inativarEstabelecimento(idEstabelecimento).subscribe({
      next: () => {
        this.toastService.success('Estabelecimento inativado com sucesso!');
        this.listEstabelecimentos(this.filterValue());
      },
      error: (error) => {
        console.error('Erro ao inativar estabelecimento', error);
      },
    });
  }
}
