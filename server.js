require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const telegram = require("./connectors/telegram");
const x = require("./connectors/twitter");
const { estimateCost } = require("./pricing");
const { logPublication, getMonthlyTotal, getRecentLogs } = require("./db");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const upload = multer({ dest: path.join(__dirname, "uploads") });

const CONNECTORS = {
  telegram: telegram.publish,
  x: x.publish,
};

// Estimation du cout AVANT publication (affichee a l'utilisateur)
app.post("/api/estimate", express.json(), (req, res) => {
  const { platforms = [], caption = "" } = req.body;
  const hasLink = /https?:\/\//i.test(caption);

  const estimate = platforms.map((p) => ({
    platform: p,
    cost: estimateCost(p, { hasLink }),
  }));

  res.json({
    estimate,
    total: estimate.reduce((sum, e) => sum + e.cost, 0),
  });
});

// Publication effective sur les plateformes choisies, en parallele
app.post("/api/publish", upload.single("file"), async (req, res) => {
  const { platforms, caption } = req.body;
  const selected = (Array.isArray(platforms) ? platforms : [platforms]).filter(Boolean);

  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier fourni" });
  }
  if (selected.length === 0) {
    return res.status(400).json({ error: "Aucune plateforme selectionnee" });
  }

  const filePath = req.file.path;
  const options = {
    caption: caption || "",
    mimetype: req.file.mimetype,
  };

  const jobs = selected
    .filter((p) => CONNECTORS[p])
    .map((p) => CONNECTORS[p](filePath, options));

  const results = await Promise.all(jobs);

  results.forEach((r) =>
    logPublication({
      platform: r.platform,
      success: r.success,
      cost: r.success ? r.cost : 0,
      filename: req.file.originalname,
      caption: options.caption,
      error: r.success ? null : r.detail,
    })
  );

  fs.unlink(filePath, () => {});

  res.json({
    results,
    monthlyTotal: getMonthlyTotal(),
  });
});

// Historique + total mensuel (pour affichage dashboard)
app.get("/api/usage", (req, res) => {
  res.json({
    monthlyTotal: getMonthlyTotal(),
    recent: getRecentLogs(20),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur pret sur http://localhost:${PORT}`);
});
