-- Adiciona coluna de imagem aos kits
ALTER TABLE kits ADD COLUMN IF NOT EXISTS image TEXT;
