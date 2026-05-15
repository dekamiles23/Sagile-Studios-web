const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ===== FRONTEND =====
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== BANCO DE DADOS =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.query(`
  CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    title TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(console.error);

// ===== UPLOADS =====
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, UPLOADS_DIR); },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-]/g, "");
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

app.use("/uploads", express.static(UPLOADS_DIR));

// ===== ROTAS API =====
app.get("/api/stories", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM stories ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar histórias" });
  }
});

app.post("/api/stories", async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: "title e content obrigatórios" });
  try {
    const result = await pool.query(
      "INSERT INTO stories (title, content) VALUES ($1, $2) RETURNING *",
      [title, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar história" });
  }
});

app.post("/api/upload", upload.array("images"), (req, res) => {
  const urls = req.files.map(f => `${req.protocol}://${req.get("host")}/uploads/${f.filename}`);
  res.json({ uploaded: urls });
});

// ===== ERRO GLOBAL =====
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
