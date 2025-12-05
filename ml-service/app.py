from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

app = FastAPI(title="AgroLink ML Service")

# Allow calls from your frontend / backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # you can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def num(x, default=0.0):
    try:
        v = float(x)
        if v != v:  # NaN
            return default
        return v
    except Exception:
        return default


def run_models(moisture, temperature, npk, ph, humidity, crop_type: str):
    """
    Pure rule-based 'model' using sensor values.
    This replaces the need for external .pkl / .h5 files for now.
    """

    # sensible defaults
    moisture = num(moisture, 40)
    temperature = num(temperature, 28)
    npk = num(npk, 350)
    ph = num(ph, 6.8)
    humidity = num(humidity, 50)

    # ------------------ YIELD PREDICTION (0–100%) ------------------
    yield_score = 0.0

    # moisture sweet spot
    if 35 <= moisture <= 55:
        yield_score += 30
    elif 25 <= moisture < 35 or 55 < moisture <= 65:
        yield_score += 20
    else:
        yield_score += 10

    # temperature
    if 20 <= temperature <= 32:
        yield_score += 30
    elif 16 <= temperature < 20 or 32 < temperature <= 35:
        yield_score += 20
    else:
        yield_score += 10

    # pH
    if 6.0 <= ph <= 7.2:
        yield_score += 20
    elif 5.5 <= ph < 6.0 or 7.2 < ph <= 7.8:
        yield_score += 10

    # NPK
    if 300 <= npk <= 600:
        yield_score += 20
    elif 250 <= npk < 300 or 600 < npk <= 700:
        yield_score += 10

    yield_percent = int(max(0, min(100, round(yield_score))))

    # ------------------ PRICE PREDICTION (₹/kg) ------------------
    # Base price for tomato. You can tune this later or link to real mandi data.
    base_price = 20.0

    # better yield, slightly lower price; poor yield, higher price
    scarcity_factor = (100 - yield_percent) / 100.0

    # moisture & temperature also affect price a bit
    env_factor = 0.05 * (moisture - 45) + 0.1 * (temperature - 28)

    estimated_price = base_price + 5 * scarcity_factor + env_factor
    price = round(max(5, estimated_price), 2)

    # ------------------ FERTILIZER SUGGESTION ------------------
    fert_msg_parts = []

    if npk < 280:
        fert_msg_parts.append("Soil nutrients are LOW. Add NPK-rich fertilizer.")
    elif npk > 650:
        fert_msg_parts.append("Soil nutrients are HIGH. Avoid heavy fertilizer dose.")
    else:
        fert_msg_parts.append("Soil nutrients are in a good range.")

    if moisture < 30:
        fert_msg_parts.append("Irrigate the field, moisture is too low.")
    elif moisture > 70:
        fert_msg_parts.append("Avoid over-irrigation, moisture is high.")

    if ph < 6.0:
        fert_msg_parts.append("Soil is slightly acidic, consider adding lime.")
    elif ph > 7.5:
        fert_msg_parts.append("Soil is slightly alkaline, use pH balancing amendments.")

    fertilizer_suggestion = " ".join(fert_msg_parts)

    # ------------------ QUALITY SCORE (LOW / MEDIUM / HIGH) ------------------
    quality_score = 0

    if 35 <= moisture <= 60:
        quality_score += 1
    if 20 <= temperature <= 32:
        quality_score += 1
    if 300 <= npk <= 600:
        quality_score += 1
    if 6.0 <= ph <= 7.2:
        quality_score += 1
    if yield_percent >= 60:
        quality_score += 1

    if quality_score >= 4:
        quality = "HIGH"
    elif quality_score >= 2:
        quality = "MEDIUM"
    else:
        quality = "LOW"

    return {
        "yieldPercent": yield_percent,
        "price": price,
        "fertilizerSuggestion": fertilizer_suggestion,
        "quality": quality,
    }


@app.get("/")
def root():
    return {"status": "ok", "service": "AgroLink ML Service"}

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow frontend + backend requests
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze(
    moisture: float = Form(...),
    temperature: float = Form(...),
    npk: float = Form(...),
    ph: float = Form(...),
    humidity: float = Form(50.0),
    cropType: Optional[str] = Form("tomato"),
    image: Optional[UploadFile] = File(None),
):
    """
    Main endpoint that your Node backend and farmer dashboard will call.
    Accepts sensor values + optional image (currently not used in logic).
    """

    result = run_models(
        moisture=moisture,
        temperature=temperature,
        npk=npk,
        ph=ph,
        humidity=humidity,
        crop_type=cropType or "tomato",
    )

    # NOTE: image is accepted but not processed yet.
    image_info = None
    if image is not None:
        image_info = {"filename": image.filename, "content_type": image.content_type}

    return {
        "success": True,
        "cropType": cropType,
        "image": image_info,
        "sensors": {
            "moisture": moisture,
            "temperature": temperature,
            "npk": npk,
            "ph": ph,
            "humidity": humidity,
        },
        **result,
    }
