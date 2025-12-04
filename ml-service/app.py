from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from utils.loader import load_models
from predictor import predict_all
import uvicorn

app = FastAPI(title="Agrolink ML API")

# CORS for Node backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML models once on startup
models, preprocess = load_models()

@app.post("/predict")
async def predict(
    crop: str = Form(...),
    temperature: float = Form(...),
    moisture: float = Form(...),
    npk: float = Form(...),
    ph: float = Form(...),
    humidity: float = Form(...),
    image: UploadFile = File(None)
):
    try:
        img_bytes = await image.read() if image else None

        result = predict_all(
            models, preprocess,
            crop, temperature, moisture, npk, ph, humidity,
            img_bytes
        )
        return result

    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
