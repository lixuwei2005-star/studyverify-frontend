"use client";

import type { CustomProblem } from "@/lib/custom-problems";

type Props = {
  problems: CustomProblem[];
  activeId: string;
  onSelect: (problem: CustomProblem) => void;
  onDelete: (problem_id: string) => void;
  onAddNew: () => void;
};

export function ProblemSidebar({
  problems,
  activeId,
  onSelect,
  onDelete,
  onAddNew,
}: Props) {
  return (
    <aside
      className="w-full lg:w-64 bg-white border border-gray-200 rounded-lg p-4 lg:self-start"
      data-testid="problem-sidebar"
    >
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
        Problems
      </h3>

      <button
        type="button"
        onClick={onAddNew}
        className="w-full mb-3 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-sm font-medium border border-blue-200"
        data-testid="add-problem-button"
      >
        + Add Custom Problem
      </button>

      <ul className="space-y-1">
        {problems.map((p) => {
          const isActive = activeId === p.problem_id;
          return (
            <li
              key={p.problem_id}
              data-testid="problem-item"
              data-problem-id={p.problem_id}
              data-active={isActive ? "true" : "false"}
              className={`flex items-center justify-between px-3 py-2 rounded text-sm cursor-pointer ${
                isActive
                  ? "bg-blue-100 text-blue-900 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => onSelect(p)}
            >
              <span className="flex items-center gap-2 truncate">
                {p.problem_id}
                {p.source === "builtin" && (
                  <span className="text-xs text-gray-500">(default)</span>
                )}
              </span>

              {p.source === "custom" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete "${p.problem_id}"?`)) {
                      onDelete(p.problem_id);
                    }
                  }}
                  className="ml-2 text-red-500 hover:text-red-700 text-xs"
                  title="Delete"
                  data-testid="delete-problem-button"
                >
                  ×
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
