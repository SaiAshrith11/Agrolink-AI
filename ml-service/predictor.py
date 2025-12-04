import numpy as np
import cv2
from tensorflow.keras.models import load_model

def predict_all(models, preprocess, crop, t, m, npk, ph, h, img_bytes):
    scaler = preprocess["scaler"]
    crop_enc = preprocess["crop_encoder"]
    cnn = models["quality"]

    # Standard feature predictions
    X = np.array([[t, m, npk, ph, h]])
    X_scaled = scaler.transform(X)

    crop_encoded = crop_enc.transform([crop])[0]

    yield_pred = models["yield"].predict([[crop_encoded] + X_scaled.flatten().tolist()])[0]
    price_pred = models["price"].predict([[crop_encoded] + X_scaled.flatten().tolist()])[0]
    fert_pred = models["fertilizer"].predict([[crop_encoded] + X_scaled.flatten().tolist()])[0]

    # Quality prediction from image
    quality_grade = "Unknown"
    if img_bytes:
        npimg = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
        img = cv2.resize(img, (128, 128))
        img = img / 255.0
        img = np.expand_dims(img, axis=0)
        grade_idx = np.argmax(cnn.predict(img))
        quality_grade = ["D", "C", "B", "A"][grade_idx]

    return {
        "success": True,
        "yieldPercent": round(yield_pred, 2),
        "expectedPrice": round(price_pred, 2),
        "fertilizerSuggestion": str(fert_pred).replace("_", " "),
        "quality": quality_grade
    }
