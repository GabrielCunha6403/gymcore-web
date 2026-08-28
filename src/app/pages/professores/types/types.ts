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

export interface ProfessorForm {
  dadosPessoais: ProfessorDadosPessoais;
  endereco: ProfessorEndereco;
  profissional: ProfessorProfissional;
  atuacao: ProfessorAtuacao;
}

export interface ProfessorDadosPessoais {
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo?: string;
  email: string;
  telefone: string;
}

export interface ProfessorEndereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface ProfessorProfissional {
  registroProfissional: string;
  observacoes?: string;
  ativo: boolean;
}

export interface ProfessorAtuacao {
  estabelecimentoId: number;
  unidadeId: number;
  codigoInterno: string;
  modalidades?: number[];
  ativo: boolean;
}
