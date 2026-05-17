-- ============================================================
-- Sistema de Pagos - Schema PostgreSQL
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- Tabla: usuarios
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Tabla: tarjetas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tarjetas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id      UUID        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titular         VARCHAR(100) NOT NULL,
    -- Solo guardamos los últimos 4 dígitos por seguridad
    ultimos_cuatro  CHAR(4)     NOT NULL,
    marca           VARCHAR(20) NOT NULL CHECK (marca IN ('visa', 'mastercard', 'amex', 'discover')),
    mes_expiracion  SMALLINT    NOT NULL CHECK (mes_expiracion BETWEEN 1 AND 12),
    anio_expiracion SMALLINT    NOT NULL CHECK (anio_expiracion >= 2024),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Tabla: pagos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  UUID           NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tarjeta_id  UUID           NOT NULL REFERENCES tarjetas(id) ON DELETE CASCADE,
    monto       NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
    moneda      CHAR(3)        NOT NULL DEFAULT 'USD',
    estado      VARCHAR(20)    NOT NULL CHECK (estado IN ('aprobado', 'rechazado', 'pendiente')),
    descripcion VARCHAR(255),
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Índices para consultas frecuentes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tarjetas_usuario ON tarjetas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagos_usuario    ON pagos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagos_tarjeta    ON pagos(tarjeta_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado     ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_created_at ON pagos(created_at DESC);

-- ------------------------------------------------------------
-- Función para actualizar updated_at automáticamente
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
