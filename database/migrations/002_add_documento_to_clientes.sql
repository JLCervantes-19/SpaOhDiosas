-- ============================================================
-- Migration: Add Documento Column to Clientes Table
-- Description: Adds documento field to clientes table to enable
--              appointment lookup by ID document
-- ============================================================

-- ——— ADD COLUMN ——————————————————————————————————————————
-- Add documento column (nullable for backward compatibility)
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS documento TEXT;

-- ——— CREATE INDEX ————————————————————————————————————————
-- Index for fast documento lookups
CREATE INDEX IF NOT EXISTS idx_clientes_documento 
ON clientes(documento) 
WHERE documento IS NOT NULL;

-- ——— COMMENTS ————————————————————————————————————————————
COMMENT ON COLUMN clientes.documento IS 'Documento de identidad del cliente (cédula, pasaporte, etc.) - usado para consultar citas en el chat';

-- ——— NOTES ———————————————————————————————————————————————
-- This column is nullable to maintain backward compatibility
-- with existing cliente records that don't have a documento.
-- 
-- The chat system will request documento when users want to
-- check their appointments. Future bookings can optionally
-- collect this information.
--
-- The partial index (WHERE documento IS NOT NULL) ensures
-- efficient lookups while not wasting space on NULL values.
