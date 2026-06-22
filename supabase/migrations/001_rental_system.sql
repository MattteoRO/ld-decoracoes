-- ============================================================
-- SISTEMA DE LOCAÇÃO LD DECORAÇÕES
-- Migração: Acervo físico (SKUs), Kits, Reservas
-- ============================================================

-- 1. ITEMS — Acervo Físico (cada unidade física tem um SKU único)
CREATE TABLE IF NOT EXISTS items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku         TEXT NOT NULL UNIQUE,           -- Ex: EST-PNL-150-01
  name        TEXT NOT NULL,                  -- Ex: Painel Redondo 1.50m
  category    TEXT NOT NULL,                  -- Moveis | Estruturas | Temas | Tapetes
  is_available BOOLEAN NOT NULL DEFAULT true, -- false = item quebrado/fora de uso
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. KITS — Produtos compostos exibidos na loja (ligado a products existente)
--    Um kit pode estar vinculado a um product_id já existente (opcional)
CREATE TABLE IF NOT EXISTS kits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL, -- vínculo ao produto do catálogo
  name        TEXT NOT NULL,                  -- Ex: Kit Masha e o Urso
  description TEXT,
  price       NUMERIC(10,2),
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. KIT_ITEMS — Bill of Materials: o que cada kit precisa do acervo
--    Duas formas de especificar o requisito:
--    a) category_needed: qualquer SKU livre dessa categoria serve (ex: qualquer painel 1.50)
--    b) specific_sku: SKU exato obrigatório (ex: TEMA-MASH-01 é único)
CREATE TABLE IF NOT EXISTS kit_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id           UUID NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
  category_needed  TEXT,      -- Ex: 'EST-PNL-150' — sistema aloca qualquer SKU disponível desta categoria
  specific_sku     TEXT REFERENCES items(sku) ON DELETE RESTRICT, -- SKU obrigatório (tema, por exemplo)
  quantity         INT NOT NULL DEFAULT 1,
  CONSTRAINT check_one_type CHECK (
    (category_needed IS NOT NULL AND specific_sku IS NULL) OR
    (category_needed IS NULL AND specific_sku IS NOT NULL)
  )
);

-- 4. RESERVATIONS — Locações confirmadas ou pendentes
CREATE TABLE IF NOT EXISTS reservations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name     TEXT NOT NULL,
  client_cpf      TEXT NOT NULL,
  client_phone    TEXT,
  kit_id          UUID REFERENCES kits(id) ON DELETE SET NULL,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL, -- para produtos avulsos
  -- Horários reais do evento
  event_start     TIMESTAMPTZ NOT NULL,  -- ex: 2026-06-22 07:00:00-04
  event_end       TIMESTAMPTZ NOT NULL,  -- ex: 2026-06-22 12:00:00-04
  -- Buffer logístico (+4h antes e depois) — calculado na query, não armazenado
  status          TEXT NOT NULL DEFAULT 'Pendente'
                    CHECK (status IN ('Pendente', 'Confirmado', 'Concluido', 'Cancelado')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. RESERVATION_ITEMS — SKUs físicos alocados para cada reserva
CREATE TABLE IF NOT EXISTS reservation_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id  UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  item_sku        TEXT NOT NULL REFERENCES items(sku),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (reservation_id, item_sku)
);

-- ============================================================
-- ÍNDICES para performance nas queries de disponibilidade
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_reservations_event_range
  ON reservations (event_start, event_end)
  WHERE status IN ('Pendente', 'Confirmado');

CREATE INDEX IF NOT EXISTS idx_reservation_items_sku
  ON reservation_items (item_sku);

CREATE INDEX IF NOT EXISTS idx_kit_items_kit_id
  ON kit_items (kit_id);

CREATE INDEX IF NOT EXISTS idx_items_category
  ON items (category);

-- ============================================================
-- FUNCTION: get_blocked_skus_in_period
-- Retorna os SKUs bloqueados em um período (com buffer de 4h)
-- ============================================================
CREATE OR REPLACE FUNCTION get_blocked_skus_in_period(
  p_start TIMESTAMPTZ,
  p_end   TIMESTAMPTZ
)
RETURNS TABLE (item_sku TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ri.item_sku
  FROM reservation_items ri
  JOIN reservations r ON r.id = ri.reservation_id
  WHERE r.status IN ('Pendente', 'Confirmado')
    AND (
      -- Intervalo da reserva (com buffer 4h) sobrepõe o período solicitado
      (r.event_start - INTERVAL '4 hours') < p_end
      AND
      (r.event_end + INTERVAL '4 hours') > p_start
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: check_kit_availability
-- Verifica se um kit está disponível para um período
-- Retorna: available (bool), missing_items (text[])
-- ============================================================
CREATE OR REPLACE FUNCTION check_kit_availability(
  p_kit_id UUID,
  p_start  TIMESTAMPTZ,
  p_end    TIMESTAMPTZ
)
RETURNS TABLE (available BOOLEAN, missing_items TEXT[]) AS $$
DECLARE
  v_blocked_skus TEXT[];
  v_missing TEXT[] := ARRAY[]::TEXT[];
  v_req RECORD;
  v_free_sku TEXT;
BEGIN
  -- Pega todos os SKUs bloqueados no período
  SELECT ARRAY(SELECT item_sku FROM get_blocked_skus_in_period(p_start, p_end))
  INTO v_blocked_skus;

  -- Para cada requisito do kit
  FOR v_req IN
    SELECT ki.category_needed, ki.specific_sku, ki.quantity
    FROM kit_items ki
    WHERE ki.kit_id = p_kit_id
  LOOP
    IF v_req.specific_sku IS NOT NULL THEN
      -- SKU específico obrigatório (ex: TEMA-MASH-01)
      IF v_req.specific_sku = ANY(v_blocked_skus) THEN
        v_missing := array_append(v_missing, v_req.specific_sku);
      END IF;
    ELSIF v_req.category_needed IS NOT NULL THEN
      -- Qualquer SKU livre da categoria serve
      SELECT i.sku INTO v_free_sku
      FROM items i
      WHERE i.category = v_req.category_needed
        AND i.is_available = true
        AND NOT (i.sku = ANY(v_blocked_skus))
      ORDER BY i.sku  -- determinístico
      LIMIT 1;

      IF v_free_sku IS NULL THEN
        v_missing := array_append(v_missing, v_req.category_needed || ' (sem unidade livre)');
      END IF;
    END IF;
  END LOOP;

  RETURN QUERY
  SELECT (array_length(v_missing, 1) IS NULL OR array_length(v_missing, 1) = 0),
         v_missing;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: allocate_kit_to_reservation
-- Aloca automaticamente os SKUs livres para uma reserva
-- Deve ser chamada dentro de uma transação
-- ============================================================
CREATE OR REPLACE FUNCTION allocate_kit_to_reservation(
  p_reservation_id UUID,
  p_kit_id         UUID,
  p_start          TIMESTAMPTZ,
  p_end            TIMESTAMPTZ
)
RETURNS VOID AS $$
DECLARE
  v_blocked_skus TEXT[];
  v_req RECORD;
  v_free_sku TEXT;
BEGIN
  SELECT ARRAY(SELECT item_sku FROM get_blocked_skus_in_period(p_start, p_end))
  INTO v_blocked_skus;

  FOR v_req IN
    SELECT ki.category_needed, ki.specific_sku
    FROM kit_items ki
    WHERE ki.kit_id = p_kit_id
  LOOP
    IF v_req.specific_sku IS NOT NULL THEN
      INSERT INTO reservation_items (reservation_id, item_sku)
      VALUES (p_reservation_id, v_req.specific_sku);
    ELSIF v_req.category_needed IS NOT NULL THEN
      SELECT i.sku INTO v_free_sku
      FROM items i
      WHERE i.category = v_req.category_needed
        AND i.is_available = true
        AND NOT (i.sku = ANY(v_blocked_skus))
      ORDER BY i.sku
      LIMIT 1;

      IF v_free_sku IS NULL THEN
        RAISE EXCEPTION 'Nenhuma unidade livre da categoria % disponível para o período', v_req.category_needed;
      END IF;

      INSERT INTO reservation_items (reservation_id, item_sku)
      VALUES (p_reservation_id, v_free_sku);

      -- Adiciona ao array para não alocar o mesmo SKU duas vezes na mesma reserva
      v_blocked_skus := array_append(v_blocked_skus, v_free_sku);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SEED: Acervo Físico (todos os SKUs mapeados)
-- ============================================================

-- Móveis e Mesas
INSERT INTO items (sku, name, category) VALUES
  ('MOV-COM-BCA-01',       'Cômoda bombê branca',                          'Moveis'),
  ('MOV-MES-TREL-01',      'Trio de mesa treliça dourada',                 'Moveis'),
  ('MOV-MES-ARAM-01',      'Quarteto de mesas aramada preta',              'Moveis'),
  ('MOV-MES-CONE-01',      'Trio de mesas cone ripada',                    'Moveis'),
  ('MOV-MES-VID-01',       'Quarteto de mesas dourada tampo vidro branco', 'Moveis'),
  ('MOV-MES-GARD-01',      'Trio de mesa garden super luxo dourada',       'Moveis'),
  ('MOV-MES-QUAD-MAD-01',  'Trio de mesas quadrada em madeira P/M/G',      'Moveis'),
  ('MOV-MES-QUAD-BCA-01',  'Mesa quadrada branca em madeira',              'Moveis'),
  ('MOV-MES-ROSA-01',      'Trio de mesa em madeira na cor rosa',          'Moveis'),
  ('MOV-NAM-01',           'Namoradeira',                                  'Moveis'),
  ('MOV-BAN-RUST-01',      'Banquinho rústico',                            'Moveis'),
  ('MOV-BAN-BCA-01',       'Banquinho em madeira branca',                  'Moveis'),
  ('MOV-CAD-INF-01',       'Cadeirinha infantil branca',                   'Moveis')
ON CONFLICT (sku) DO NOTHING;

-- Estruturas: Cilindros (6 jogos)
INSERT INTO items (sku, name, category) VALUES
  ('EST-CIL-JOG-01', 'Jogo de cilindros 01', 'EST-CIL-JOG'),
  ('EST-CIL-JOG-02', 'Jogo de cilindros 02', 'EST-CIL-JOG'),
  ('EST-CIL-JOG-03', 'Jogo de cilindros 03', 'EST-CIL-JOG'),
  ('EST-CIL-JOG-04', 'Jogo de cilindros 04', 'EST-CIL-JOG'),
  ('EST-CIL-JOG-05', 'Jogo de cilindros 05', 'EST-CIL-JOG'),
  ('EST-CIL-JOG-06', 'Jogo de cilindros 06', 'EST-CIL-JOG')
ON CONFLICT (sku) DO NOTHING;

-- Estruturas: Painéis redondos 1.50m (5 unidades)
INSERT INTO items (sku, name, category) VALUES
  ('EST-PNL-150-01', 'Painel redondo 1.50m #01', 'EST-PNL-150'),
  ('EST-PNL-150-02', 'Painel redondo 1.50m #02', 'EST-PNL-150'),
  ('EST-PNL-150-03', 'Painel redondo 1.50m #03', 'EST-PNL-150'),
  ('EST-PNL-150-04', 'Painel redondo 1.50m #04', 'EST-PNL-150'),
  ('EST-PNL-150-05', 'Painel redondo 1.50m #05', 'EST-PNL-150')
ON CONFLICT (sku) DO NOTHING;

-- Estruturas: Painéis madeira 1.20m (2 unidades)
INSERT INTO items (sku, name, category) VALUES
  ('EST-PNL-MAD-120-01', 'Painel 1.20m madeira #01', 'EST-PNL-MAD-120'),
  ('EST-PNL-MAD-120-02', 'Painel 1.20m madeira #02', 'EST-PNL-MAD-120')
ON CONFLICT (sku) DO NOTHING;

-- Estruturas: Painéis madeira 50cm (2 unidades)
INSERT INTO items (sku, name, category) VALUES
  ('EST-PNL-MAD-50-01', 'Painel 50cm madeira #01', 'EST-PNL-MAD-50'),
  ('EST-PNL-MAD-50-02', 'Painel 50cm madeira #02', 'EST-PNL-MAD-50')
ON CONFLICT (sku) DO NOTHING;

-- Estruturas: Painel aço 50cm (1 unidade)
INSERT INTO items (sku, name, category) VALUES
  ('EST-PNL-ACO-50-01', 'Painel 50cm de aço #01', 'EST-PNL-ACO-50')
ON CONFLICT (sku) DO NOTHING;

-- Estruturas: Arcos e Portal
INSERT INTO items (sku, name, category) VALUES
  ('EST-ARC-VAZ-01',  'Arco romano vazado 1.80m #01', 'EST-ARC-VAZ'),
  ('EST-ARC-VAZ-02',  'Arco romano vazado 1.80m #02', 'EST-ARC-VAZ'),
  ('EST-ARC-MAD-01',  'Arco romano em madeira 1.80m #01', 'EST-ARC-MAD'),
  ('EST-ARC-MAD-02',  'Arco romano em madeira 1.80m #02', 'EST-ARC-MAD'),
  ('EST-PORT-3D-01',  'Portal de festa 3D médio', 'EST-PORT-3D')
ON CONFLICT (sku) DO NOTHING;

-- Tapetes
INSERT INTO items (sku, name, category) VALUES
  ('TAP-ROSA-01', 'Tapete rosa #01',        'Tapetes'),
  ('TAP-ROSA-02', 'Tapete rosa #02',        'Tapetes'),
  ('TAP-VERM-01', 'Tapete vermelho',        'Tapetes'),
  ('TAP-AZUL-01', 'Tapete azul',            'Tapetes'),
  ('TAP-MARR-01', 'Tapete marrom',          'Tapetes'),
  ('TAP-VERD-01', 'Tapete verde gramado',   'Tapetes'),
  ('TAP-CINZ-01', 'Tapete cinza',           'Tapetes'),
  ('TAP-DOUR-01', 'Tapete dourado',         'Tapetes')
ON CONFLICT (sku) DO NOTHING;

-- Box Temáticos (únicos — cada tema é exclusivo)
INSERT INTO items (sku, name, category) VALUES
  ('TEMA-DISN-01', 'Box Princesas Disney',      'Temas'),
  ('TEMA-PATR-01', 'Box Patrulha Canina Rosa',  'Temas'),
  ('TEMA-MASH-01', 'Box Masha e o Urso',        'Temas'),
  ('TEMA-BOTE-01', 'Box Boteco',                'Temas'),
  ('TEMA-STIT-01', 'Box Stitch',                'Temas'),
  ('TEMA-MINN-01', 'Box Minnie Mouse',          'Temas'),
  ('TEMA-DEBU-01', 'Box Debutante',             'Temas'),
  ('TEMA-CARR-01', 'Box Carros',                'Temas'),
  ('TEMA-DRAG-01', 'Box Dragon Ball Z',         'Temas'),
  ('TEMA-ASTR-01', 'Box Astronauta',            'Temas')
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- SEED: Kits (composições)
-- (Os kits são criados sem product_id; você vincula depois
--  editando o kit no admin se quiser ligar a um produto do catálogo)
-- ============================================================

DO $$
DECLARE
  kid_001 UUID; kid_002 UUID; kid_003 UUID; kid_004 UUID; kid_005 UUID;
  kid_006 UUID; kid_007 UUID; kid_008 UUID; kid_009 UUID; kid_010 UUID;
BEGIN
  INSERT INTO kits (name, description) VALUES
    ('Kit Princesas Disney',  'Painel 1.50m + Cilindros + Box Princesas Disney')
    RETURNING id INTO kid_001;
  INSERT INTO kits (name, description) VALUES
    ('Kit Patrulha Canina',   'Painel 1.50m + Cilindros + Box Patrulha Canina Rosa')
    RETURNING id INTO kid_002;
  INSERT INTO kits (name, description) VALUES
    ('Kit Masha e o Urso',    'Painel 1.50m + Cilindros + Box Masha')
    RETURNING id INTO kid_003;
  INSERT INTO kits (name, description) VALUES
    ('Kit Boteco',            'Painel 1.50m + Cilindros + Box Boteco')
    RETURNING id INTO kid_004;
  INSERT INTO kits (name, description) VALUES
    ('Kit Stitch',            'Painel 1.50m + Cilindros + Box Stitch')
    RETURNING id INTO kid_005;
  INSERT INTO kits (name, description) VALUES
    ('Kit Minnie Mouse',      'Painel 1.50m + Cilindros + Box Minnie')
    RETURNING id INTO kid_006;
  INSERT INTO kits (name, description) VALUES
    ('Kit Debutante',         'Painel 1.50m + Cilindros + Box Debutante')
    RETURNING id INTO kid_007;
  INSERT INTO kits (name, description) VALUES
    ('Kit Carros',            'Painel 1.50m + Cilindros + Box Carros')
    RETURNING id INTO kid_008;
  INSERT INTO kits (name, description) VALUES
    ('Kit Dragon Ball Z',     'Painel 1.50m + Cilindros + Box Dragon Ball Z')
    RETURNING id INTO kid_009;
  INSERT INTO kits (name, description) VALUES
    ('Kit Astronauta',        'Painel 1.50m + Cilindros + Box Astronauta')
    RETURNING id INTO kid_010;

  -- KIT_ITEMS: estruturas compartilháveis por categoria + tema específico por SKU
  INSERT INTO kit_items (kit_id, category_needed, specific_sku) VALUES
    -- Kit 001 Princesas Disney
    (kid_001, 'EST-PNL-150', NULL), (kid_001, 'EST-CIL-JOG', NULL),
    (kid_001, NULL, 'TEMA-DISN-01'),
    -- Kit 002 Patrulha Canina
    (kid_002, 'EST-PNL-150', NULL), (kid_002, 'EST-CIL-JOG', NULL),
    (kid_002, NULL, 'TEMA-PATR-01'),
    -- Kit 003 Masha
    (kid_003, 'EST-PNL-150', NULL), (kid_003, 'EST-CIL-JOG', NULL),
    (kid_003, NULL, 'TEMA-MASH-01'),
    -- Kit 004 Boteco
    (kid_004, 'EST-PNL-150', NULL), (kid_004, 'EST-CIL-JOG', NULL),
    (kid_004, NULL, 'TEMA-BOTE-01'),
    -- Kit 005 Stitch
    (kid_005, 'EST-PNL-150', NULL), (kid_005, 'EST-CIL-JOG', NULL),
    (kid_005, NULL, 'TEMA-STIT-01'),
    -- Kit 006 Minnie
    (kid_006, 'EST-PNL-150', NULL), (kid_006, 'EST-CIL-JOG', NULL),
    (kid_006, NULL, 'TEMA-MINN-01'),
    -- Kit 007 Debutante
    (kid_007, 'EST-PNL-150', NULL), (kid_007, 'EST-CIL-JOG', NULL),
    (kid_007, NULL, 'TEMA-DEBU-01'),
    -- Kit 008 Carros
    (kid_008, 'EST-PNL-150', NULL), (kid_008, 'EST-CIL-JOG', NULL),
    (kid_008, NULL, 'TEMA-CARR-01'),
    -- Kit 009 Dragon Ball Z
    (kid_009, 'EST-PNL-150', NULL), (kid_009, 'EST-CIL-JOG', NULL),
    (kid_009, NULL, 'TEMA-DRAG-01'),
    -- Kit 010 Astronauta
    (kid_010, 'EST-PNL-150', NULL), (kid_010, 'EST-CIL-JOG', NULL),
    (kid_010, NULL, 'TEMA-ASTR-01');
END $$;
