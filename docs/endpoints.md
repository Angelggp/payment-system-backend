# Referencia de Endpoints

Base URL: `http://localhost:3000`

---

## Usuarios

### POST /api/usuarios
Crea un nuevo usuario.

**Body**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com"
}
```

**Respuesta 201**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "created_at": "2026-05-16T10:00:00Z"
  }
}
```

**Errores**
| Código | Motivo |
|---|---|
| 409 | El email ya existe |
| 422 | `nombre` vacío o `email` con formato incorrecto |

---

### GET /api/usuarios/:id
Obtiene un usuario por su UUID.

**Respuesta 200**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "created_at": "2026-05-16T10:00:00Z"
  }
}
```

**Errores**
| Código | Motivo |
|---|---|
| 404 | Usuario no encontrado |

---

## Tarjetas

### POST /api/usuarios/:id/tarjetas
Registra una tarjeta de crédito ficticia asociada al usuario.

> El campo `numero_tarjeta` **nunca se almacena**. Solo se persisten los últimos 4 dígitos.

**Body**
```json
{
  "titular": "JUAN PEREZ",
  "numero_tarjeta": "4111111111111111",
  "marca": "visa",
  "mes_expiracion": 12,
  "anio_expiracion": 2027
}
```

Valores válidos para `marca`: `visa`, `mastercard`, `amex`, `discover`.

**Respuesta 201**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "usuario_id": "uuid",
    "titular": "JUAN PEREZ",
    "ultimos_cuatro": "1111",
    "marca": "visa",
    "mes_expiracion": 12,
    "anio_expiracion": 2027,
    "created_at": "2026-05-16T10:00:00Z"
  }
}
```

**Errores**
| Código | Motivo |
|---|---|
| 404 | Usuario no encontrado |
| 422 | Datos inválidos (número de tarjeta, marca, fechas) |

---

### GET /api/usuarios/:id/tarjetas
Lista todas las tarjetas registradas de un usuario.

**Respuesta 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "usuario_id": "uuid",
      "titular": "JUAN PEREZ",
      "ultimos_cuatro": "1111",
      "marca": "visa",
      "mes_expiracion": 12,
      "anio_expiracion": 2027,
      "created_at": "2026-05-16T10:00:00Z"
    }
  ]
}
```

---

## Pagos

### POST /api/pagos
Crea un pago. Internamente llama al servicio FastAPI para aprobar o rechazar.

**Body**
```json
{
  "usuario_id": "uuid",
  "tarjeta_id": "uuid",
  "monto": 150.00,
  "moneda": "USD",
  "descripcion": "Compra en tienda online"
}
```

`moneda` es opcional (default `USD`). `descripcion` es opcional.

**Respuesta 201 — pago aprobado**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "usuario_id": "uuid",
    "tarjeta_id": "uuid",
    "monto": "150.00",
    "moneda": "USD",
    "estado": "aprobado",
    "descripcion": "Compra en tienda online",
    "created_at": "2026-05-16T10:00:00Z"
  },
  "processor": {
    "approved": true,
    "message": "Pago procesado exitosamente.",
    "processed_at": "2026-05-16T10:00:00Z"
  }
}
```

**Respuesta 200 — pago rechazado**

Misma estructura, con `"estado": "rechazado"` y `"approved": false`.

**Errores**
| Código | Motivo |
|---|---|
| 404 | Usuario o tarjeta no encontrada |
| 404 | La tarjeta no pertenece al usuario |
| 422 | `monto` negativo o cero, `uuid` inválido |
| 503 | Servicio Python de pagos no disponible |

---

### GET /api/usuarios/:id/pagos
Historial de pagos de un usuario, ordenado por fecha descendente.

**Query params opcionales**

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `estado` | string | — | Filtrar: `aprobado`, `rechazado`, `pendiente` |
| `limit` | integer | 20 | Límite de resultados |
| `offset` | integer | 0 | Para paginación |

**Ejemplo:** `/api/usuarios/:id/pagos?estado=aprobado&limit=5&offset=0`

**Respuesta 200**
```json
{
  "success": true,
  "total": 2,
  "data": [
    {
      "id": "uuid",
      "monto": "150.00",
      "moneda": "USD",
      "estado": "aprobado",
      "descripcion": "Compra en tienda online",
      "created_at": "2026-05-16T10:00:00Z",
      "tarjeta": {
        "id": "uuid",
        "marca": "visa",
        "ultimos_cuatro": "1111",
        "titular": "JUAN PEREZ"
      }
    }
  ]
}
```

---

## Health Checks

### GET /health (Node.js)
```json
{ "status": "ok", "uptime": 123.45, "timestamp": "2026-05-16T10:00:00Z" }
```

### GET http://localhost:8000/health (FastAPI)
```json
{ "status": "ok", "service": "payment-processing", "timestamp": "2026-05-16T10:00:00Z" }
```

---

## Formato de errores

Todos los errores devuelven la misma estructura:

```json
{
  "success": false,
  "error": "Descripción del error",
  "details": ["campo: mensaje de validación"]
}
```

`details` solo aparece en errores de validación (422).
