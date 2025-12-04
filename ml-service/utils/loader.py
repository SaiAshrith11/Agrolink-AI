import os
import pickle
from tensorflow.keras.models import load_model

def load_safe(file_path, loader):
    if not os.path.exists(file_path):
        print(f"[⚠ Missing] {file_path}")
        return None
    print(f"[✔ Loaded] {file_path}")
    return loader(file_path)

def load_models():
    models = {
        "yield": load_safe("models/yield_model.pkl", lambda p: pickle.load(open(p, "rb"))),
        "price": load_safe("models/price_model.pkl", lambda p: pickle.load(open(p, "rb"))),
        "fertilizer": load_safe("models/fertilizer_model.pkl", lambda p: pickle.load(open(p, "rb"))),
        "quality": load_safe("models/quality_cnn.h5", load_model),
    }

    preprocess = {
        "scaler": load_safe("preprocess/scaler.pkl", lambda p: pickle.load(open(p, "rb"))),
        "crop_encoder": load_safe("preprocess/crop_encoder.pkl", lambda p: pickle.load(open(p, "rb"))),
    }

    print("Model loading finished")
    return models, preprocess
