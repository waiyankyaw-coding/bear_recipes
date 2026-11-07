export type Unit = "ml" | "dash" | "barspoon" | "piece" | "top-up";

export type Category =
  | "classic"
  | "house-special"
  | "sal-sal-night"
  | "lady-night"
  | "shooters";

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "house-special", label: "House Special" },
  { id: "sal-sal-night", label: "Sal Sal Night" },
  { id: "lady-night", label: "Lady Night" },
  { id: "shooters", label: "Shooters" },
];

export type Ingredient = {
  name: string;
  amount?: number; // omit for "top up"
  unit: Unit;
  note?: string;
};

export type Recipe = {
  id: string;
  name: string;
  type: Category; // category of the drink
  baseSpirit?: string;
  glass?: string;
  method?: "shaken" | "stirred" | "built" | "blended";
  ice?: string;
  ingredients: Ingredient[];
  garnish?: string;
  steps?: string[];
  description?: string;
};