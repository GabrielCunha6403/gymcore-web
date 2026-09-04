export interface Estabelecimento {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  imagemUrl?: string;
  cnpj: string;
  email: string;
  telefone: string;
  site?: string;
  status: StatusEstabelecimento;
  quantidadeUnidades: number;
}

export interface Unidade {
  id: string;
  estabelecimentoId: string;
  nome: string;
  imagemUrl?: string;
  cnpj: string;
  tipo: TipoEstabelecimento;
  email: string;
  telefone: string;
  endereco: Endereco;
  status: StatusEstabelecimento;
  matriz?: boolean;
}

export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export type TipoEstabelecimento =
  | 'ACADEMIA'
  | 'STUDIO'
  | 'BOX'
  | 'CENTRO_ESPORTIVO'
  | 'ARTES_MARCIAIS'
  | 'OUTRO';

export type StatusEstabelecimento =
  | 'ATIVO'
  | 'INATIVO'
  | 'BLOQUEADO';

export type EstabelecimentoViewMode = 'list' | 'cards';

export interface EstabelecimentoForm {
  nome: string;
  razaoSocial: string;
  email: string;
  telefone: string;
  site?: string;
  logoUrl?: string;
  tipo: TipoEstabelecimento;
  status?: StatusEstabelecimento;
  ativo?: boolean;
}

export interface UnidadeForm {
  idEstabelecimento: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: Endereco;
  ativo?: boolean;
}

export interface Modalidade {
  id: string;
  estabelecimentoId: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface ModalidadeForm {
  idEstabelecimento: string;
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface ModalidadeGeralListagemDto {
  idModalidade: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  estabelecimentoNome: string;
  unidades: string[];
  professores: string[];
}

export interface PageDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  empty: boolean;
}

export interface UnidadeModalidade {
  id: string;
  unidadeId: string;
  modalidadeId: string;
  modalidadeNome: string;
  modalidadeDescricao?: string;
  modalidadeAtivo: boolean;
  descricao?: string;
  capacidadePadrao?: number;
  ativo: boolean;
}

export interface UnidadeModalidadeForm {
  idUnidade: string;
  idModalidade: string;
  descricao?: string;
  capacidadePadrao?: number;
  ativo?: boolean;
}

export interface Plano {
  id: string;
  estabelecimentoId: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface PlanoForm {
  idEstabelecimento: string;
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export type TipoCobranca =
  | 'MENSAL'
  | 'RECORRENTE'
  | 'UNICO';

export interface PlanoUnidade {
  id: string;
  unidadeId: string;
  planoId: string;
  planoNome: string;
  planoDescricao?: string;
  planoAtivo: boolean;
  nomeExibicao: string;
  descricao?: string;
  valor: number;
  duracaoMeses?: number;
  tipoCobranca?: TipoCobranca;
  taxaAdesao?: number;
  diaVencimentoPadrao?: number;
  ativo: boolean;
  modalidades?: string[];
}

export interface PlanoUnidadeForm {
  idUnidade: string;
  idPlano: string;
  nomeExibicao: string;
  descricao?: string;
  valor: number;
  duracaoMeses?: number;
  tipoCobranca: TipoCobranca;
  taxaAdesao?: number;
  diaVencimentoPadrao?: number;
  ativo?: boolean;
  modalidades?: string[];
}

export interface UnidadeHorarioFuncionamento {
  diaSemana: number;
  horaAbertura: string | null;
  horaFechamento: string | null;
}

export interface UnidadeHorarioFuncionamentoForm {
  idUnidade: string;
  horarios: {
    diaSemana: number;
    horaAbertura?: string;
    horaFechamento?: string;
  }[];
}
