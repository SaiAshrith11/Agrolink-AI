import express from "express";
import fetch from "node-fetch";
import { auth } from "../middleware/auth.js"; // if auth needed

const router = express.Router();

const ML_URL = "https://agrolink-ai-2.onrender.com/analyze"; // FastAPI service

router.post("/analyze", auth, async (req, res) => {
  try {
    const formData = new FormData();

    for (const key in req.body) {
      formData.append(key, req.body[key]);
    }

    if (req.files?.image) {
      formData.append("image", req.files.image.data, req.files.image.name);
    }

    const response = await fetch(ML_URL, {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    return res.json(data);

  } catch (err) {
    console.error("ML request failed", err);
    return res.status(500).json({ error: "ML Server not reachable" });
  }
});

export default router;
