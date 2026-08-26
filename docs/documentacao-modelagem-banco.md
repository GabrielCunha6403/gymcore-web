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
