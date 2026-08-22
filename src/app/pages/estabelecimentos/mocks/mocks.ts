import { Estabelecimento, Unidade } from '../types/types';

export const ESTABELECIMENTOS_MOCK: Estabelecimento[] = [
  {
    id: '1',
    nomeFantasia: 'PowerFit',
    razaoSocial: 'PowerFit Academia LTDA',
    imagemUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=300&q=80',
    cnpj: '12.345.678/0001-90',
    email: 'contato@powerfit.com.br',
    telefone: '(85) 99999-1234',
    site: 'www.powerfit.com.br',
    status: 'ATIVO',
    quantidadeUnidades: 3
  },
  {
    id: '2',
    nomeFantasia: 'Move Studio',
    razaoSocial: 'Move Studio Fitness LTDA',
    cnpj: '23.456.789/0001-01',
    email: 'contato@movestudio.com.br',
    telefone: '(85) 98888-4321',
    status: 'ATIVO',
    quantidadeUnidades: 2
  },
  {
    id: '3',
    nomeFantasia: 'Iron Box',
    razaoSocial: 'Iron Box Treinamento LTDA',
    cnpj: '34.567.890/0001-12',
    email: 'contato@ironbox.com.br',
    telefone: '(85) 97777-5678',
    status: 'INATIVO',
    quantidadeUnidades: 1
  },
  {
    id: '4',
    nomeFantasia: 'Zenith Wellness',
    razaoSocial: 'Zenith Wellness Center LTDA',
    cnpj: '45.678.901/0001-23',
    email: 'contato@zenithwellness.com.br',
    telefone: '(85) 96666-3322',
    site: 'www.zenithwellness.com.br',
    status: 'ATIVO',
    quantidadeUnidades: 4
  },
  {
    id: '5',
    nomeFantasia: 'Arena Kids',
    razaoSocial: 'Arena Kids Esporte e Lazer LTDA',
    cnpj: '56.789.012/0001-34',
    email: 'contato@arenakids.com.br',
    telefone: '(85) 95555-7788',
    status: 'BLOQUEADO',
    quantidadeUnidades: 2
  },
  {
    id: '6',
    nomeFantasia: 'Pulse Performance',
    razaoSocial: 'Pulse Performance Treinamento LTDA',
    cnpj: '67.890.123/0001-45',
    email: 'contato@pulseperformance.com.br',
    telefone: '(85) 94444-2211',
    status: 'ATIVO',
    quantidadeUnidades: 5
  },
];

export const UNIDADES_MOCK: Unidade[] = [
  {
    id: '1-1',
    estabelecimentoId: '1',
    nome: 'PowerFit Aldeota',
    cnpj: '12.345.678/0001-90',
    tipo: 'ACADEMIA',
    email: 'aldeota@powerfit.com.br',
    telefone: '(85) 99999-1234',
    status: 'ATIVO',
    matriz: true,
    endereco: {
      cep: '60150-160',
      logradouro: 'Av. Santos Dumont',
      numero: '1500',
      bairro: 'Aldeota',
      cidade: 'Fortaleza',
      uf: 'CE'
    }
  },
  {
    id: '1-2',
    estabelecimentoId: '1',
    nome: 'PowerFit Sul',
    cnpj: '12.345.678/0002-70',
    tipo: 'ACADEMIA',
    email: 'sul@powerfit.com.br',
    telefone: '(85) 98888-1234',
    status: 'ATIVO',
    endereco: {
      cep: '60833-540',
      logradouro: 'Av. Oliveira Paiva',
      numero: '2222',
      bairro: 'Cidade dos Funcionários',
      cidade: 'Fortaleza',
      uf: 'CE'
    }
  },
  {
    id: '2-1',
    estabelecimentoId: '2',
    nome: 'Move Studio Meireles',
    cnpj: '23.456.789/0001-01',
    tipo: 'STUDIO',
    email: 'meireles@movestudio.com.br',
    telefone: '(85) 98888-4321',
    status: 'ATIVO',
    matriz: true,
    endereco: {
      cep: '60175-047',
      logradouro: 'Rua Silva Jatahy',
      numero: '850',
      complemento: 'Sala 02',
      bairro: 'Meireles',
      cidade: 'Fortaleza',
      uf: 'CE'
    }
  },
  {
    id: '3-1',
    estabelecimentoId: '3',
    nome: 'Iron Box Sul',
    cnpj: '34.567.890/0001-12',
    tipo: 'BOX',
    email: 'contato@ironbox.com.br',
    telefone: '(85) 97777-5678',
    status: 'INATIVO',
    matriz: true,
    endereco: {
      cep: '60811-341',
      logradouro: 'Av. Washington Soares',
      numero: '3200',
      bairro: 'Edson Queiroz',
      cidade: 'Fortaleza',
      uf: 'CE'
    }
  }
];
