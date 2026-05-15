const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const PORT = process.env.PORT || 3000;
const UPLOADS_DIR = path.join(__dirname, "uploads");
const HISTORIAS_FILE = path.join(__dirname, "historias.json");

// Helpers histórias
function lerHistorias() {
  if (!fs.existsSync(HISTORIAS_FILE)) return [];
  return JSON.parse(fs.readFileSync(HISTORIAS_FILE, "utf8"));
}
function salvarHistorias(data) {
  fs.writeFileSync(HISTORIAS_FILE, JSON.stringify(data, null, 2));
}

// Garante que a pasta uploads existe
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Sanitiza nomes para evitar path traversal e caracteres inválidos
function sanitize(name) {
  return name.replace(/[^a-zA-Z0-9_\-]/g, "");
}

// Configuração do multer: salva em /uploads/{comicName}/{chapterNumber}/
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const comic = sanitize(req.body.comicName || req.query.comicName || "");
    const chapter = sanitize(req.body.chapterNumber || req.query.chapterNumber || "");

    if (!comic || !chapter) return cb(new Error("comicName e chapterNumber são obrigatórios"));

    const dir = path.join(UPLOADS_DIR, comic, chapter);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-]/g, "");
    const name = `${base}${ext}`;
    const dir = path.join(
      UPLOADS_DIR,
      sanitize(req.body.comicName || req.query.comicName || ""),
      sanitize(req.body.chapterNumber || req.query.chapterNumber || "")
    );

    // Evita sobrescrever: adiciona sufixo numérico se já existir
    let finalName = name;
    let counter = 1;
    while (fs.existsSync(path.join(dir, finalName))) {
      finalName = `${base}_${counter}${ext}`;
      counter++;
    }
    cb(null, finalName);
  },
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error("Apenas imagens são permitidas"));
  },
});

// Serve imagens estaticamente em /images
app.use("/images", express.static(UPLOADS_DIR));

// POST /upload — recebe imagens via multipart/form-data
// Campos: comicName, chapterNumber, images (arquivo(s))
app.post("/upload", upload.array("images"), (req, res) => {
  const comic = sanitize(req.body.comicName || req.query.comicName || "");
  const chapter = sanitize(req.body.chapterNumber || req.query.chapterNumber || "");

  const urls = req.files.map(
    (f) => `http://localhost:${PORT}/images/${comic}/${chapter}/${f.filename}`
  );

  res.json({ comic, chapter, uploaded: urls });
});

// GET /comics/:comicName — lista capítulos disponíveis
app.get("/comics/:comicName", (req, res) => {
  const comic = sanitize(req.params.comicName);
  const comicDir = path.join(UPLOADS_DIR, comic);

  if (!fs.existsSync(comicDir))
    return res.status(404).json({ error: "Comic não encontrada" });

  const chapters = fs
    .readdirSync(comicDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  res.json({ comic, chapters });
});

// GET /comics/:comicName/:chapter — lista imagens de um capítulo em ordem
app.get("/comics/:comicName/:chapter", (req, res) => {
  const comic = sanitize(req.params.comicName);
  const chapter = sanitize(req.params.chapter);
  const chapterDir = path.join(UPLOADS_DIR, comic, chapter);

  if (!fs.existsSync(chapterDir))
    return res.status(404).json({ error: "Capítulo não encontrado" });

  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const images = fs
    .readdirSync(chapterDir)
    .filter((f) => imageExts.includes(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => `http://localhost:${PORT}/images/${comic}/${chapter}/${f}`);

  res.json({ comic, chapter, images });
});

// ===== ROTAS HISTÓRIAS PARALELAS =====

// GET /historias — lista todas
app.get("/historias", (req, res) => {
  res.json(lerHistorias());
});

// POST /historias — cria nova história
app.post("/historias", (req, res) => {
  const { titulo, capa, sinopse, classificacao, genero } = req.body;
  if (!titulo || !sinopse) return res.status(400).json({ error: "titulo e sinopse obrigatórios" });
  const historias = lerHistorias();
  historias.push({ titulo, capa: capa || "", sinopse, classificacao: classificacao || "", genero: genero || "", capitulos: [] });
  salvarHistorias(historias);
  res.json({ ok: true, id: historias.length - 1 });
});

// DELETE /historias/:id — remove história
app.delete("/historias/:id", (req, res) => {
  const historias = lerHistorias();
  const id = parseInt(req.params.id);
  if (isNaN(id) || !historias[id]) return res.status(404).json({ error: "não encontrada" });
  historias.splice(id, 1);
  salvarHistorias(historias);
  res.json({ ok: true });
});

// POST /historias/:id/capitulos — adiciona capítulo
app.post("/historias/:id/capitulos", (req, res) => {
  const { titulo, texto } = req.body;
  if (!titulo || !texto) return res.status(400).json({ error: "titulo e texto obrigatórios" });
  const historias = lerHistorias();
  const id = parseInt(req.params.id);
  if (isNaN(id) || !historias[id]) return res.status(404).json({ error: "não encontrada" });
  historias[id].capitulos.push({ titulo, texto });
  salvarHistorias(historias);
  res.json({ ok: true });
});

// DELETE /historias/:id/capitulos/:capId — remove capítulo
app.delete("/historias/:id/capitulos/:capId", (req, res) => {
  const historias = lerHistorias();
  const id = parseInt(req.params.id);
  const capId = parseInt(req.params.capId);
  if (isNaN(id) || !historias[id]) return res.status(404).json({ error: "não encontrada" });
  historias[id].capitulos.splice(capId, 1);
  salvarHistorias(historias);
  res.json({ ok: true });
});

// Tratamento de erros do multer e gerais
app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message });
});

app.listen(PORT, () => console.log("Sagile backend rodando"));
