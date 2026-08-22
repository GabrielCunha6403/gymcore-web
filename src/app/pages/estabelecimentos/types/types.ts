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
  | 'PILATES'
  | 'CENTRO_ESPORTIVO'
  | 'ARTES_MARCIAIS'
  | 'OUTRO';

export type StatusEstabelecimento =
  | 'ATIVO'
  | 'INATIVO'
  | 'BLOQUEADO';

export type EstabelecimentoViewMode = 'list' | 'cards';
