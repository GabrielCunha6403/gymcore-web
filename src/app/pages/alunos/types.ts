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
  | 'TRANCADA'
  | 'CANCELADA'
  | 'ENCERRADA';

export interface AlunoForm {
  dadosPessoais: AlunoFormDadosPessoais;
  endereco: AlunoFormEndereco;
  matricula: AlunoFormMatricula;
}

export interface AlunoFormDadosPessoais {
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo?: string;
  email: string;
  telefone: string;
  ativo: boolean;
}

export interface AlunoFormEndereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface AlunoFormMatricula {
  planoUnidadeId: string;
  dataInicio: string;
  dataFim?: string;
  diaVencimento: number;
  status: MatriculaStatus;
  motivoCancelamento?: string;
}

export interface PageDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  empty: boolean;
}

export interface AlunoListagemDto {
  idAluno: number;
  nome: string;
  cpf: string;
  email: string;
  contato: string;
  ativo: boolean;
  unidades: string[];
  planoAtual: string | null;
  modalidades: string[];
  matricula: AlunoMatriculaResumoDto | null;
}

export interface AlunoMatriculaResumoDto {
  idMatricula: number;
  dataInicio: string;
  diaVencimento: number;
  status: MatriculaStatus;
}

export interface AlunoDetalheDto {
  idAluno: number;
  nome: string;
  cpf: string;
  email: string;
  contato: string;
  dataNascimento: string | null;
  sexo: string | null;
  endereco: AlunoDetalheEnderecoDto | null;
  ativo: boolean;
  unidades: AlunoDetalheUnidadeDto[];
  modalidades: string[];
  matricula: AlunoDetalheMatriculaDto | null;
}

export interface AlunoDetalheEnderecoDto {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface AlunoDetalheUnidadeDto {
  estabelecimento: string;
  unidade: string;
}

export interface AlunoDetalheMatriculaDto {
  idMatricula: number;
  unidade: string;
  plano: string;
  dataInicio: string;
  dataFim: string | null;
  diaVencimento: number;
  status: MatriculaStatus;
  motivoCancelamento: string | null;
}

export type MensalidadeStatus =
  | 'PENDENTE'
  | 'PAGA'
  | 'VENCIDA'
  | 'CANCELADA';

export interface MensalidadeListagemDto {
  idMensalidade: number;
  competencia: string;
  dataVencimento: string;
  valorOriginal: number;
  valorDesconto: number | null;
  multa: number | null;
  juros: number | null;
  valorTotal: number;
  status: MensalidadeStatus;
}

export interface FrequenciaListagemDto {
  idFrequencia: number;
  unidade: string | null;
  dataHoraEntrada: string;
  dataHoraSaida: string | null;
}
