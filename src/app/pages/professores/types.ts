export interface Professor {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  contato: string;
  fotoUrl?: string;
  status: ProfessorStatus;
  unidades: ProfessorUnidade[];
  modalidades: string[];
}

export interface ProfessorUnidade {
  estabelecimento: string;
  unidade: string;
}

export type ProfessorStatus =
  | 'ATIVO'
  | 'INATIVO'
  | 'AFASTADO';
