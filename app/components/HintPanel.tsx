"use client";

import type { HintViewModel } from "@/lib/types";

type Props = {
  hints: HintViewModel[];
  onGetHint: () => void;
  loading: boolean;
  maxReached: boolean;
  disabled: boolean;
  errorMessage?: string;
};

const MAX_HINTS = 5; // mirrors backend MAX_HINTS_PER_VERIFIER_SESSION

export function HintPanel({
  hints,
  onGetHint,
  loading,
  maxReached,
  disabled,
  errorMessage,
}: Props) {
  return (
    <section data-testid="hint-panel" className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 data-testid="hint-counter" className="text-lg font-bold">
          💡 Hints ({hints.length}/{MAX_HINTS})
        </h3>

        {!maxReached && (
          <button
            type="button"
            data-testid="get-hint-button"
            onClick={onGetHint}
            disabled={loading || disabled}
            className="px-4 py-1.5 bg-yellow-400 text-yellow-900 font-medium rounded hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
          >
            {loading
              ? "Loading..."
              : hints.length === 0
                ? "Get a Hint"
                : `Get Hint #${hints.length + 1}`}
          </button>
        )}
      </div>

      {disabled && hints.length === 0 && (
        <p className="text-sm text-gray-600 italic">
          Submit your code first to get hints.
        </p>
      )}

      {errorMessage && (
        <p role="alert" className="text-sm text-red-700 mb-2">
          {errorMessage}
        </p>
      )}

      {hints.length > 0 && (
        <div className="space-y-3">
          {hints.map((hint) => (
            <div
              key={hint.index}
              data-testid="hint-item"
              className="border-l-4 border-yellow-400 pl-3 py-1"
            >
              <p className="font-semibold text-sm text-yellow-800">
                Hint {hint.index}
              </p>
              <p className="text-gray-800 mt-1 leading-relaxed">{hint.text}</p>
            </div>
          ))}
        </div>
      )}

      {maxReached && (
        <p className="text-sm text-gray-600 italic mt-3">
          You&apos;ve used all {MAX_HINTS} hints. Try submitting again!
        </p>
      )}
    </section>
  );
}
