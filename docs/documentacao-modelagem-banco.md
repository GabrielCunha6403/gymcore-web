# Documentação da Modelagem do Banco de Dados

> Documento elaborado a partir do diagrama fornecido. Os nomes das
> tabelas, colunas e tipos seguem o PDF. As descrições explicam o papel
> esperado de cada campo dentro da modelagem representada.

## `estabelecimento`

Representa a organização principal cadastrada no sistema. Um
estabelecimento pode possuir várias unidades.

  -----------------------------------------------------------------------
  Coluna                  Tipo                    Descrição
  ----------------------- ----------------------- -----------------------
  `id_estabelecimento`    `uuid`                  Identificador único do
                                                  estabelecimento.

  `nome`                  `varchar(150)`          Nome de exibição do
                                                  estabelecimento.

  `razao_social`          `varchar(180)`          Razão social da
                                                  organização.

  `email`                 `varchar(150)`          E-mail principal de
                                                  contato.

  `telefone`              `varchar(30)`           Telefone principal de
                                                  contato.

  `site`                  `varchar(200)`          Endereço do site
                                                  institucional.

  `logo_url`              `varchar(500)`          URL da imagem utilizada
                                                  como logotipo.

  `tipo`                  `varchar(40)`           Classificação/tipo do
                                                  estabelecimento.

  `status`                `varchar(30)`           Situação administrativa
                                                  do estabelecimento.

  `ativo`                 `boolean`               Indica se o
                                                  estabelecimento está
                                                  ativo no sistema.

  `created_at`            `timestamp`             Data e hora de criação
                                                  do registro.

  `updated_at`            `timestamp`             Data e hora da última
                                                  atualização.

  `created_by`            `uuid`                  Identificador do
                                                  usuário responsável
                                                  pela criação.

  `updated_by`            `uuid`                  Identificador do
                                                  usuário responsável
                                                  pela última
                                                  atualização.
  -----------------------------------------------------------------------

## `unidade`

Representa uma unidade pertencente a um estabelecimento, concentrando
seus dados próprios de identificação, contato e endereço.

  -----------------------------------------------------------------------
  Coluna                  Tipo                    Descrição
  ----------------------- ----------------------- -----------------------
  `id_unidade`            `uuid`                  Identificador único da
                                                  unidade.

  `id_estabelecimento`    `uuid`                  Estabelecimento ao qual
                                                  a unidade pertence.

  `nome`                  `varchar(150)`          Nome da unidade.

  `cnpj`                  `varchar(14)`           CNPJ associado à
                                                  unidade.

  `email`                 `varchar(150)`          E-mail de contato da
                                                  unidade.

  `telefone`              `varchar(30)`           Telefone de contato da
                                                  unidade.

  `cep`                   `varchar(8)`            CEP do endereço da
                                                  unidade.

  `logradouro`            `varchar(200)`          Logradouro da unidade.

  `numero`                `varchar(30)`           Número do endereço.

  `complemento`           `varchar(100)`          Complemento do
                                                  endereço.

  `bairro`                `varchar(100)`          Bairro da unidade.

  `cidade`                `varchar(100)`          Cidade da unidade.

  `uf`                    `char(2)`               Unidade federativa da
                                                  unidade.

  `ativo`                 `boolean`               Indica se a unidade
                                                  está ativa.

  `created_at`            `timestamp`             Data e hora de criação.

  `updated_at`            `timestamp`             Data e hora da última
                                                  atualização.

  `created_by`            `uuid`                  Usuário responsável
                                                  pela criação.

  `updated_by`            `uuid`                  Usuário responsável
                                                  pela última
                                                  atualização.
  -----------------------------------------------------------------------

## `unidade_horario_funcionamento`

Define os horários de funcionamento de uma unidade por dia da semana.

  ------------------------------------------------------------------------------------
  Coluna                               Tipo                    Descrição
  ------------------------------------ ----------------------- -----------------------
  `id_unidade_horario_funcionamento`   `uuid`                  Identificador único do
                                                               horário de
                                                               funcionamento.

  `id_unidade`                         `uuid`                  Unidade à qual o
                                                               horário pertence.

  `dia_semana`                         `integer`               Dia da semana
                                                               representado pelo
                                                               registro.

  `hora_abertura`                      `time`                  Horário de abertura da
                                                               unidade.

  `hora_fechamento`                    `time`                  Horário de fechamento
                                                               da unidade.

  `created_at`                         `timestamp`             Data e hora de criação.

  `updated_at`                         `timestamp`             Data e hora da última
                                                               atualização.
  ------------------------------------------------------------------------------------

## `pessoa`

Representa os dados gerais de uma pessoa no sistema, independentemente
de ela atuar como aluno, professor ou possuir acesso administrativo.

  -----------------------------------------------------------------------
  Coluna                  Tipo                    Descrição
  ----------------------- ----------------------- -----------------------
  `id_pessoa`             `uuid`                  Identificador único da
                                                  pessoa. Conforme a
                                                  regra definida para o
                                                  sistema, pode
                                                  corresponder ao `sub`
                                                  do usuário criado no
                                                  Keycloak.

  `nome`                  `varchar(150)`          Nome completo da
                                                  pessoa.

  `cpf`                   `varchar(11)`           CPF da pessoa.

  `data_nascimento`       `date`                  Data de nascimento.

  `email`                 `varchar(150)`          E-mail da pessoa.

  `telefone`              `varchar(30)`           Telefone de contato.

  `sexo`                  `varchar(30)`           Sexo informado no
                                                  cadastro.

  `cep`                   `varchar(8)`            CEP residencial.

  `logradouro`            `varchar(200)`          Logradouro residencial.

  `numero`                `varchar(30)`           Número do endereço.

  `complemento`           `varchar(100)`          Complemento do
                                                  endereço.

  `bairro`                `varchar(100)`          Bairro.

  `cidade`                `varchar(100)`          Cidade.

  `uf`                    `char(2)`               Unidade federativa.

  `ativo`                 `boolean`               Indica se a pessoa está
                                                  ativa.

  `created_at`            `timestamp`             Data e hora de criação.

  `updated_at`            `timestamp`             Data e hora da última
                                                  atualização.

  `created_by`            `uuid`                  Usuário responsável
                                                  pela criação.

  `updated_by`            `uuid`                  Usuário responsável
                                                  pela última
                                                  atualização.
  -----------------------------------------------------------------------

## `aluno`

Representa o papel de aluno assumido por uma pessoa.

  Coluna         Tipo          Descrição
  -------------- ------------- -----------------------------------------
  `id_aluno`     `uuid`        Identificador único do aluno.
  `id_pessoa`    `uuid`        Pessoa correspondente ao aluno.
  `ativo`        `boolean`     Indica se o perfil de aluno está ativo.
  `created_at`   `timestamp`   Data e hora de criação.
  `updated_at`   `timestamp`   Data e hora da última atualização.

## `professor`

Representa o papel profissional de professor assumido por uma pessoa.

  -------------------------------------------------------------------------
  Coluna                    Tipo                    Descrição
  ------------------------- ----------------------- -----------------------
  `id_professor`            `uuid`                  Identificador único do
                                                    professor.

  `id_pessoa`               `uuid`                  Pessoa correspondente
                                                    ao professor.

  `registro_profissional`   `varchar(50)`           Registro profissional
                                                    do professor, quando
                                                    aplicável.

  `observacoes`             `text`                  Observações gerais
                                                    sobre o professor.

  `ativo`                   `boolean`               Indica se o perfil
                                                    global de professor
                                                    está ativo.

  `created_at`              `timestamp`             Data e hora de criação.

  `updated_at`              `timestamp`             Data e hora da última
                                                    atualização.
  -------------------------------------------------------------------------

## `modalidade`

Representa uma modalidade cadastrada por um estabelecimento. O cadastro
no estabelecimento não implica que todas as suas unidades ofereçam a
modalidade.

  -----------------------------------------------------------------------
  Coluna                  Tipo                    Descrição
  ----------------------- ----------------------- -----------------------
  `id_modalidade`         `uuid`                  Identificador único da
                                                  modalidade.

  `id_estabelecimento`    `uuid`                  Estabelecimento
                                                  proprietário da
                                                  modalidade.

  `nome`                  `varchar(120)`          Nome da modalidade.

  `descricao`             `text`                  Descrição geral da
                                                  modalidade.

  `ativo`                 `boolean`               Indica se a modalidade
                                                  está ativa.

  `created_at`            `timestamp`             Data e hora de criação.

  `updated_at`            `timestamp`             Data e hora da última
                                                  atualização.

  `created_by`            `uuid`                  Usuário responsável
                                                  pela criação.

  `updated_by`            `uuid`                  Usuário responsável
                                                  pela última
                                                  atualização.
  -----------------------------------------------------------------------

## `unidade_modalidade`

Representa a disponibilização de uma modalidade por uma unidade
específica.

  -------------------------------------------------------------------------
  Coluna                    Tipo                    Descrição
  ------------------------- ----------------------- -----------------------
  `id_unidade_modalidade`   `uuid`                  Identificador único da
                                                    relação entre unidade e
                                                    modalidade.

  `id_unidade`              `uuid`                  Unidade que oferece a
                                                    modalidade.

  `id_modalidade`           `uuid`                  Modalidade
                                                    disponibilizada.

  `descricao`               `text`                  Descrição específica da
                                                    modalidade naquela
                                                    unidade.

  `capacidade_padrao`       `integer`               Capacidade padrão
                                                    associada à modalidade
                                                    na unidade.

  `ativo`                   `boolean`               Indica se a modalidade
                                                    está atualmente
                                                    disponível na unidade.

  `created_at`              `timestamp`             Data e hora de criação.

  `updated_at`              `timestamp`             Data e hora da última
                                                    atualização.

  `created_by`              `uuid`                  Usuário responsável
                                                    pela criação.

  `updated_by`              `uuid`                  Usuário responsável
                                                    pela última
                                                    atualização.
  -------------------------------------------------------------------------

## `professor_unidade`

Representa o vínculo de um professor com uma unidade específica.

  ------------------------------------------------------------------------
  Coluna                   Tipo                    Descrição
  ------------------------ ----------------------- -----------------------
  `id_professor_unidade`   `uuid`                  Identificador único do
                                                   vínculo.

  `id_professor`           `uuid`                  Professor vinculado.

  `id_unidade`             `uuid`                  Unidade na qual o
                                                   professor atua.

  `codigo`                 `varchar(50)`           Código interno do
                                                   professor na unidade,
                                                   quando utilizado.

  `data_desligamento`      `date`                  Data de encerramento do
                                                   vínculo com a unidade.

  `ativo`                  `boolean`               Indica se o vínculo do
                                                   professor com a unidade
                                                   está ativo.

  `created_at`             `timestamp`             Data e hora de criação
                                                   do vínculo.

  `updated_at`             `timestamp`             Data e hora da última
                                                   atualização.
  ------------------------------------------------------------------------

## `professor_unidade_modalidade`

Define quais modalidades um professor pode ministrar dentro de
determinada unidade.

  -----------------------------------------------------------------------------------
  Coluna                              Tipo                    Descrição
  ----------------------------------- ----------------------- -----------------------
  `id_professor_unidade_modalidade`   `uuid`                  Identificador único do
                                                              vínculo.

  `id_professor_unidade`              `uuid`                  Vínculo do professor
                                                              com a unidade.

  `id_unidade_modalidade`             `uuid`                  Modalidade oferecida
                                                              pela unidade e
                                                              associada ao professor.

  `ativo`                             `boolean`               Indica se o professor
                                                              está ativo nessa
                                                              modalidade da unidade.

  `created_at`                        `timestamp`             Data e hora de criação.

  `updated_at`                        `timestamp`             Data e hora da última
                                                              atualização.
  -----------------------------------------------------------------------------------

## `plano`

Representa um plano definido pelo estabelecimento. Sua oferta e
condições específicas são configuradas posteriormente por unidade.

  -----------------------------------------------------------------------
  Coluna                  Tipo                    Descrição
  ----------------------- ----------------------- -----------------------
  `id_plano`              `uuid`                  Identificador único do
                                                  plano.

  `id_estabelecimento`    `uuid`                  Estabelecimento
                                                  proprietário do plano.

  `nome`                  `varchar(120)`          Nome do plano.

  `descricao`             `text`                  Descrição geral do
                                                  plano.

  `ativo`                 `boolean`               Indica se o plano está
                                                  ativo no
                                                  estabelecimento.

  `created_at`            `timestamp`             Data e hora de criação.

  `updated_at`            `timestamp`             Data e hora da última
                                                  atualização.

  `created_by`            `uuid`                  Usuário responsável
                                                  pela criação.

  `updated_by`            `uuid`                  Usuário responsável
                                                  pela última
                                                  atualização.
  -----------------------------------------------------------------------

## `plano_unidade`

Representa a oferta de um plano em uma unidade e armazena suas condições
comerciais específicas.

  -------------------------------------------------------------------------
  Coluna                    Tipo                    Descrição
  ------------------------- ----------------------- -----------------------
  `id_plano_unidade`        `uuid`                  Identificador único da
                                                    oferta do plano na
                                                    unidade.

  `id_plano`                `uuid`                  Plano disponibilizado.

  `id_unidade`              `uuid`                  Unidade que oferece o
                                                    plano.

  `nome_exibicao`           `varchar(120)`          Nome específico
                                                    utilizado pela unidade
                                                    para apresentar o
                                                    plano.

  `descricao`               `text`                  Descrição específica da
                                                    oferta.

  `valor`                   `numeric(12,2)`         Valor base do plano
                                                    naquela unidade.

  `duracao_meses`           `integer`               Duração prevista do
                                                    plano em meses, quando
                                                    aplicável.

  `tipo_cobranca`           `varchar(30)`           Tipo de cobrança
                                                    adotado pelo plano.

  `taxa_adesao`             `numeric(12,2)`         Taxa de adesão
                                                    associada à
                                                    contratação.

  `dia_vencimento_padrao`   `integer`               Dia padrão sugerido
                                                    para vencimento das
                                                    cobranças.

  `ativo`                   `boolean`               Indica se o plano está
                                                    disponível na unidade.

  `created_at`              `timestamp`             Data e hora de criação.

  `updated_at`              `timestamp`             Data e hora da última
                                                    atualização.

  `created_by`              `uuid`                  Usuário responsável
                                                    pela criação.

  `updated_by`              `uuid`                  Usuário responsável
                                                    pela última
                                                    atualização.
  -------------------------------------------------------------------------

## `plano_unidade_desconto`

Representa uma regra de desconto cadastrada para um plano oferecido por
uma unidade.

  -----------------------------------------------------------------------------
  Coluna                        Tipo                    Descrição
  ----------------------------- ----------------------- -----------------------
  `id_plano_unidade_desconto`   `uuid`                  Identificador único da
                                                        regra de desconto.

  `id_plano_unidade`            `uuid`                  Oferta de plano à qual
                                                        o desconto pertence.

  `nome`                        `varchar(120)`          Nome identificador da
                                                        regra de desconto.

  `tipo_desconto`               `varchar(30)`           Forma de cálculo do
                                                        desconto, como
                                                        percentual ou valor
                                                        fixo.

  `valor`                       `numeric(12,2)`         Valor ou percentual do
                                                        desconto.

  `tipo_aplicacao`              `varchar(30)`           Define como o desconto
                                                        é aplicado, por exemplo
                                                        único, periódico ou
                                                        recorrente.

  `quantidade_meses`            `integer`               Quantidade de meses
                                                        durante os quais o
                                                        desconto deve vigorar,
                                                        quando aplicável.

  `tipo_condicao`               `varchar(40)`           Condição necessária
                                                        para aplicação do
                                                        desconto, quando
                                                        houver.

  `data_inicio`                 `date`                  Início da validade da
                                                        regra.

  `data_fim`                    `date`                  Fim da validade da
                                                        regra.

  `ativo`                       `boolean`               Indica se a regra de
                                                        desconto está ativa.

  `created_at`                  `timestamp`             Data e hora de criação.

  `updated_at`                  `timestamp`             Data e hora da última
                                                        atualização.

  `created_by`                  `uuid`                  Usuário responsável
                                                        pela criação.

  `updated_by`                  `uuid`                  Usuário responsável
                                                        pela última
                                                        atualização.
  -----------------------------------------------------------------------------

## `plano_unidade_modalidade`

Tabela associativa que determina quais modalidades oferecidas pela
unidade estão incluídas em determinado plano da unidade.

  -------------------------------------------------------------------------
  Coluna                    Tipo                    Descrição
  ------------------------- ----------------------- -----------------------
  `id_plano_unidade`        `uuid`                  Plano oferecido pela
                                                    unidade.

  `id_unidade_modalidade`   `uuid`                  Modalidade da unidade
                                                    incluída no plano.

  `created_at`              `timestamp`             Data e hora de criação
                                                    da associação.
  -------------------------------------------------------------------------

## `matricula`

Representa a matrícula de um aluno em um plano oferecido por determinada
unidade.

  -----------------------------------------------------------------------
  Coluna                  Tipo                    Descrição
  ----------------------- ----------------------- -----------------------
  `id_matricula`          `uuid`                  Identificador único da
                                                  matrícula.

  `id_aluno`              `uuid`                  Aluno associado à
                                                  matrícula.

  `id_plano_unidade`      `uuid`                  Plano e unidade
                                                  contratados pelo aluno.

  `data_inicio`           `date`                  Data inicial da
                                                  matrícula.

  `data_fim`              `date`                  Data final ou de
                                                  encerramento da
                                                  matrícula, quando
                                                  houver.

  `dia_vencimento`        `integer`               Dia de vencimento
                                                  definido para as
                                                  cobranças da matrícula.

  `status`                `varchar(30)`           Situação atual da
                                                  matrícula.

  `motivo_cancelamento`   `text`                  Motivo do cancelamento,
                                                  quando aplicável.

  `created_at`            `timestamp`             Data e hora de criação.

  `updated_at`            `timestamp`             Data e hora da última
                                                  atualização.

  `created_by`            `uuid`                  Usuário responsável
                                                  pela criação.

  `updated_by`            `uuid`                  Usuário responsável
                                                  pela última
                                                  atualização.
  -----------------------------------------------------------------------

## `matricula_desconto`

Representa um desconto efetivamente associado a uma matrícula.

  -----------------------------------------------------------------------------
  Coluna                        Tipo                    Descrição
  ----------------------------- ----------------------- -----------------------
  `id_matricula_desconto`       `uuid`                  Identificador único do
                                                        desconto da matrícula.

  `id_matricula`                `uuid`                  Matrícula beneficiada
                                                        pelo desconto.

  `id_plano_unidade_desconto`   `uuid`                  Regra de desconto do
                                                        plano que originou o
                                                        benefício.

  `tipo_desconto`               `varchar(30)`           Tipo de desconto
                                                        efetivamente concedido.

  `valor`                       `numeric(12,2)`         Valor ou percentual
                                                        efetivamente concedido.

  `data_inicio`                 `date`                  Data inicial de
                                                        vigência do desconto.

  `data_fim`                    `date`                  Data final de vigência
                                                        do desconto, quando
                                                        houver.

  `created_at`                  `timestamp`             Data e hora de criação.

  `updated_at`                  `timestamp`             Data e hora da última
                                                        atualização.
  -----------------------------------------------------------------------------

## `mensalidade`

Representa uma cobrança gerada para uma matrícula, preservando os
valores financeiros utilizados naquela competência.

  -----------------------------------------------------------------------
  Coluna                  Tipo                    Descrição
  ----------------------- ----------------------- -----------------------
  `id_mensalidade`        `uuid`                  Identificador único da
                                                  mensalidade.

  `id_matricula`          `uuid`                  Matrícula que originou
                                                  a cobrança.

  `competencia`           `date`                  Competência da
                                                  mensalidade.

  `data_vencimento`       `date`                  Data de vencimento.

  `valor_original`        `numeric(12,2)`         Valor da cobrança antes
                                                  de descontos, multas e
                                                  juros.

  `valor_desconto`        `numeric(12,2)`         Valor de desconto
                                                  aplicado à cobrança.

  `multa`                 `numeric(12,2)`         Valor de multa
                                                  aplicado.

  `juros`                 `numeric(12,2)`         Valor de juros
                                                  aplicado.

  `valor_total`           `numeric(12,2)`         Valor final da
                                                  mensalidade.

  `status`                `varchar(30)`           Situação atual da
                                                  cobrança.

  `created_at`            `timestamp`             Data e hora de criação.

  `updated_at`            `timestamp`             Data e hora da última
                                                  atualização.

  `created_by`            `uuid`                  Usuário responsável
                                                  pela criação.

  `updated_by`            `uuid`                  Usuário responsável
                                                  pela última
                                                  atualização.
  -----------------------------------------------------------------------

## `pagamento`

Registra os pagamentos realizados para uma mensalidade.

  -----------------------------------------------------------------------
  Coluna                  Tipo                    Descrição
  ----------------------- ----------------------- -----------------------
  `id_pagamento`          `uuid`                  Identificador único do
                                                  pagamento.

  `id_mensalidade`        `uuid`                  Mensalidade associada
                                                  ao pagamento.

  `valor_pago`            `numeric(12,2)`         Valor efetivamente
                                                  pago.

  `data_pagamento`        `timestamp`             Data e hora em que o
                                                  pagamento ocorreu.

  `forma_pagamento`       `varchar(30)`           Forma de pagamento
                                                  utilizada.

  `status`                `varchar(30)`           Situação do pagamento.

  `referencia_externa`    `varchar(200)`          Identificador de
                                                  referência em gateway
                                                  ou sistema externo,
                                                  quando houver.

  `observacao`            `text`                  Observações
                                                  relacionadas ao
                                                  pagamento.

  `created_at`            `timestamp`             Data e hora de criação.

  `updated_at`            `timestamp`             Data e hora da última
                                                  atualização.

  `created_by`            `uuid`                  Usuário responsável
                                                  pela criação.

  `updated_by`            `uuid`                  Usuário responsável
                                                  pela última
                                                  atualização.
  -----------------------------------------------------------------------

## `frequencia`

Registra a presença de um aluno em uma unidade, através dos horários de
entrada e saída.

  -----------------------------------------------------------------------
  Coluna                  Tipo                    Descrição
  ----------------------- ----------------------- -----------------------
  `id_frequencia`         `uuid`                  Identificador único do
                                                  registro de frequência.

  `id_aluno`              `uuid`                  Aluno que realizou o
                                                  acesso.

  `id_unidade`            `uuid`                  Unidade em que a
                                                  presença foi
                                                  registrada.

  `data_hora_entrada`     `timestamp`             Data e hora de entrada
                                                  do aluno.

  `data_hora_saida`       `timestamp`             Data e hora de saída,
                                                  quando registrada.

  `created_at`            `timestamp`             Data e hora de criação
                                                  do registro.

  `created_by`            `uuid`                  Usuário responsável
                                                  pela criação do
                                                  registro, quando
                                                  aplicável.
  -----------------------------------------------------------------------

## `turma`

Representa uma turma criada para uma modalidade oferecida por
determinada unidade.

  -------------------------------------------------------------------------
  Coluna                    Tipo                    Descrição
  ------------------------- ----------------------- -----------------------
  `id_turma`                `uuid`                  Identificador único da
                                                    turma.

  `id_unidade_modalidade`   `uuid`                  Modalidade da unidade à
                                                    qual a turma pertence.

  `id_professor_unidade`    `uuid`                  Professor da unidade
                                                    responsável pela turma.

  `nome`                    `varchar(120)`          Nome da turma.

  `capacidade`              `integer`               Capacidade de alunos da
                                                    turma.

  `ativo`                   `boolean`               Indica se a turma está
                                                    ativa.

  `created_at`              `timestamp`             Data e hora de criação.

  `updated_at`              `timestamp`             Data e hora da última
                                                    atualização.
  -------------------------------------------------------------------------

## `turma_horario`

Define os horários recorrentes associados a uma turma.

  Coluna               Tipo          Descrição
  -------------------- ------------- --------------------------------------
  `id_turma_horario`   `uuid`        Identificador único do horário.
  `id_turma`           `uuid`        Turma à qual o horário pertence.
  `dia_semana`         `integer`     Dia da semana em que a turma ocorre.
  `hora_inicio`        `time`        Horário de início.
  `hora_fim`           `time`        Horário de término.
  `created_at`         `timestamp`   Data e hora de criação.
  `updated_at`         `timestamp`   Data e hora da última atualização.

## `aluno_turma`

Representa o vínculo de uma matrícula com uma turma específica.

  -----------------------------------------------------------------------
  Coluna                  Tipo                    Descrição
  ----------------------- ----------------------- -----------------------
  `id_aluno_turma`        `uuid`                  Identificador único do
                                                  vínculo.

  `id_matricula`          `uuid`                  Matrícula utilizada
                                                  para participar da
                                                  turma.

  `id_turma`              `uuid`                  Turma associada à
                                                  matrícula.

  `data_inicio`           `date`                  Data inicial da
                                                  participação na turma.

  `data_fim`              `date`                  Data final da
                                                  participação, quando
                                                  houver.

  `ativo`                 `boolean`               Indica se o vínculo com
                                                  a turma está ativo.

  `created_at`            `timestamp`             Data e hora de criação.

  `updated_at`            `timestamp`             Data e hora da última
                                                  atualização.
  -----------------------------------------------------------------------

## `usuario_estabelecimento`

Representa a associação de uma pessoa a um estabelecimento com
determinado papel de acesso.

  ------------------------------------------------------------------------------
  Coluna                         Tipo                    Descrição
  ------------------------------ ----------------------- -----------------------
  `id_usuario_estabelecimento`   `uuid`                  Identificador único da
                                                         associação.

  `id_estabelecimento`           `uuid`                  Estabelecimento ao qual
                                                         o usuário está
                                                         associado.

  `id_pessoa`                    `uuid`                  Pessoa que recebe o
                                                         vínculo de acesso.

  `role`                         `varchar(40)`           Papel/perfil exercido
                                                         no estabelecimento.

  `ativo`                        `boolean`               Indica se o vínculo de
                                                         acesso está ativo.

  `created_at`                   `timestamp`             Data e hora de criação.

  `updated_at`                   `timestamp`             Data e hora da última
                                                         atualização.
  ------------------------------------------------------------------------------

## `unidade_auditoria`

Registra alterações relevantes realizadas no contexto de uma unidade.

  ------------------------------------------------------------------------
  Coluna                   Tipo                    Descrição
  ------------------------ ----------------------- -----------------------
  `id_unidade_auditoria`   `uuid`                  Identificador único do
                                                   evento de auditoria.

  `id_unidade`             `uuid`                  Unidade à qual a
                                                   auditoria está
                                                   associada.

  `id_usuario`             `uuid`                  Identificador do
                                                   usuário responsável
                                                   pela ação.

  `tipo_registro`          `varchar(100)`          Tipo de registro que
                                                   sofreu a alteração,
                                                   como matrícula,
                                                   pagamento ou plano da
                                                   unidade.

  `id_registro`            `uuid`                  Identificador do
                                                   registro alterado.

  `acao`                   `varchar(50)`           Ação realizada sobre o
                                                   registro.

  `dados_anteriores`       `jsonb`                 Estado dos dados antes
                                                   da alteração.

  `dados_novos`            `jsonb`                 Estado dos dados após a
                                                   alteração.

  `created_at`             `timestamp`             Data e hora em que o
                                                   evento auditado foi
                                                   registrado.
  ------------------------------------------------------------------------
## Tabelas de domínio

As tabelas desta seção representam conjuntos controlados de valores utilizados por outras entidades da modelagem.

Diferentemente de estados internos da aplicação, esses domínios foram modelados como tabelas por possuírem potencial de evolução, parametrização ou inclusão de novos valores sem necessidade de alteração estrutural das entidades que os utilizam.

---

## `tipo_estabelecimento`

Define os tipos de estabelecimentos que podem ser cadastrados no sistema.

Exemplos de valores: `ACADEMIA`, `STUDIO`, `BOX`, `CENTRO_ESPORTIVO`, `ARTES_MARCIAIS` e `OUTRO`.

Substitui o campo textual `tipo` existente em `estabelecimento` por uma referência ao domínio.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id_tipo_estabelecimento` | `bigint` | Identificador único do tipo de estabelecimento. |
| `codigo` | `varchar(40)` | Código único utilizado internamente pela aplicação, como `ACADEMIA` ou `STUDIO`. |
| `descricao` | `varchar(100)` | Descrição apresentada ao usuário. |
| `ativo` | `boolean` | Indica se o tipo pode ser utilizado em novos cadastros. |

### Relacionamento

`estabelecimento` passa a possuir:

`id_tipo_estabelecimento` → `tipo_estabelecimento.id_tipo_estabelecimento`

---

## `tipo_cobranca`

Define as formas de cobrança que podem ser configuradas para um plano oferecido por uma unidade.

Exemplos de valores: `MENSAL`, `RECORRENTE` e `UNICO`.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id_tipo_cobranca` | `bigint` | Identificador único do tipo de cobrança. |
| `codigo` | `varchar(30)` | Código único utilizado internamente pela aplicação. |
| `descricao` | `varchar(100)` | Descrição do tipo de cobrança apresentada ao usuário. |
| `ativo` | `boolean` | Indica se o tipo de cobrança está disponível para utilização. |

### Relacionamento

`plano_unidade` passa a possuir:

`id_tipo_cobranca` → `tipo_cobranca.id_tipo_cobranca`

substituindo o campo textual `tipo_cobranca`.

---

## `tipo_desconto`

Define as formas disponíveis para cálculo de um desconto.

Exemplos de valores: `PERCENTUAL` e `VALOR_FIXO`.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id_tipo_desconto` | `bigint` | Identificador único do tipo de desconto. |
| `codigo` | `varchar(30)` | Código único utilizado internamente, como `PERCENTUAL` ou `VALOR_FIXO`. |
| `descricao` | `varchar(100)` | Descrição do tipo de desconto. |
| `ativo` | `boolean` | Indica se o tipo pode ser utilizado em novas regras de desconto. |

### Relacionamentos

Utilizado por:

- `plano_unidade_desconto.id_tipo_desconto`
- `matricula_desconto.id_tipo_desconto`

O tipo deve ser armazenado também em `matricula_desconto` para preservar a forma como o benefício foi efetivamente concedido à matrícula.

---

## `tipo_aplicacao_desconto`

Define a duração ou recorrência de uma regra de desconto.

Exemplos de valores:

- `UNICO`: aplicado uma única vez;
- `POR_PERIODO`: aplicado durante determinada quantidade de meses;
- `RECORRENTE`: aplicado continuamente enquanto o desconto permanecer válido.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id_tipo_aplicacao_desconto` | `bigint` | Identificador único do tipo de aplicação. |
| `codigo` | `varchar(30)` | Código único utilizado internamente pela aplicação. |
| `descricao` | `varchar(150)` | Descrição do comportamento da aplicação do desconto. |
| `ativo` | `boolean` | Indica se o tipo de aplicação está disponível para novas regras. |

### Relacionamento

`plano_unidade_desconto` passa a possuir:

`id_tipo_aplicacao_desconto` → `tipo_aplicacao_desconto.id_tipo_aplicacao_desconto`

substituindo o campo textual `tipo_aplicacao`.

---

## `condicao_desconto`

Define condições que podem precisar ser satisfeitas para que uma regra de desconto seja aplicada.

Exemplos de condições:

- `CARTAO_CADASTRADO`;
- `CONVENIO_EMPRESA`;
- `PRIMEIRA_MATRICULA`;
- `PAGAMENTO_ANTECIPADO`;
- `INDICACAO`.

Nem toda regra de desconto precisa possuir uma condição. Por esse motivo, a referência em `plano_unidade_desconto` pode ser opcional.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id_condicao_desconto` | `bigint` | Identificador único da condição. |
| `codigo` | `varchar(50)` | Código único utilizado internamente para identificar a condição. |
| `descricao` | `varchar(150)` | Descrição da condição necessária para concessão do desconto. |
| `ativo` | `boolean` | Indica se a condição pode ser utilizada em novas regras. |

### Relacionamento

`plano_unidade_desconto` passa a possuir:

`id_condicao_desconto` → `condicao_desconto.id_condicao_desconto`

A FK pode ser `NULL` quando o desconto não depender de uma condição.

---

## `forma_pagamento`

Define as formas de pagamento aceitas pelo sistema.

Exemplos de valores: `PIX`, `DINHEIRO`, `CARTAO_CREDITO`, `CARTAO_DEBITO`, `BOLETO` e `TRANSFERENCIA`.

A utilização de uma tabela permite que novas formas de pagamento e integrações sejam adicionadas futuramente sem modificar a estrutura da entidade `pagamento`.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id_forma_pagamento` | `bigint` | Identificador único da forma de pagamento. |
| `codigo` | `varchar(40)` | Código único utilizado internamente pela aplicação. |
| `descricao` | `varchar(100)` | Nome ou descrição apresentada ao usuário. |
| `permite_recorrencia` | `boolean` | Indica se a forma de pagamento pode ser utilizada em cobranças recorrentes. |
| `ativo` | `boolean` | Indica se a forma de pagamento está disponível para utilização. |

### Relacionamento

`pagamento` passa a possuir:

`id_forma_pagamento` → `forma_pagamento.id_forma_pagamento`

substituindo o campo textual `forma_pagamento`.

---

## `role_estabelecimento`

Define os papéis que uma pessoa pode exercer dentro de um estabelecimento.

Exemplos de valores: `ADMIN_ESTABELECIMENTO`, `RECEPCIONISTA` e outros perfis administrativos que venham a ser criados.

Essa tabela representa o papel da pessoa no contexto do estabelecimento e não substitui necessariamente as roles utilizadas pelo Keycloak para autorização técnica da aplicação.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id_role_estabelecimento` | `bigint` | Identificador único do papel. |
| `codigo` | `varchar(40)` | Código único utilizado internamente pela aplicação. |
| `descricao` | `varchar(100)` | Nome ou descrição do papel. |
| `ativo` | `boolean` | Indica se o papel pode ser atribuído a novos usuários. |

### Relacionamento

`usuario_estabelecimento` passa a possuir:

`id_role_estabelecimento` → `role_estabelecimento.id_role_estabelecimento`

substituindo o campo textual `role`.

---

## Valores mantidos como enums da aplicação

Alguns valores possuem comportamento diretamente relacionado às regras de negócio e tendem a apresentar um conjunto pequeno e estável de estados. Para esses casos, inicialmente não é necessária uma tabela de domínio.

Recomenda-se mantê-los como enums no backend e armazenar seus códigos diretamente nas respectivas colunas `varchar`.

| Campo | Entidade | Exemplos |
|---|---|---|
| `status` | `estabelecimento` | `ATIVO`, `INATIVO`, `BLOQUEADO` |
| `status` | `matricula` | `ATIVA`, `PENDENTE`, `TRANCADA`, `CANCELADA`, `ENCERRADA` |
| `status` | `mensalidade` | `PENDENTE`, `PAGA`, `VENCIDA`, `CANCELADA` |
| `status` | `pagamento` | `PENDENTE`, `CONFIRMADO`, `CANCELADO`, `ESTORNADO` |
| `acao` | `unidade_auditoria` | `CRIACAO`, `ALTERACAO`, `INATIVACAO`, `CANCELAMENTO`, `ESTORNO` |

Esses valores podem ser convertidos para tabelas de domínio posteriormente caso surja necessidade de parametrização pelo banco de dados.

