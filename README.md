# Controle de Despesas (V1)

Aplicação Next.js para controle de despesas de cartão com importação CSV, deduplicação, categorias com limite e dashboard mensal.

## Requisitos

- Node.js 20+
- Postgres local rodando

## Rodando localmente

1. Instale dependências:

```bash
npm install
```

2. Rode migrações:

```bash
npx prisma migrate dev
npx prisma generate
```

3. Inicie a aplicação:

```bash
npm run dev
```

Aplicação em `http://localhost:3000`.

## Formato do CSV

Arquivo com cabeçalho e 3 colunas:

- `data`
- `estabelecimento` ou `lançamento`
- `valor`

Exemplo:

```csv
data,lançamento,valor
2025-10-01,BIG LAR,5.13
2025-10-01,ATACADAO DA CARNE,94.41
```

## Regras implementadas

- Deduplicação por combinação `data + estabelecimento(normalizado) + valor`
- Estabelecimento novo é cadastrado automaticamente
- Despesa nova entra com categoria do estabelecimento (inicialmente `Outros`)
- Reclassificação de estabelecimento atualiza despesas existentes e futuras
- Categorias com limite mensal configurável
- Dashboard por mês de fatura

## Mês de fatura e dia de virada

- A competência é por **mês da fatura**, não por mês da compra.
- Regra:
  - compra até o dia de virada do mês -> fatura do mês seguinte
  - compra após o dia de virada do mês -> fatura do mês subsequente
- Existe um dia padrão de virada (inicial: `31`) e exceções por mês.
- Ao mudar o dia padrão ou uma exceção mensal, o sistema recalcula as despesas já importadas.
