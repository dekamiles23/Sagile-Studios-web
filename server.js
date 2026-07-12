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


const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
// const { Pool } = require("pg"); // DB desativado temporariamente

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// SERVIR ARQUIVOS PÚBLICOS
app.use(express.static(path.join(__dirname, "public")));


// ROBOTS.TXT
app.get("/robots.txt", (req,res)=>{
    res.type("text/plain");
    res.sendFile(path.join(__dirname,"public","robots.txt"));
});


// SITEMAP.XML (recomendado também)
app.get("/sitemap.xml", (req,res)=>{
    res.type("application/xml");
    res.sendFile(path.join(__dirname,"public","sitemap.xml"));
});


// ===== ARMAZENAMENTO EM MEMÓRIA (DB desativado) =====
let stories = [];
let nextId = 1;

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

// ===== ROTAS API (antes do static) =====

// Diagnóstico
app.get("/health", (req, res) => {
  res.json({ db: "desativado", status: "ok" });
});

// Teste (mantido por compatibilidade)
app.get("/test-insert", (req, res) => {
  const row = { id: nextId++, title: "teste", content: "conteudo teste", capa: "", classificacao: "", genero: "", capitulos: [] };
  stories.push(row);
  res.json({ ok: true, row });
});

app.get(["/api/stories", "/historias"], (req, res) => {
  res.json(stories.map(r => ({ ...r, titulo: r.title, sinopse: r.content })));
});

app.post(["/api/stories", "/historias"], (req, res) => {
  const title = req.body.title || req.body.titulo;
  const content = req.body.content || req.body.sinopse;
  const capa = req.body.capa || "";
  const classificacao = req.body.classificacao || "";
  const genero = req.body.genero || "";
  if (!title || !content) return res.status(400).json({ error: "titulo e sinopse obrigatórios" });
  const row = { id: nextId++, title, content, capa, classificacao, genero, capitulos: [] };
  stories.push(row);
  res.json({ ...row, titulo: row.title, sinopse: row.content });
});

app.delete(["/historias/:id", "/api/stories/:id"], (req, res) => {
  const id = parseInt(req.params.id);
  const idx = stories.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: "não encontrada" });
  stories.splice(idx, 1);
  res.json({ ok: true });
});

app.post("/historias/:id/capitulos", (req, res) => {
  const id = parseInt(req.params.id);
  const { titulo, texto } = req.body;
  if (!titulo || !texto) return res.status(400).json({ error: "titulo e texto obrigatórios" });
  const story = stories.find(s => s.id === id);
  if (!story) return res.status(404).json({ error: "não encontrada" });
  story.capitulos.push({ titulo, texto });
  res.json({ ok: true });
});

app.delete("/historias/:id/capitulos/:capId", (req, res) => {
  const id = parseInt(req.params.id);
  const capId = parseInt(req.params.capId);
  const story = stories.find(s => s.id === id);
  if (!story) return res.status(404).json({ error: "não encontrada" });
  story.capitulos.splice(capId, 1);
  res.json({ ok: true });
});

app.post("/api/upload", upload.array("images"), (req, res) => {
  const urls = req.files.map(f => `${req.protocol}://${req.get("host")}/uploads/${f.filename}`);
  res.json({ uploaded: urls });
});

app.use("/uploads", express.static(UPLOADS_DIR));

// ===== FRONTEND (depois das rotas API) =====
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== ERRO GLOBAL =====
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));


// ===== BANCO DE DADOS =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.query(`
  CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    title TEXT DEFAULT '',
    content TEXT DEFAULT '',
    capa TEXT DEFAULT '',
    classificacao TEXT DEFAULT '',
    genero TEXT DEFAULT '',
    capitulos TEXT DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => pool.query(`
  ALTER TABLE stories
    ADD COLUMN IF NOT EXISTS title TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS content TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS capa TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS classificacao TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS genero TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS capitulos TEXT DEFAULT '[]'
`)).then(() => console.log("Tabela pronta")).catch(console.error);

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

// ===== ROTAS API (antes do static) =====

// Diagnóstico
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ db: "ok" });
  } catch(e) {
    res.status(500).json({ db: "erro", msg: e.message });
  }
});

// Teste direto do INSERT
app.get("/test-insert", async (req, res) => {
  try {
    const result = await pool.query(
      "INSERT INTO stories (title, content, capa, classificacao, genero, capitulos) VALUES ($1,$2,$3,$4,$5,'[]') RETURNING *",
      ["teste", "conteudo teste", "", "", ""]
    );
    res.json({ ok: true, row: result.rows[0] });
  } catch(e) {
    res.status(500).json({ erro: e.message });
  }
});

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
  const capa = req.body.capa || "";
  const classificacao = req.body.classificacao || "";
  const genero = req.body.genero || "";
  if (!title || !content) return res.status(400).json({ error: "titulo e sinopse obrigatórios" });
  try {
    const result = await pool.query(
      "INSERT INTO stories (title, content, capa, classificacao, genero, capitulos) VALUES ($1,$2,$3,$4,$5,'[]') RETURNING *",
      [title, content, capa, classificacao, genero]
    );
    const row = result.rows[0];
    res.json({ ...row, titulo: row.title, sinopse: row.content, capitulos: [] });
  } catch (err) {
    console.error("ERRO POST /historias:", err.message);
    res.status(500).json({ error: err.message });
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

app.post("/historias/:id/capitulos", async (req, res) => {
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

app.use("/uploads", express.static(UPLOADS_DIR));

// ===== FRONTEND (depois das rotas API) =====
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== ERRO GLOBAL =====
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
