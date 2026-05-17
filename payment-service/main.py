import random
from decimal import Decimal
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

# ------------------------------------------------------------------ #
#  App setup                                                           #
# ------------------------------------------------------------------ #

app = FastAPI(
    title="Payment Processing Service",
    description="Microservicio de procesamiento de pagos. Simula aprobación/rechazo (80/20).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ------------------------------------------------------------------ #
#  Schemas                                                             #
# ------------------------------------------------------------------ #

class PaymentRequest(BaseModel):
    amount: Decimal = Field(..., gt=0, description="Monto del pago (mayor a 0)")
    currency: str = Field(default="USD", min_length=3, max_length=3, description="Código ISO 4217")
    description: str | None = Field(default=None, max_length=255)

    @field_validator("currency")
    @classmethod
    def currency_uppercase(cls, v: str) -> str:
        return v.upper()


class PaymentResponse(BaseModel):
    approved: bool
    status: str
    message: str
    amount: Decimal
    currency: str
    processed_at: str


# ------------------------------------------------------------------ #
#  Routes                                                              #
# ------------------------------------------------------------------ #

@app.get("/health", tags=["Health"])
def health_check():
    """Verifica que el servicio esté en línea."""
    return {"status": "ok", "service": "payment-processing", "timestamp": _now()}


@app.post("/process-payment", response_model=PaymentResponse, tags=["Payments"])
def process_payment(payload: PaymentRequest):
    """
    Procesa un pago de forma simulada.

    - **80 %** de probabilidad de ser **aprobado**
    - **20 %** de probabilidad de ser **rechazado**
    """
    approved = random.random() < 0.80  # noqa: S311 — uso no criptográfico intencional

    return PaymentResponse(
        approved=approved,
        status="aprobado" if approved else "rechazado",
        message="Pago procesado exitosamente." if approved else "Pago rechazado por el procesador.",
        amount=payload.amount,
        currency=payload.currency,
        processed_at=_now(),
    )


# ------------------------------------------------------------------ #
#  Helpers                                                             #
# ------------------------------------------------------------------ #

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()
