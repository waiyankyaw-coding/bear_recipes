import { useState } from "react";
import type { FormEvent } from "react";
import { addRecipe, updateRecipe } from "../data/recipes_store";
import { CATEGORIES } from "../types/recepies_type";
import type { Category, Ingredient, Recipe, Unit } from "../types/recepies_type";

type Method = NonNullable<Recipe["method"]>;
type Row = { name: string; amount: string; unit: Unit; note: string };

const UNITS: { id: Unit; label: string }[] = [
  { id: "ml", label: "ml" },
  { id: "dash", label: "dash" },
  { id: "barspoon", label: "bar spoon" },
  { id: "piece", label: "piece" },
  { id: "top-up", label: "top up" },
];
const METHODS: Method[] = ["shaken", "stirred", "built", "blended"];

const emptyRow = (): Row => ({ name: "", amount: "", unit: "ml", note: "" });

export default function RecipeForm({ recipe }: { recipe?: Recipe }) {
  const [name, setName] = useState(recipe?.name ?? "");
  const [type, setType] = useState<Category>(recipe?.type ?? "classic");
  const [baseSpirit, setBaseSpirit] = useState(recipe?.baseSpirit ?? "");
  const [glass, setGlass] = useState(recipe?.glass ?? "");
  const [method, setMethod] = useState<Method | "">(recipe?.method ?? "");
  const [ice, setIce] = useState(recipe?.ice ?? "");
  const [garnish, setGarnish] = useState(recipe?.garnish ?? "");
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [steps, setSteps] = useState(recipe?.steps?.join("\n") ?? "");
  const [rows, setRows] = useState<Row[]>(
    recipe
      ? recipe.ingredients.map((i) => ({
          name: i.name,
          amount: i.amount?.toString() ?? "",
          unit: i.unit,
          note: i.note ?? "",
        }))
      : [emptyRow()]
  );
  const [error, setError] = useState("");

  const setRow = (idx: number, patch: Partial<Row>) =>
    setRows(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const removeRow = (idx: number) =>
    setRows(rows.filter((_, i) => i !== idx));

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Recipe name is required.");

    const ingredients: Ingredient[] = [];
    for (const row of rows) {
      const rowName = row.name.trim();
      if (!rowName) continue;
      const amount = row.amount.trim() === "" ? NaN : Number(row.amount);
      const needsAmount = row.unit !== "top-up" && row.unit !== "dash";
      if (needsAmount && !(amount > 0)) {
        return setError(`Enter a valid amount for "${rowName}".`);
      }
      ingredients.push({
        name: rowName,
        amount: row.unit !== "top-up" && amount > 0 ? amount : undefined,
        unit: row.unit,
        note: row.note.trim() || undefined,
      });
    }
    if (ingredients.length === 0) {
      return setError("Add at least one ingredient.");
    }

    const stepList = steps
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const data: Omit<Recipe, "id"> = {
      name: name.trim(),
      type,
      baseSpirit: baseSpirit.trim().toLowerCase() || undefined,
      glass: glass.trim() || undefined,
      method: method || undefined,
      ice: ice.trim() || undefined,
      ingredients,
      garnish: garnish.trim() || undefined,
      steps: stepList.length ? stepList : undefined,
      description: description.trim() || undefined,
    };

    if (recipe) updateRecipe(recipe.id, data);
    else addRecipe(data);
    window.location.hash = "#/admin";
  };

  return (
    <>
      <header className="top detail-top">
        <a className="back" href="#/admin">
          ← Cancel
        </a>
        <h1>{recipe ? "Edit recipe" : "New recipe"}</h1>
      </header>

      <form className="form" onSubmit={save}>
        <div className="field">
          <label htmlFor="name">Name *</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Espresso Martini"
          />
        </div>

        <div className="field">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            value={type}
            onChange={(e) => setType(e.target.value as Category)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="spirit">Base spirit</label>
          <input
            id="spirit"
            value={baseSpirit}
            onChange={(e) => setBaseSpirit(e.target.value)}
            placeholder="vodka, gin, rum..."
          />
        </div>

        <div className="two">
          <div className="field">
            <label htmlFor="glass">Glass</label>
            <input
              id="glass"
              value={glass}
              onChange={(e) => setGlass(e.target.value)}
              placeholder="Rocks"
            />
          </div>
          <div className="field">
            <label htmlFor="method">Method</label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value as Method | "")}
            >
              <option value="">-</option>
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="two">
          <div className="field">
            <label htmlFor="ice">Ice</label>
            <input
              id="ice"
              value={ice}
              onChange={(e) => setIce(e.target.value)}
              placeholder="Ice cubes"
            />
          </div>
          <div className="field">
            <label htmlFor="garnish">Garnish</label>
            <input
              id="garnish"
              value={garnish}
              onChange={(e) => setGarnish(e.target.value)}
              placeholder="Cherry"
            />
          </div>
        </div>

        <div className="field">
          <span className="label">Ingredients *</span>
          {rows.map((row, idx) => (
            <div className="ing-row" key={idx}>
              <input
                className="full"
                placeholder="Ingredient name"
                value={row.name}
                onChange={(e) => setRow(idx, { name: e.target.value })}
              />
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="Amount"
                value={row.amount}
                disabled={row.unit === "top-up"}
                onChange={(e) => setRow(idx, { amount: e.target.value })}
              />
              <select
                value={row.unit}
                onChange={(e) =>
                  setRow(idx, { unit: e.target.value as Unit })
                }
              >
                {UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
              <input
                className="full"
                placeholder="Note (optional, e.g. or top up)"
                value={row.note}
                onChange={(e) => setRow(idx, { note: e.target.value })}
              />
              {rows.length > 1 && (
                <button
                  type="button"
                  className="btn danger small full"
                  onClick={() => removeRow(idx)}
                >
                  Remove ingredient
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn"
            onClick={() => setRows([...rows, emptyRow()])}
          >
            + Add ingredient
          </button>
        </div>

        <div className="field">
          <label htmlFor="steps">Steps (one per line)</label>
          <textarea
            id="steps"
            rows={4}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="desc">Description</label>
          <textarea
            id="desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn primary">
            {recipe ? "Save changes" : "Add recipe"}
          </button>
        </div>
      </form>
    </>
  );
}