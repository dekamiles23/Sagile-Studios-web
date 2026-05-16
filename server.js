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
    capa TEXT,
    classificacao TEXT,
    genero TEXT,
    capitulos TEXT DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => {
  // adiciona colunas novas se a tabela já existia sem elas
  return pool.query(`
    ALTER TABLE stories
      ADD COLUMN IF NOT EXISTS capa TEXT,
      ADD COLUMN IF NOT EXISTS classificacao TEXT,
      ADD COLUMN IF NOT EXISTS genero TEXT,
      ADD COLUMN IF NOT EXISTS capitulos TEXT DEFAULT '[]'
  `);
}).catch(console.error);

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

app.get(["/api/stories", "/historias"], async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM stories ORDER BY id ASC");
    const rows = result.rows.map(r => ({
      ...r,
      titulo: r.title,
      sinopse: r.content,
      capitulos: JSON.parse(r.capitulos || "[]")
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar histórias" });
  }
});

app.post(["/api/stories", "/historias"], async (req, res) => {
  const title = req.body.title || req.body.titulo;
  const content = req.body.content || req.body.sinopse;
  const { capa, classificacao, genero } = req.body;
  if (!title || !content) return res.status(400).json({ error: "titulo e sinopse obrigatórios" });
  try {
    const result = await pool.query(
      "INSERT INTO stories (title, content, capa, classificacao, genero, capitulos) VALUES ($1,$2,$3,$4,$5,'[]') RETURNING *",
      [title, content, capa || "", classificacao || "", genero || ""]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar história" });
  }
});

app.delete(["/historias/:id", "/api/stories/:id"], async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await pool.query("DELETE FROM stories WHERE id = $1", [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar" });
  }
});

app.post(["/historias/:id/capitulos"], async (req, res) => {
  const id = parseInt(req.params.id);
  const { titulo, texto } = req.body;
  if (!titulo || !texto) return res.status(400).json({ error: "titulo e texto obrigatórios" });
  try {
    const result = await pool.query("SELECT capitulos FROM stories WHERE id = $1", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "não encontrada" });
    const caps = JSON.parse(result.rows[0].capitulos || "[]");
    caps.push({ titulo, texto });
    await pool.query("UPDATE stories SET capitulos = $1 WHERE id = $2", [JSON.stringify(caps), id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar capítulo" });
  }
});

app.delete("/historias/:id/capitulos/:capId", async (req, res) => {
  const id = parseInt(req.params.id);
  const capId = parseInt(req.params.capId);
  try {
    const result = await pool.query("SELECT capitulos FROM stories WHERE id = $1", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "não encontrada" });
    const caps = JSON.parse(result.rows[0].capitulos || "[]");
    caps.splice(capId, 1);
    await pool.query("UPDATE stories SET capitulos = $1 WHERE id = $2", [JSON.stringify(caps), id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar capítulo" });
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
