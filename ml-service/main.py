import uvicorn
from app.config import settings

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=settings.ML_HOST, port=settings.ML_PORT, reload=False)
