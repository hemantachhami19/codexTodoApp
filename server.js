const path = require("path");
const fs = require("fs");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "todos.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ todos: [] }, null, 2));
}

function readTodos() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.todos) ? parsed.todos : [];
  } catch {
    return [];
  }
}

function writeTodos(todos) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify({ todos }, null, 2));
}

function makeId() {
  // Simple unique-ish id (good enough for a demo)
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- API ---

// Get all todos
app.get("/api/todos", (req, res) => {
  const todos = readTodos();
  res.json({ todos });
});

// Create a todo
app.post("/api/todos", (req, res) => {
  const text = (req.body?.text || "").toString().trim();
  if (!text) return res.status(400).json({ error: "text is required" });

  const todos = readTodos();
  const todo = { id: makeId(), text, done: false, createdAt: new Date().toISOString() };
  todos.unshift(todo);
  writeTodos(todos);
  res.status(201).json({ todo });
});

// Toggle done
app.patch("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const todos = readTodos();
  const idx = todos.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "todo not found" });

  const done = Boolean(req.body?.done);
  todos[idx] = { ...todos[idx], done };
  writeTodos(todos);
  res.json({ todo: todos[idx] });
});

// Delete a todo
app.delete("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const todos = readTodos();
  const next = todos.filter(t => t.id !== id);
  if (next.length === todos.length) return res.status(404).json({ error: "todo not found" });

  writeTodos(next);
  res.status(204).send();
});

// Fallback to index.html for unknown routes (optional, but nice)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Todo app running on http://localhost:${PORT}`);
});
