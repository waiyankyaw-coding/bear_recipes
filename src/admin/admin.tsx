import { useMemo, useState } from "react";
import { deleteRecipe, resetRecipes, useRecipes } from "../data/recipes_store";
import { CATEGORIES } from "../types/recepies_type";
import type { Category } from "../types/recepies_type";
import RecipeForm from "./recipes_form";
import "./admin.css";

const categoryLabel = (c: Category) =>
  CATEGORIES.find((x) => x.id === c)?.label ?? c;

function AdminList() {
  const recipes = useRecipes();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Category>("all");

  const list = useMemo(
    () =>
      recipes.filter(
        (r) =>
          (filter === "all" || r.type === filter) &&
          r.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [recipes, query, filter]
  );

  const onDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteRecipe(id);
    }
  };

  const onReset = () => {
    if (
      window.confirm(
        "Remove all admin changes and go back to the default recipes?"
      )
    ) {
      resetRecipes();
    }
  };

  return (
    <>
      <header className="top">
        <h1>Admin · {recipes.length} recipes</h1>
        <div className="admin-bar">
          <a className="btn primary" href="#/admin/new">
            + Add recipe
          </a>
          <a className="btn" href="#/">
            View user side
          </a>
        </div>
        <div className="search" style={{ marginTop: 12 }}>
          <input
            type="search"
            placeholder="Search by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <nav className="chips">
          <button
            className={filter === "all" ? "chip active" : "chip"}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={filter === c.id ? "chip active" : "chip"}
              onClick={() => setFilter(c.id)}
            >
              {c.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="list">
        {list.length === 0 && <p className="empty">No recipes found.</p>}
        {list.map((r) => (
          <div key={r.id} className="card">
            <div className="card-head">
              <h2>{r.name}</h2>
              <span className="tag">{categoryLabel(r.type)}</span>
            </div>
            <p className="summary">
              {r.ingredients.map((i) => i.name).join(" · ")}
            </p>
            <div className="admin-actions">
              <a className="btn small" href={`#/admin/edit/${r.id}`}>
                Edit
              </a>
              <button
                className="btn danger small"
                onClick={() => onDelete(r.id, r.name)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        <button className="btn small reset" onClick={onReset}>
          Reset to default recipes
        </button>
      </main>
    </>
  );
}

export default function AdminApp({ route }: { route: string }) {
  const recipes = useRecipes();

  if (route === "admin/new") return <RecipeForm key="new" />;

  if (route.startsWith("admin/edit/")) {
    const id = route.slice("admin/edit/".length);
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) return <RecipeForm key={id} recipe={recipe} />;
  }

  return <AdminList />;
}