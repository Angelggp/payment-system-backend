# Sistema de Pagos — Backend

API RESTful construida con **Node.js + Express**, **FastAPI (Python)** y **PostgreSQL**, orquestada con **Docker Compose**.

> Documentación detallada en la carpeta [`docs/`](./docs/).

---

## Requisitos

- [Docker](https://www.docker.com/) 24+
- [Docker Compose](https://docs.docker.com/compose/) v2+

---

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPO>
cd backend

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar todos los servicios
docker compose up --build
```

| Servicio | URL |
|---|---|
| API REST (Node.js) | http://localhost:3000 |
| Swagger UI — Node.js | http://localhost:3000/api-docs |
| Swagger UI — FastAPI | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

```bash
# Detener
docker compose down

# Detener y borrar la base de datos
docker compose down -v
```

---

## Probar con Postman

1. Importar `postman/collection.json` en Postman.
2. Ejecutar las requests en orden: **Crear Usuario → Registrar Tarjeta → Crear Pago → Historial**.  
   Los `ids` se guardan automáticamente entre requests gracias a los scripts de la colección.

---

## Ejecución local sin Docker

<details>
<summary>Ver instrucciones</summary>

### PostgreSQL
Necesitas una instancia local. Ejecuta el schema:
```bash
psql -U <usuario> -d <base_de_datos> -f api/db/schema.sql
```

### Servicio Python
```bash
cd payment-service
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### API Node.js
```bash
cd api
npm install
npm run dev
```

Ajusta las variables en `.env` apuntando a `localhost`.

</details>
# payment-system-backend
