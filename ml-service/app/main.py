from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.config import settings

app = FastAPI(
    title="CogniStock ML Microservice",
    description="Private machine learning forecasting and inventory intelligence service for CogniStock full-stack platform.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1/ml")

@app.get("/health")
def root_health():
    return {
        "status": "online",
        "service": "cognistock-ml-service",
        "supported_models": ["Naive Baseline", "ARIMA/SARIMA", "XGBoost Regressor"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.ML_HOST, port=settings.ML_PORT, reload=False)
