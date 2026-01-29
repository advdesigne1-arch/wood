// backend/server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { products } from "./data/products.js";

const app = express();
app.use(cors());
app.use(express.json());

// Needed for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const frontendPath = path.join(__dirname, "..", "frontend");

// ✅ Serve frontend static files (HTML/CSS/JS + images folder)
app.use(express.static(frontendPath));

// ✅ API
app.get("/api/products", (req, res) => {
  res.json(products);
});

// ✅ default route
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
