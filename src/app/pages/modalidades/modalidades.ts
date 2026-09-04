import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';
import { ModalidadesService } from './modalidades.service';
import { ModalidadeGeralListagemDto } from '../estabelecimentos/types/types';

@Component({
  selector: 'app-modalidades-geral',
  imports: [Breadcrumb, RouterLink],
  templateUrl: './modalidades.html',
  styleUrl: './modalidades.scss',
})
export class Modalidades implements OnInit {
  private readonly modalidadesService = inject(ModalidadesService);

  readonly filteredModalidades = signal<ModalidadeGeralListagemDto[]>([]);
  readonly filterValue = signal('');

  ngOnInit(): void {
    this.getModalidades('');
  }

  getModalidades(busca: string): void {
    this.modalidadesService.getModalidadesGeral(busca).subscribe((res) => {
      this.filteredModalidades.set(res.content);
    });
  }

  updateFilter(value: string): void {
    this.filterValue.set(value);
    this.getModalidades(value);
  }

  clearFilter(): void {
    this.filterValue.set('');
    this.getModalidades('');
  }

  formatStatus(ativo: boolean): string {
    return ativo ? 'Ativa' : 'Inativa';
  }

  hiddenCount(values: unknown[]): number {
    return Math.max(values.length - 1, 0);
  }
}
