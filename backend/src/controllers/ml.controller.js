const { spawn } = require("child_process");
const path = require("path");

// This controller sends data to a Python ML model and returns predictions.
exports.analyzeCrop = async (req, res, next) => {
  try {
    const {
      moisture,
      temperature,
      npk,
      ph,
      humidity,
      cropType = "generic"
    } = req.body;

    // If image was uploaded, pass the file path
    const imagePath = req.file
      ? path.join(__dirname, "..", "..", req.file.path)
      : "none";

    const pythonScript = path.join(__dirname, "../ml/predict.py");

    const python = spawn("python", [
      pythonScript,
      moisture,
      temperature,
      npk,
      ph,
      humidity,
      cropType,
      imagePath
    ]);

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {
      if (errorOutput.trim().length > 0) {
        console.error("Python Error:", errorOutput);
      }

      try {
        const result = JSON.parse(output);
        return res.json({
          success: true,
          sensors: {
            moisture: Number(moisture),
            temperature: Number(temperature),
            npk: Number(npk),
            ph: Number(ph),
            humidity: Number(humidity)
          },
          cropType,
          ...result
        });
      } catch (err) {
        console.error("ML Output Parse Error:", output);
        return res.status(500).json({
          success: false,
          error: "Prediction output invalid",
          raw: output
        });
      }
    });
  } catch (err) {
    next(err);
  }
};
