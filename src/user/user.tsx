import { useEffect, useMemo, useState } from "react";
import { useRecipes } from "../data/recipes_store";
import { useHash } from "../hooks/useHash";
import { CATEGORIES } from "../types/recepies_type";
import type { Category, Ingredient, Recipe } from "../types/recepies_type";

type Filter = "all" | Category;

const categoryLabel = (c: Category) =>
  CATEGORIES.find((x) => x.id === c)?.label ?? c;

function formatAmount(i: Ingredient) {
  switch (i.unit) {
    case "ml":
      return `${i.amount} ml`;
    case "dash":
      return i.amount ? `${i.amount} dash` : "Dash";
    case "barspoon":
      return `${i.amount} bar spoon`;
    case "piece":
      return `${i.amount}`;
    case "top-up":
      return "Top up";
  }
}

function matches(r: Recipe, q: string) {
  if (!q) return true;
  const hay = [
    r.name,
    r.baseSpirit ?? "",
    ...r.ingredients.map((i) => i.name),
  ]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((word) => hay.includes(word));
}

function RecipeList() {
  const recipes = useRecipes();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const list = useMemo(
    () =>
      recipes.filter(
        (r) => (filter === "all" || r.type === filter) && matches(r, query.trim())
      ),
    [recipes, query, filter]
  );

  return (
    <>
      <header className="top">
        <h1>Bear recipes</h1>
        <div className="search">
          <input
            type="search"
            placeholder="Search name, spirit or ingredient"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search recipes"
          />
        </div>
        <nav className="chips" aria-label="Categories">
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
        {list.length === 0 ? (
          <p className="empty">
            {query
              ? "No recipes match your search."
              : "No recipes in this category yet."}
          </p>
        ) : (
          list.map((r) => (
            <a key={r.id} href={`#/${r.id}`} className="card">
              <div className="card-head">
                <h2>{r.name}</h2>
                <span className="tag">{categoryLabel(r.type)}</span>
              </div>
              <p className="summary">
                {r.ingredients.map((i) => i.name).join(" · ")}
              </p>
            </a>
          ))
        )}
      </main>
    </>
  );
}

function RecipeDetail({ recipe }: { recipe: Recipe }) {
  useEffect(() => window.scrollTo(0, 0), [recipe.id]);

  const meta: [string, string | undefined][] = [
    ["Glass", recipe.glass],
    ["Method", recipe.method],
    ["Ice", recipe.ice],
    ["Garnish", recipe.garnish],
  ];

  return (
    <>
      <header className="top detail-top">
        <button className="back" onClick={() => window.history.back()}>
          ← Back
        </button>
      </header>

      <main className="detail">
        <span className="tag">{categoryLabel(recipe.type)}</span>
        <h1>{recipe.name}</h1>
        {recipe.description && <p className="desc">{recipe.description}</p>}

        <h3>Ingredients</h3>
        <ul className="ingredients">
          {recipe.ingredients.map((i, idx) => (
            <li key={idx}>
              <span className="ing-name">
                {i.name}
                {i.note && <em> ({i.note})</em>}
              </span>
              <span className="ing-amt">{formatAmount(i)}</span>
            </li>
          ))}
        </ul>

        <dl className="meta">
          {meta
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
        </dl>

        {recipe.steps && recipe.steps.length > 0 && (
          <>
            <h3>Method</h3>
            <ol className="steps">
              {recipe.steps.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ol>
          </>
        )}
      </main>
    </>
  );
}

export default function UserApp() {
  const id = useHash();
  const recipes = useRecipes();
  const recipe = recipes.find((r) => r.id === id);
  return recipe ? <RecipeDetail recipe={recipe} /> : <RecipeList />;
}