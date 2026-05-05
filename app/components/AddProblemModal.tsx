"use client";

import { useEffect, useRef, useState } from "react";

import { generateTestCases } from "@/lib/api";
import { type CustomProblem, validateCustomProblem } from "@/lib/custom-problems";
import type { TestCase } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (p: CustomProblem) => void;
  existingIds: string[];
};

const FN_NAME_RE = /^[a-z_][a-z0-9_]*$/;

export function AddProblemModal({ open, onClose, onSave, existingIds }: Props) {
  const [problemId, setProblemId] = useState("");
  const [description, setDescription] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Cancel-flag wrapped in a ref so a stale auto-generate request that
  // resolves after the modal closes (or a new generation kicks off) does
  // not setState into the closed/replaced UI.
  const cancelRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  useEffect(() => {
    if (open) {
      setProblemId("");
      setDescription("");
      setFunctionName("");
      setTestCases([]);
      setGenerating(false);
      setGenerationError(null);
      setAiGenerated(false);
      setErrors([]);
      cancelRef.current = { cancelled: false };
    }
    return () => {
      cancelRef.current.cancelled = true;
    };
  }, [open]);

  const triggerAutoGenerate = async () => {
    if (
      !problemId.trim() ||
      !description.trim() ||
      description.trim().length < 10 ||
      !functionName.trim() ||
      !FN_NAME_RE.test(functionName) ||
      testCases.length > 0 ||
      generating
    ) {
      return;
    }

    cancelRef.current = { cancelled: false };
    const localCancel = cancelRef.current;

    setGenerating(true);
    setGenerationError(null);

    try {
      const generated = await generateTestCases(description.trim(), functionName.trim(), 5);
      if (localCancel.cancelled) return;
      setTestCases(generated);
      setAiGenerated(true);
    } catch (e) {
      if (localCancel.cancelled) return;
      setGenerationError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      if (!localCancel.cancelled) setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    // Cancel any in-flight generation and reset cases so the gating
    // condition in triggerAutoGenerate (testCases.length > 0) clears.
    cancelRef.current.cancelled = true;
    setTestCases([]);
    setAiGenerated(false);
    // Schedule on next tick so the cleared state is applied before the new
    // call runs; otherwise the gate would still see the stale length.
    setTimeout(triggerAutoGenerate, 0);
  };

  const handleSave = () => {
    const problem: CustomProblem = {
      problem_id: problemId.trim(),
      problem_text: description.trim(),
      entry_function: functionName.trim(),
      test_cases: testCases.map((tc) => ({
        input: tc.input,
        expected: tc.expected,
        description: tc.description ?? "",
      })),
      source: "custom",
      createdAt: Date.now(),
    };

    const validation = validateCustomProblem(problem);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    if (existingIds.includes(problem.problem_id)) {
      setErrors([`Problem ID "${problem.problem_id}" already exists`]);
      return;
    }

    onSave(problem);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="add-problem-modal"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Add Python Problem</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Problem ID</label>
            <input
              type="text"
              value={problemId}
              onChange={(e) => setProblemId(e.target.value)}
              placeholder="my-fizzbuzz"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded"
              data-testid="problem-id-input"
            />
            <p className="text-xs text-gray-500 mt-1">
              lowercase letters, digits, hyphens only
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the function should do..."
              rows={4}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded"
              data-testid="problem-text-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Function name</label>
            <input
              type="text"
              value={functionName}
              onChange={(e) => setFunctionName(e.target.value)}
              onBlur={triggerAutoGenerate}
              placeholder="fizzbuzz"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded"
              data-testid="function-name-input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Python identifier (test cases will auto-generate)
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Test Cases</label>
              {testCases.length > 0 && !generating && (
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="text-xs text-blue-600 hover:underline"
                  data-testid="regenerate-test-cases-button"
                >
                  🪄 Regenerate
                </button>
              )}
            </div>

            {generating && (
              <div
                className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-600"
                data-testid="test-cases-generating"
              >
                🪄 Generating test cases... (this takes 5-10 seconds)
              </div>
            )}

            {generationError && (
              <div className="mt-2 p-3 bg-red-50 text-red-700 rounded text-sm">
                {generationError}. You can add test cases manually.
              </div>
            )}

            {aiGenerated && testCases.length > 0 && !generating && (
              <div
                className="mt-2 p-2 bg-yellow-50 text-yellow-800 rounded text-xs"
                data-testid="ai-generated-banner"
              >
                ⚠️ AI generated, please review and edit.
              </div>
            )}

            <div className="mt-2 space-y-2" data-testid="test-cases-list">
              {testCases.map((tc, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={tc.input}
                    onChange={(e) => {
                      const updated = [...testCases];
                      updated[i] = { ...tc, input: e.target.value };
                      setTestCases(updated);
                    }}
                    placeholder="Input"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                  />
                  <span className="text-gray-400 mt-1">→</span>
                  <input
                    type="text"
                    value={tc.expected}
                    onChange={(e) => {
                      const updated = [...testCases];
                      updated[i] = { ...tc, expected: e.target.value };
                      setTestCases(updated);
                    }}
                    placeholder="Expected"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setTestCases(testCases.filter((_, idx) => idx !== i));
                    }}
                    className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    title="Delete test case"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  setTestCases([...testCases, { input: "", expected: "", description: "" }]);
                }}
                className="text-sm text-blue-600 hover:underline"
                data-testid="add-test-case-button"
              >
                + Add Test Case
              </button>
            </div>
          </div>

          {errors.length > 0 && (
            <div
              role="alert"
              data-testid="modal-errors"
              className="p-3 bg-red-50 text-red-700 rounded text-sm"
            >
              <ul className="list-disc list-inside">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex gap-2 justify-end bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={generating}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50"
            data-testid="save-problem-button"
          >
            Save & Try
          </button>
        </div>
      </div>
    </div>
  );
}
