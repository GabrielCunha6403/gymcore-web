import { Component, computed, input, output, signal } from '@angular/core';
import { Estabelecimento, EstabelecimentoViewMode, StatusEstabelecimento } from '../../types/types';
import {RouterLink} from '@angular/router';
import { Modal } from '../../../../components/modal/modal';

@Component({
  selector: 'app-estabelecimento-item',
  imports: [
    RouterLink,
    Modal,
  ],
  templateUrl: './estabelecimento-item.html',
  styleUrl: './estabelecimento-item.scss',
})
export class EstabelecimentoItem {
  readonly estabelecimento = input.required<Estabelecimento>();
  readonly viewMode = input<EstabelecimentoViewMode>('list');
  readonly inativar = output<string>();

  protected readonly confirmandoInativacao = signal(false);

  protected onDeleteClick(event: Event): void {
    event.stopPropagation();

    this.confirmandoInativacao.set(true);
  }

  protected confirmInativar(): void {
    this.confirmandoInativacao.set(false);
    this.inativar.emit(this.estabelecimento().id);
  }

  readonly initials = computed(() => {
    const [firstWord = '', secondWord = ''] = this.estabelecimento().nomeFantasia.trim().split(/\s+/);
    return `${firstWord.charAt(0)}${secondWord.charAt(0) || firstWord.charAt(1) || ''}`.toUpperCase();
  });

  readonly formattedStatus = computed(() => this.formatStatus(this.estabelecimento().status));
  readonly statusClass = computed(() => {
    const status = this.estabelecimento().status;

    if (status === 'INATIVO') {
      return 'estabelecimento-item-status--inactive';
    }

    if (status === 'BLOQUEADO') {
      return 'estabelecimento-item-status--blocked';
    }

    return 'estabelecimento-item-status--active';
  });
  readonly formattedUnits = computed(() => {
    const total = this.estabelecimento().quantidadeUnidades;
    return `${total} ${total === 1 ? 'unidade' : 'unidades'}`;
  });

  private formatStatus(status: StatusEstabelecimento): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }
}
