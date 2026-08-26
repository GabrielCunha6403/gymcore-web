export interface Aluno {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  contato: string;
  fotoUrl?: string;
  status: AlunoStatus;
  unidades: AlunoUnidade[];
  planoAtual: string;
  modalidades: string[];
  matricula: AlunoMatriculaResumo;
}

export interface AlunoUnidade {
  estabelecimento: string;
  unidade: string;
}

export interface AlunoMatriculaResumo {
  codigo: string;
  dataInicio: string;
  vencimento: number;
  status: MatriculaStatus;
}

export type AlunoStatus =
  | 'ATIVO'
  | 'INATIVO'
  | 'PENDENTE';

export type MatriculaStatus =
  | 'ATIVA'
  | 'PENDENTE'
  | 'CANCELADA'
  | 'ENCERRADA';
