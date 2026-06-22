-- Tabela para salvar orçamentos enviados pelos clientes
CREATE TABLE IF NOT EXISTS orcamentos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name   TEXT NOT NULL,
  client_cpf    TEXT NOT NULL,
  client_phone  TEXT,
  data_festa    DATE NOT NULL,
  data_montagem DATE NOT NULL,
  local_festa   TEXT,          -- endereço digitado
  local_lat     NUMERIC(10,7), -- latitude do pin no mapa
  local_lng     NUMERIC(10,7), -- longitude do pin no mapa
  cart          JSONB NOT NULL, -- snapshot dos itens
  subtotal      NUMERIC(10,2),
  desconto      NUMERIC(10,2),
  total         NUMERIC(10,2),
  status        TEXT NOT NULL DEFAULT 'Novo'
                  CHECK (status IN ('Novo', 'Em andamento', 'Fechado', 'Cancelado')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orcamentos_created ON orcamentos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status  ON orcamentos (status);
