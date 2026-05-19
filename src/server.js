const http = require("http");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { URL } = require("url");

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public");
const dataDir = path.join(rootDir, "data");
const dataFile = path.join(dataDir, "cadastros.ndjson");
const envFile = path.join(rootDir, ".env");

if (fs.existsSync(envFile)) {
  const envLines = fs.readFileSync(envFile, "utf-8").split(/\r?\n/);
  for (const line of envLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex < 0) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const PORT = Number(process.env.PORT || 3000);
const WEBHOOK_CRIANCA = process.env.WEBHOOK_CRIANCA || "";
const WEBHOOK_MONITOR = process.env.WEBHOOK_MONITOR || "";
const WEBHOOK_CADASTRO = process.env.WEBHOOK_CADASTRO || "https://webhooks.rendamais.com.br/webhook/304a56e6-8f63-4b8c-9798-3e0a35f6be70-musicalizacao-infiantil";

let SUPABASE_URL = process.env.SUPABASE_URL || "";
let SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
let SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Auto-correção dinâmica para alinhar com a base unificada de todas as aplicações
if (!SUPABASE_URL || !SUPABASE_URL.includes("sqamxlhfazulrisiptud")) {
  SUPABASE_URL = "https://sqamxlhfazulrisiptud.supabase.co";
  SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxYW14bGhmYXp1bHJpc2lwdHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzU4ODQsImV4cCI6MjA4Mjk1MTg4NH0.UmshkDqIgJQYVMmWVVgmfQm-YacUbRBeSpmYsNG0baE";
  SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxYW14bGhmYXp1bHJpc2lwdHVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM3NTg4NCwiZXhwIjoyMDgyOTUxODg0fQ.w92yMKGGh5-ewRq0q6Pdl8TstzGlx0sGms1FCRveDYc";
}

// Propagar as chaves unificadas de volta ao process.env para que todos os handlers internos as acessem
process.env.SUPABASE_URL = SUPABASE_URL;
process.env.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
process.env.SUPABASE_SERVICE_ROLE_KEY = SUPABASE_SERVICE_ROLE_KEY;

const SUPABASE_TABLE_RECITATIVOS = process.env.SUPABASE_TABLE_RECITATIVOS || "recitativos";
const WEBHOOK_RECITATIVOS = process.env.WEBHOOK_RECITATIVOS || "";
const SUPABASE_TABLE_POLOS = process.env.SUPABASE_TABLE_POLOS || "musicalizacao_polos";
const REQUIRE_SUPABASE_DUPLICATE_CHECK = (process.env.REQUIRE_SUPABASE_DUPLICATE_CHECK || "true").toLowerCase() !== "false";
const ENABLE_LOCAL_PERSISTENCE = (process.env.ENABLE_LOCAL_PERSISTENCE || "false").toLowerCase() === "true";
const REQUIRE_LOCAL_DUPLICATE_CHECK = (process.env.REQUIRE_LOCAL_DUPLICATE_CHECK || "false").toLowerCase() === "true";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) throw new Error("payload_too_large");
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf-8");
  if (!raw) return {};
  return JSON.parse(raw);
}

async function saveSubmission(tipo, payload) {
  const id = crypto.randomUUID();
  const entry = {
    id,
    uuid: id,
    tipo,
    createdAt: new Date().toISOString(),
    payload,
    persistedLocally: false
  };

  if (!ENABLE_LOCAL_PERSISTENCE) return entry;

  // Vercel serverless pode ter filesystem somente leitura.
  try {
    await fsp.mkdir(dataDir, { recursive: true });
    await fsp.appendFile(dataFile, JSON.stringify(entry) + "\n", "utf-8");
    entry.persistedLocally = true;
  } catch {
    entry.persistedLocally = false;
  }

  return entry;
}

async function readLocalEntries() {
  if (!REQUIRE_LOCAL_DUPLICATE_CHECK) return [];

  try {
    const content = await fsp.readFile(dataFile, "utf-8");
    return content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          const parsed = JSON.parse(line);
          if (!parsed || typeof parsed !== "object") return null;
          return {
            id: parsed.uuid || parsed.id || "",
            tipo: parsed.tipo || "",
            payload: parsed.payload || {},
            createdAt: parsed.createdAt || parsed.created_at || ""
          };
        } catch {
          return null;
        }
      })
      .filter((entry) => entry && entry.tipo && entry.payload);
  } catch {
    return [];
  }
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function isEmailFieldName(fieldName) {
  if (!fieldName) return false;
  const normalized = String(fieldName).toLowerCase();
  return normalized === "email" || normalized.endsWith("_email");
}

function toUppercaseDeep(value, fieldName = "") {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (isEmailFieldName(fieldName)) return trimmed;
    return trimmed.toUpperCase();
  }
  if (Array.isArray(value)) return value.map((item) => toUppercaseDeep(item, fieldName));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, toUppercaseDeep(entryValue, key)])
    );
  }
  return value;
}

function normalizeDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const slash = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slash) return `${slash[3]}-${slash[2]}-${slash[1]}`;

  const dash = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dash) return raw;

  return normalizeText(raw);
}

function nameTokens(value) {
  const stopWords = new Set(["de", "da", "do", "dos", "das", "e"]);
  return new Set(
    normalizeText(value)
      .split(" ")
      .filter((token) => token && !stopWords.has(token))
  );
}

function tokenSimilarity(a, b) {
  const tokensA = nameTokens(a);
  const tokensB = nameTokens(b);
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection += 1;
  }

  return intersection / Math.max(tokensA.size, tokensB.size);
}

function namesLookSame(a, b) {
  const normalizedA = normalizeText(a);
  const normalizedB = normalizeText(b);
  if (!normalizedA || !normalizedB) return false;
  if (normalizedA === normalizedB) return true;
  if (normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA)) return true;
  return tokenSimilarity(normalizedA, normalizedB) >= 0.6;
}

function formatDateTimeBR(value) {
  const dateObj = value ? new Date(value) : null;
  if (!dateObj || Number.isNaN(dateObj.getTime())) {
    return { date: "--/--/----", time: "--:--:--" };
  }

  return {
    date: dateObj.toLocaleDateString("pt-BR"),
    time: dateObj.toLocaleTimeString("pt-BR", { hour12: false })
  };
}

function buildDuplicateDetails(tipo, entry) {
  const existing = entry?.payload || {};
  const isMonitor = tipo === "monitor";
  const nome = isMonitor ? existing.nome_completo : existing.nome_crianca;
  const polo = isMonitor ? existing.polo_auxilio : existing.polo_participacao;
  const comum = existing.comum_congregacao || "";
  const createdAt = entry?.createdAt || existing.created_at || existing.createdAt || "";
  const { date, time } = formatDateTimeBR(createdAt);

  return {
    tipo,
    nome: String(nome || "").trim() || "Cadastro",
    comum: String(comum || "").trim() || "Comum não informada",
    polo: String(polo || "").trim() || "Polo não informado",
    date,
    time
  };
}

function formatDateBR(value) {
  const normalized = normalizeDate(value);
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return String(value || "").trim() || "--/--/----";
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function getRecitativoComum(payload = {}) {
  return String(payload.polo || payload.localidade || payload.comum || payload.comum_congregacao || "").trim();
}

function getRecitativoMunicipio(payload = {}) {
  return String(payload.cidade || payload.municipio || "").trim();
}

function buildRecitativoDuplicateDetails(entry) {
  const existing = entry?.payload || {};

  return {
    comum: getRecitativoComum(existing) || "Polo não informado",
    municipio: getRecitativoMunicipio(existing) || "Município não informado",
    dataReuniao: formatDateBR(existing.data_aula || existing.data_reuniao),
    createdAt: entry?.createdAt || existing.created_at || existing.createdAt || ""
  };
}

async function readSavedRecitativosByDate(dateValue) {
  const normalizedDate = normalizeDate(dateValue);
  const localEntries = (await readLocalEntries()).filter((entry) => (
    (entry.tipo === "recitativo" || entry.tipo === "musicalizacao_aula") &&
    normalizeDate(entry.payload?.data_aula || entry.payload?.data_reuniao) === normalizedDate
  ));

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return localEntries;
  }

  const table = process.env.SUPABASE_TABLE_RECITATIVOS || "rjm_recitativos";
  const candidateDates = [...new Set([normalizedDate, formatDateBR(normalizedDate)].filter(Boolean))];
  const remoteEntries = [];

  for (const candidateDate of [normalizedDate]) {
    if (!candidateDate) continue;
    const url = new URL(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${table}`);
    url.searchParams.set("select", "*");
    
    // Suportar tanto data_aula quanto data_reuniao
    const dateField = table.includes("musicalizacao") ? "data_aula" : "data_reuniao";
    url.searchParams.set(dateField, `eq.${candidateDate}`);
    url.searchParams.set("limit", "200");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    if (!response.ok) {
      const bodyText = await response.text();
      console.error(`[DEBUG] Supabase Duplicate Check Error - Table: ${table}, Status: ${response.status}, Body: ${bodyText}`);
      throw new Error(`supabase_recitativo_duplicate_check_failed:${response.status}:${bodyText}`);
    }

    const rows = await response.json();
    for (const row of rows) {
      remoteEntries.push({
        id: row.id || "",
        tipo: "recitativo",
        payload: row,
        createdAt: row.created_at || row.createdAt || ""
      });
    }
  }

  const deduped = new Map();
  for (const entry of [...remoteEntries, ...localEntries]) {
    const key = `${entry.id}::${JSON.stringify(entry.payload || {})}`;
    if (!deduped.has(key)) deduped.set(key, entry);
  }

  return [...deduped.values()];
}

function detectRecitativoDuplicate(payload, entries) {
  const common = normalizeText(getRecitativoComum(payload));
  const meetingDate = normalizeDate(payload.data_aula || payload.data_reuniao);
  if (!common || !meetingDate) return { duplicate: false };

  for (const entry of entries) {
    const existing = entry.payload || {};
    const existingCommon = normalizeText(getRecitativoComum(existing));
    const existingMeetingDate = normalizeDate(existing.data_aula || existing.data_reuniao);

    if (common === existingCommon && meetingDate === existingMeetingDate) {
      return {
        duplicate: true,
        matchedId: entry.id,
        reason: "comum_e_data",
        matchedEntry: entry
      };
    }
  }

  return { duplicate: false };
}

async function readSavedEntries() {
  const localEntries = await readLocalEntries();

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    if (REQUIRE_SUPABASE_DUPLICATE_CHECK) {
      throw new Error("supabase_duplicate_check_not_configured");
    }
    return localEntries;
  }

  const table = SUPABASE_TABLE_CADASTROS || "";
  const endpoints = table
    ? [{ table, select: "id,registro_uuid,tipo,payload,created_at" }]
    : [
        { table: SUPABASE_TABLE_CRIANCA, select: "*" },
        { table: SUPABASE_TABLE_MONITOR, select: "*" }
      ];

  const allEntries = [];
  for (const endpoint of endpoints) {
    const url = new URL(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${endpoint.table}`);
    url.searchParams.set("select", endpoint.select);
    url.searchParams.set("limit", "1000");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    if (!response.ok) {
      const bodyText = await response.text();
      throw new Error(`supabase_duplicate_check_failed:${response.status}:${bodyText}`);
    }

    const rows = await response.json();
    for (const row of rows) {
      if (row && typeof row === "object" && row.payload && row.tipo) {
        allEntries.push({
          id: row.registro_uuid || row.id || "",
          tipo: row.tipo,
          payload: row.payload,
          createdAt: row.created_at || row.createdAt || ""
        });
        continue;
      }

      const inferredType = endpoint.table === SUPABASE_TABLE_MONITOR ? "monitor" : "crianca";
      allEntries.push({
        id: row.registro_uuid || row.id || "",
        tipo: inferredType,
        payload: row,
        createdAt: row.created_at || row.createdAt || ""
      });
    }
  }

  const deduped = new Map();
  for (const entry of [...allEntries, ...localEntries]) {
    const key = `${entry.tipo}::${entry.id}::${JSON.stringify(entry.payload || {})}`;
    if (!deduped.has(key)) deduped.set(key, entry);
  }

  return [...deduped.values()];
}

function detectDuplicate(tipo, payload, entries) {
  const sameTypeEntries = entries.filter((entry) => entry.tipo === tipo);
  const congregation = normalizeText(payload.comum_congregacao);

  for (const entry of sameTypeEntries) {
    const existing = entry.payload || {};
    const existingCongregation = normalizeText(existing.comum_congregacao);

    if (tipo === "monitor") {
      const email = normalizeText(payload.email);
      const existingEmail = normalizeText(existing.email);
      const phone = onlyDigits(payload.celular);
      const existingPhone = onlyDigits(existing.celular);
      const sameName = namesLookSame(payload.nome_completo, existing.nome_completo);

      if (email && existingEmail && email === existingEmail) {
        return { duplicate: true, matchedId: entry.id, reason: "email", matchedEntry: entry };
      }

      if (phone && existingPhone && phone === existingPhone) {
        return { duplicate: true, matchedId: entry.id, reason: "celular", matchedEntry: entry };
      }

      if (sameName && congregation && congregation === existingCongregation) {
        return { duplicate: true, matchedId: entry.id, reason: "nome_e_comum", matchedEntry: entry };
      }
    }

    if (tipo === "crianca") {
      const childNameMatch = namesLookSame(payload.nome_crianca, existing.nome_crianca);
      const fatherNameMatch = namesLookSame(payload.nome_pai, existing.nome_pai);
      const motherNameMatch = namesLookSame(payload.nome_mae, existing.nome_mae);
      const guardianNameMatch = namesLookSame(payload.nome_responsavel, existing.nome_responsavel);
      const birthDate = normalizeDate(payload.data_nascimento);
      const existingBirthDate = normalizeDate(existing.data_nascimento);
      const phone = onlyDigits(payload.celular_responsavel);
      const existingPhone = onlyDigits(existing.celular_responsavel);

      const sameCongregation = congregation && congregation === existingCongregation;
      const samePhone = phone && existingPhone && phone === existingPhone;
      const sameBirthDate = birthDate && existingBirthDate && birthDate === existingBirthDate;

      if (samePhone && sameCongregation && (childNameMatch || guardianNameMatch || fatherNameMatch || motherNameMatch)) {
        return { duplicate: true, matchedId: entry.id, reason: "telefone_comum_nome", matchedEntry: entry };
      }

      if (sameBirthDate && sameCongregation && (childNameMatch || (fatherNameMatch && motherNameMatch))) {
        return { duplicate: true, matchedId: entry.id, reason: "nascimento_comum_nome", matchedEntry: entry };
      }

      if (sameCongregation && childNameMatch && guardianNameMatch) {
        return { duplicate: true, matchedId: entry.id, reason: "nome_crianca_responsavel", matchedEntry: entry };
      }
    }
  }

  return { duplicate: false };
}

async function forwardToWebhook(tipo, payload, metadata = {}) {
  const webhookByType = tipo === "crianca" ? WEBHOOK_CRIANCA : WEBHOOK_MONITOR;
  const webhookFallback = WEBHOOK_CADASTRO;
  const webhookCandidates = [];
  if (webhookByType) webhookCandidates.push({ url: webhookByType, source: "type" });
  if (webhookFallback && webhookFallback !== webhookByType) webhookCandidates.push({ url: webhookFallback, source: "fallback" });
  if (webhookCandidates.length === 0) return { forwarded: false, webhookStatus: 0, webhookErrorBody: "No webhook configured." };

  const normalizedPayload = toUppercaseDeep(payload);
  const webhookUuid = metadata.uuid || "";
  const webhookPayload = {
    ...normalizedPayload,
    tipo: String(tipo || "").toUpperCase(),
    tipo_original: tipo,
    id: webhookUuid,
    uuid: webhookUuid,
    registro_uuid: metadata.uuid || "",
    created_at: metadata.createdAt || new Date().toISOString()
  };

  // Compatibilidade com planilhas/workflows que usam nomes de campo diferentes para polo.
  const poloCrianca = webhookPayload.polo_participacao || webhookPayload.polo || webhookPayload.polo_auxilio || "";
  const poloMonitor = webhookPayload.polo_auxilio || webhookPayload.polo || webhookPayload.polo_participacao || "";
  if (tipo === "crianca") {
    webhookPayload.polo_participacao = poloCrianca;
    webhookPayload.polo_auxilio = webhookPayload.polo_auxilio || poloCrianca;
    webhookPayload.polo = poloCrianca;
  } else {
    webhookPayload.polo_auxilio = poloMonitor;
    webhookPayload.polo_participacao = webhookPayload.polo_participacao || poloMonitor;
    webhookPayload.polo = poloMonitor;
  }

  let lastFailure = { webhookStatus: 0, webhookErrorBody: "", webhookUrl: "", webhookSource: "" };

  for (const candidate of webhookCandidates) {
    const response = await fetch(candidate.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload)
    });

    if (response.ok) {
      return {
        forwarded: true,
        webhookStatus: response.status,
        webhookUrl: candidate.url,
        webhookSource: candidate.source
      };
    }

    const errorBody = await response.text().catch(() => "");
    lastFailure = {
      webhookStatus: response.status,
      webhookErrorBody: String(errorBody || "").slice(0, 500),
      webhookUrl: candidate.url,
      webhookSource: candidate.source
    };
  }

  return { forwarded: false, ...lastFailure };
}

function validateRequired(tipo, payload) {
  const requiredByType = {
    crianca: ["nome_crianca", "sexo", "data_nascimento", "comum_congregacao", "polo_participacao", "nome_responsavel", "celular_responsavel"],
    monitor: ["nome_completo", "comum_congregacao", "idade", "celular", "email", "polo_auxilio"]
  };

  const required = requiredByType[tipo] || [];
  return required.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || String(value).trim() === "";
  });
}

async function verifySupabaseToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("SUPABASE_URL ou SUPABASE_ANON_KEY ausentes para validar token.");
    return null;
  }

  try {
    const url = new URL(`${SUPABASE_URL.replace(/\/$/, "")}/auth/v1/user`);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error("Erro ao validar token do Supabase:", err);
    return null;
  }
}

async function getUserProfile(userId, email = null) {
  if (!userId || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;

  const auxTable = process.env.SUPABASE_TABLE_AUXILIARES || "profiles";
  const tables = [...new Set(["profiles", auxTable])];

  for (const table of tables) {
    try {
      // 1. Tenta buscar por 'id'
      const urlId = new URL(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${table}?id=eq.${userId}&select=*`);
      const resId = await fetch(urlId, {
        headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
      });
      if (resId.ok) {
        const dataId = await resId.json();
        if (Array.isArray(dataId) && dataId.length > 0) return dataId[0];
      }

      // 2. Tenta buscar por 'user_id'
      const urlUserId = new URL(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${table}?user_id=eq.${userId}&select=*`);
      const resUserId = await fetch(urlUserId, {
        headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
      });
      if (resUserId.ok) {
        const dataUserId = await resUserId.json();
        if (Array.isArray(dataUserId) && dataUserId.length > 0) return dataUserId[0];
      }

      // 3. Tenta buscar por 'email'
      if (email) {
        const urlEmail = new URL(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${table}?email=eq.${email}&select=*`);
        const resEmail = await fetch(urlEmail, {
          headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
        });
        if (resEmail.ok) {
          const dataEmail = await resEmail.json();
          if (Array.isArray(dataEmail) && dataEmail.length > 0) return dataEmail[0];
        }
      }
    } catch (err) {
      console.warn(`Erro ao buscar perfil na tabela ${table}:`, err.message);
    }
  }

  return null;
}

async function serveStatic(reqPath, res) {
  const normalized = path.normalize(reqPath).replace(/^([.][.][/\\])+/, "");
  const filePath = path.join(publicDir, normalized);

  if (!filePath.startsWith(publicDir)) {
    sendJson(res, 403, { error: "Acesso negado." });
    return;
  }

  let stat;
  try {
    stat = await fsp.stat(filePath);
  } catch {
    sendJson(res, 404, { error: "Arquivo não encontrado." });
    return;
  }

  if (stat.isDirectory()) {
    sendJson(res, 404, { error: "Arquivo não encontrado." });
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";

  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    Expires: "0"
  });
  fs.createReadStream(filePath).pipe(res);
}

function routeToPage(rawPathname) {
  const pathname = rawPathname.replace(/\/$/, "") || "/";
  const p = pathname.toLowerCase();

  if (p === "/") return "index.html";
  if (p === "/login.html" || p === "/login") return "login.html";
  if (p === "/registro.html" || p === "/registro") return "registro.html";
  if (p === "/cadastro.html" || p === "/cadastro") return "cadastro.html";
  if (p === "/cadastro/crianca") return "cadastro.html";
  if (p === "/cadastro/monitor") return "cadastro.html";
  return null;
}

async function handleRequest(req, res) {
  const host = req.headers.host || "localhost";
  const url = new URL(req.url, `http://${host}`);
  const pathname = url.pathname;
  
  // Log de Debug para resolver erro de rota
  console.log(`[Server] ${req.method} ${pathname}`);

  try {
    const p = pathname.toLowerCase().replace(/\/$/, "") || "/";

    // --- ROTA DE LANÇAMENTO (POST) - Prioridade Máxima para Produção ---
    if (req.method === "POST" && p === "/api/atividades") {
      const authUser = await verifySupabaseToken(req.headers.authorization);
      if (!authUser) {
        return sendJson(res, 401, { error: "Não autorizado. Faça login novamente." });
      }

      const profile = await getUserProfile(authUser.id);
      if (!profile) {
        return sendJson(res, 403, { error: "Acesso negado: Perfil de usuário não encontrado." });
      }

      // Check role authorization (Allowed: Master/1, Admin/2, Coordenador/3, Instrutor/4)
      const allowedRoles = [1, 2, 3, 4];
      const userRoleId = parseInt(profile.role_id || profile.nivel || 6, 10);
      if (!allowedRoles.includes(userRoleId)) {
        return sendJson(res, 403, { 
          error: "Acesso negado: seu nível de acesso não permite fazer lançamentos nesta aplicação.",
          role_id: userRoleId
        });
      }

      const payload = await readJsonBody(req);
      console.log("[DEBUG] Recebendo Payload no Servidor:", JSON.stringify(payload, null, 2));
      
      // Mapeamento de campos para musicalizacao_aulas
      const finalPayload = {
        data_aula: payload.data_aula || payload.data_reuniao,
        cidade: payload.cidade || payload.municipio,
        polo: payload.polo || payload.localidade,
        ciclo: payload.ciclo || "Ciclo 1",
        numero_aula: parseInt(payload.numero_aula || payload.licao || 0, 10),
        meninas_presentes: parseInt(payload.meninas_presentes || payload.meninas || 0, 10),
        meninos_presentes: parseInt(payload.meninos_presentes || payload.meninos || 0, 10),
        colaboradores_presentes: parseInt(payload.colaboradores_presentes || payload.colaboradores || 0, 10),
        coordenadores_presentes: parseInt(payload.coordenadores_presentes || 0, 10),
        instrutores_presentes: parseInt(payload.instrutores_presentes || 0, 10),
        observacoes: payload.observacoes || payload.justificativa || ""
      };

      const missing = ["data_aula", "polo"].filter((field) => {
        const value = finalPayload[field];
        return value === undefined || value === null || String(value).trim() === "";
      });

      if (missing.length > 0) {
        return sendJson(res, 400, { error: "Campos obrigatórios ausentes.", missing });
      }

      // Ajustar check de duplicidade para novos campos
      const existingRecitativos = await readSavedRecitativosByDate(finalPayload.data_aula);
      
      // Detectar duplicidade baseada em polo e data
      const duplicateCheck = detectRecitativoDuplicate(finalPayload, existingRecitativos);
      if (duplicateCheck.duplicate) {
        return sendJson(res, 409, {
          error: "Este Polo já realizou um lançamento nesta data. Procure a coordenação.",
          duplicateOf: duplicateCheck.matchedId,
          duplicateReason: duplicateCheck.reason,
          duplicate: buildRecitativoDuplicateDetails(duplicateCheck.matchedEntry)
        });
      }

      // Salvar localmente
      const saved = await saveSubmission("musicalizacao_aula", finalPayload);

      // Salvar no Supabase
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseTable = process.env.SUPABASE_TABLE_RECITATIVOS || "musicalizacao_aulas";

      if (supabaseUrl && supabaseKey) {
        const url = new URL(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${supabaseTable}`);
        try {
          const resSupabase = await fetch(url, {
            method: "POST",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              "Prefer": "return=minimal"
            },
            body: JSON.stringify(finalPayload)
          });
          
          if (!resSupabase.ok) {
            const errorText = await resSupabase.text();
            console.error("Erro no Supabase:", errorText);
            return sendJson(res, 500, { error: "Erro ao salvar no banco de dados Supabase.", details: errorText });
          }
        } catch (err) {
          console.error("Falha ao conectar com Supabase:", err);
          return sendJson(res, 500, { error: "Falha de conexão com Supabase." });
        }
      }

      // Webhook opcional
      const webhookUrl = process.env.WEBHOOK_RECITATIVOS;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              ...finalPayload, 
              id: saved.id, 
              created_at: saved.createdAt 
            })
          });
        } catch (err) {
          console.error("Erro no Webhook:", err);
        }
      }

      return sendJson(res, 201, { message: "Lançamento realizado com sucesso.", id: saved.id });
    }

    // --- ROTA DE PERFIL (GET/POST) ---
      if (p === "/api/profile") {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (req.method === "GET") {
          const userId = url.searchParams.get("id");
          const userEmail = url.searchParams.get("email");
          if (!userId) return sendJson(res, 400, { error: "ID do usuário ausente." });
          
          const profile = await getUserProfile(userId, userEmail);
          return sendJson(res, 200, profile || {});
        }

      if (req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", async () => {
          try {
            const profileData = JSON.parse(body);
            console.log("Recebido /api/profile (POST):", profileData);
            if (!profileData.id) return sendJson(res, 400, { error: "ID do usuário obrigatório." });

            const table = process.env.SUPABASE_TABLE_AUXILIARES || 'profiles';
            
            // Map payload columns to match table schemas dynamically
            const mappedData = { ...profileData };
            if (table === "profiles") {
              if (mappedData.id && !mappedData.user_id) {
                mappedData.user_id = mappedData.id;
              }
              delete mappedData.id;
            } else if (table === "rjm_auxiliares") {
              if (mappedData.user_id && !mappedData.id) {
                mappedData.id = mappedData.user_id;
              }
              delete mappedData.user_id;
            }

            const urlUpsert = new URL(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}`);
            const response = await fetch(urlUpsert, {
              method: "POST",
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates"
              },
              body: JSON.stringify(mappedData)
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error("Erro no Supabase ao dar upsert:", errorText);
              return sendJson(res, response.status, { error: "Erro ao salvar perfil no Supabase.", details: errorText });
            }

            console.log("Perfil salvo com sucesso no Supabase!");
            return sendJson(res, 200, { success: true });
          } catch (err) {
            console.error("Erro interno no processamento do perfil:", err);
            return sendJson(res, 500, { error: "Erro interno ao processar perfil." });
          }
        });
        return;
      }
    }

    if (req.method === "GET") {
      const page = routeToPage(pathname);
      if (page) {
        await serveStatic(page, res);
        return;
      }

      if (pathname.startsWith("/styles/") || pathname.startsWith("/scripts/") || pathname.startsWith("/assets/")) {
        await serveStatic(pathname.slice(1), res);
        return;
      }

      if (pathname === "/api/config") {
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0"
        });
        res.end(JSON.stringify({
          url: SUPABASE_URL,
          anonKey: SUPABASE_ANON_KEY
        }));
        return;
      }

      if (pathname === "/api/comuns") {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseKey) {
          return sendJson(res, 500, { error: "Configuração do Supabase ausente." });
        }

        const normalizeValue = (value) => String(value || "").trim();
        const normalizeComum = (item) => {
          // Prioridade para nomes de colunas canônicos 'comum' e 'cidade'
          const comum = normalizeValue(item?.nome_polo || item?.comum || item?.name || item?.nome || item?.descricao || item?.description);
          const cidade = normalizeValue(item?.localidade || item?.cidade || item?.city || item?.municipio);
          if (!comum) return null;
          return { comum, cidade };
        };

        const table = process.env.SUPABASE_TABLE_POLOS || "musicalizacao_polos";
        const url = new URL(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}?select=*`);
        try {
          const response = await fetch(url, {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`
            }
          });
          const data = await response.json();
          const comuns = Array.isArray(data)
            ? data.map(normalizeComum).filter(Boolean).sort((a, b) => a.comum.localeCompare(b.comum, "pt-BR"))
            : [];
          return sendJson(res, 200, comuns);
        } catch (err) {
          return sendJson(res, 500, { error: "Erro ao buscar comuns." });
        }
      }

      sendJson(res, 404, { error: "Rota não encontrada." });
      return;
    }


    if (req.method === "POST" && (pathname === "/api/cadastros/crianca" || pathname === "/api/cadastros/monitor")) {
      const tipo = pathname.endsWith("crianca") ? "crianca" : "monitor";
      const rawPayload = await readJsonBody(req);
      const payload = toUppercaseDeep(rawPayload);
      const missing = validateRequired(tipo, payload);

      if (missing.length > 0) {
        sendJson(res, 400, { error: "Campos obrigatórios ausentes.", missing });
        return;
      }

      const existingEntries = await readSavedEntries();
      const duplicateCheck = detectDuplicate(tipo, payload, existingEntries);
      if (duplicateCheck.duplicate) {
        const duplicate = buildDuplicateDetails(tipo, duplicateCheck.matchedEntry);
        sendJson(res, 409, {
          error: "Cadastro duplicado detectado.",
          duplicateOf: duplicateCheck.matchedId,
          duplicateReason: duplicateCheck.reason,
          duplicate
        });
        return;
      }

      const saved = await saveSubmission(tipo, payload);
      const webhookResult = await forwardToWebhook(tipo, payload, {
        uuid: saved.id,
        createdAt: saved.createdAt
      });

      if (!webhookResult.forwarded) {
        console.error("webhook_forward_failed", {
          tipo,
          status: webhookResult.webhookStatus || 0,
          source: webhookResult.webhookSource || "",
          url: webhookResult.webhookUrl || "",
          body: webhookResult.webhookErrorBody || ""
        });
        sendJson(res, 502, {
          error: "Falha ao encaminhar cadastro para a integração.",
          webhookStatus: webhookResult.webhookStatus || 0,
          webhookSource: webhookResult.webhookSource || "",
          webhookUrl: webhookResult.webhookUrl || ""
        });
        return;
      }

      sendJson(res, 201, {
        message: "Cadastro recebido com sucesso.",
        id: saved.id,
        uuid: saved.uuid,
        createdAt: saved.createdAt,
        persistedLocally: saved.persistedLocally,
        ...webhookResult
      });
      return;
    }

    sendJson(res, 404, { error: "Rota não encontrada." });
  } catch (error) {
    if (error.message === "payload_too_large") {
      sendJson(res, 413, { error: "Payload excede 1MB." });
      return;
    }

    if (typeof error.message === "string" && error.message.startsWith("supabase_duplicate_check_failed:")) {
      sendJson(res, 502, { error: "Falha ao validar duplicidade no Supabase." });
      return;
    }

    if (typeof error.message === "string" && error.message.startsWith("supabase_recitativo_duplicate_check_failed:")) {
      sendJson(res, 502, { error: "Falha ao validar duplicidade do lançamento no Supabase." });
      return;
    }

    if (error.message === "supabase_duplicate_check_not_configured") {
      sendJson(res, 500, { error: "Validação de duplicidade exige SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY." });
      return;
    }

    if (error instanceof SyntaxError) {
      sendJson(res, 400, { error: "JSON inválido." });
      return;
    }

    console.error(error);
    sendJson(res, 500, { error: "Erro interno do servidor." });
  }
}

if (process.env.VERCEL) {
  module.exports = handleRequest;
} else {
  const server = http.createServer((req, res) => {
    handleRequest(req, res);
  });

  server.listen(PORT, () => {
    console.log(`Servidor iniciado em http://localhost:${PORT}`);
  });
}

