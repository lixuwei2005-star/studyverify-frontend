"use client";

import type { Problem } from "./types";

const STORAGE_KEY = "studyverify_problems_v1";

export interface CustomProblem extends Problem {
  entry_function: string;
  source: "builtin" | "custom";
  createdAt: number;
}

export function loadCustomProblems(): CustomProblem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CustomProblem[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomProblem(p: CustomProblem): void {
  const existing = loadCustomProblems();
  const filtered = existing.filter((x) => x.problem_id !== p.problem_id);
  filtered.push(p);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function deleteCustomProblem(problem_id: string): void {
  const existing = loadCustomProblems();
  const filtered = existing.filter((x) => x.problem_id !== problem_id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function validateCustomProblem(p: Partial<CustomProblem>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!p.problem_id?.trim()) {
    errors.push("Problem ID is required");
  } else if (!/^[a-z0-9-]+$/.test(p.problem_id)) {
    errors.push("Problem ID: lowercase letters, digits, hyphens only");
  }

  if (!p.problem_text?.trim()) {
    errors.push("Description is required");
  } else if (p.problem_text.trim().length < 10) {
    errors.push("Description should be at least 10 characters");
  }

  if (!p.entry_function?.trim()) {
    errors.push("Function name is required");
  } else if (!/^[a-z_][a-z0-9_]*$/.test(p.entry_function)) {
    errors.push("Function name: must be a valid Python identifier (lowercase)");
  }

  if (!p.test_cases || p.test_cases.length === 0) {
    errors.push("At least 1 test case required");
  } else {
    p.test_cases.forEach((tc, i) => {
      if (!tc.input?.trim()) {
        errors.push(`Test case ${i + 1}: input cannot be empty`);
      }
      if (!tc.expected?.trim()) {
        errors.push(`Test case ${i + 1}: expected cannot be empty`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}
