// server.js
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ===== Variáveis de ambiente =====
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

// ===== Banco de dados PostgreSQL =====
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ===== Criar tabela se não existir =====
pool.query(`
CREATE TABLE IF NOT EXISTS stories (
  id SERIAL PRIMARY KEY,
  title TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`).catch(console.error);

// ===== Pasta de uploads =====
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ===== Configuração do multer =====
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(UPLOADS_DIR);
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-]/g, "");
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  },
});

// ===== Rotas =====

// Teste se está online
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Sagile Studios API online" });
});

// Listar todas histórias
app.get("/stories", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM stories ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar histórias" });
  }
});

// Criar nova história
app.post("/stories", async (req, res) => {
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

// Upload de imagens
app.post("/upload", upload.array("images"), (req, res) => {
  const urls = req.files.map(f => `${req.protocol}://${req.get("host")}/uploads/${f.filename}`);
  res.json({ uploaded: urls });
});

// Servir imagens estaticamente
app.use("/uploads", express.static(UPLOADS_DIR));

// ===== Tratamento de erros =====
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// ===== Iniciar servidor =====
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});