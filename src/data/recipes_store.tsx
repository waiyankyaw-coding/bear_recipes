import { useSyncExternalStore } from "react";
import { recipes as seed } from "./recepies_data";
import type { Recipe } from "../types/recepies_type";

// All reads/writes go through this file. To move to a real backend later,
// only this file needs to change.
const KEY = "cocktail-recipes-v1";

let cache: Recipe[] | null = null;
const listeners = new Set<() => void>();

function load(): Recipe[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Recipe[];
  } catch {
    // ignore corrupted / blocked storage and fall back to the seed data
  }
  return seed;
}

function getSnapshot(): Recipe[] {
  if (!cache) cache = load();
  return cache;
}

function emit() {
  listeners.forEach((l) => l());
}

function save(next: Recipe[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage full or blocked: keep working in memory
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // keep other open tabs in sync
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useRecipes(): Recipe[] {
  return useSyncExternalStore(subscribe, getSnapshot);
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function addRecipe(data: Omit<Recipe, "id">): string {
  const current = getSnapshot();
  const base = slugify(data.name) || "recipe";
  let id = base;
  let n = 2;
  while (current.some((r) => r.id === id)) id = `${base}-${n++}`;
  save([...current, { id, ...data }]);
  return id;
}

export function updateRecipe(id: string, data: Omit<Recipe, "id">) {
  save(getSnapshot().map((r) => (r.id === id ? { id, ...data } : r)));
}

export function deleteRecipe(id: string) {
  save(getSnapshot().filter((r) => r.id !== id));
}

// Throw away all admin changes and go back to the recipes in recipes.ts
export function resetRecipes() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  cache = null;
  emit();
}