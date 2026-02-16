const els = {
  form: document.getElementById("todoForm"),
  input: document.getElementById("todoInput"),
  list: document.getElementById("todoList"),
  stats: document.getElementById("stats"),
  filterBtns: Array.from(document.querySelectorAll(".filter"))
};

let state = {
  todos: [],
  filter: "all" // all | active | done
};

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function apiGetTodos() {
  const res = await fetch("/api/todos");
  const data = await res.json();
  state.todos = data.todos || [];
}

async function apiAddTodo(text) {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to add todo");
  }
  const data = await res.json();
  state.todos.unshift(data.todo);
}

async function apiToggleTodo(id, done) {
  const res = await fetch(`/api/todos/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done })
  });
  if (!res.ok) throw new Error("Failed to update todo");
  const data = await res.json();
  state.todos = state.todos.map(t => (t.id === id ? data.todo : t));
}

async function apiDeleteTodo(id) {
  const res = await fetch(`/api/todos/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error("Failed to delete todo");
  state.todos = state.todos.filter(t => t.id !== id);
}

function filteredTodos() {
  if (state.filter === "active") return state.todos.filter(t => !t.done);
  if (state.filter === "done") return state.todos.filter(t => t.done);
  return state.todos;
}

function render() {
  const items = filteredTodos();
  els.list.innerHTML = items.map(t => `
    <li class="item ${t.done ? "done" : ""}" data-id="${escapeHtml(t.id)}">
      <div class="text" title="Click to toggle">${escapeHtml(t.text)}</div>
      <div class="actions">
        <button class="iconBtn" data-action="delete" type="button">Delete</button>
      </div>
    </li>
  `).join("");

  const total = state.todos.length;
  const remaining = state.todos.filter(t => !t.done).length;
  els.stats.textContent = `${total} item${total === 1 ? "" : "s"} • ${remaining} left`;

  els.filterBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === state.filter);
  });
}

els.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = els.input.value.trim();
  if (!text) return;
  els.input.value = "";
  els.input.focus();
  try {
    await apiAddTodo(text);
    render();
  } catch (err) {
    alert(err.message || String(err));
  }
});

els.list.addEventListener("click", async (e) => {
  const li = e.target.closest(".item");
  if (!li) return;
  const id = li.dataset.id;

  const action = e.target?.dataset?.action;

  try {
    if (action === "delete") {
      await apiDeleteTodo(id);
      render();
      return;
    }

    // default click on item text => toggle
    const todo = state.todos.find(t => t.id === id);
    if (!todo) return;
    await apiToggleTodo(id, !todo.done);
    render();
  } catch (err) {
    alert(err.message || String(err));
  }
});

els.filterBtns.forEach(btn => {
  btn.addEventListener("click", async () => {
    state.filter = btn.dataset.filter;
    render();
  });
});

(async function init() {
  await apiGetTodos();
  render();
  els.input.focus();
})();
