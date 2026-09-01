export interface ProfessorListagemDto {
  idProfessor: number;
  nome: string;
  cpf: string;
  email: string;
  contato: string;
  unidades: string[];
  modalidades: string[];
  status: ProfessorStatus;
}

export interface PageDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  empty: boolean;
}

export interface ProfessorDetalheDto {
  idProfessor: number;
  nome: string;
  cpf: string;
  email: string;
  contato: string;
  dataNascimento: string | null;
  sexo: string | null;
  endereco: ProfessorDetalheEnderecoDto | null;
  registroProfissional: string | null;
  observacoes: string | null;
  codigoInterno: string | null;
  ativoAtuacao: boolean | null;
  unidades: ProfessorDetalheUnidadeDto[];
  modalidades: string[];
  status: ProfessorStatus;
}

export interface ProfessorDetalheEnderecoDto {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface ProfessorDetalheUnidadeDto {
  estabelecimento: string;
  unidade: string;
}

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
  status: ProfessorStatus;
}

export interface ProfessorAtuacao {
  estabelecimentoId: number;
  unidadeId: number;
  codigoInterno: string;
  modalidades?: number[];
  ativo: boolean;
}
