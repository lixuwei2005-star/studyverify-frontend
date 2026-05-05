"use client";

import { useEffect, useRef, useState } from "react";

import { generateTestCases } from "@/lib/api";
import { type CustomProblem, validateCustomProblem } from "@/lib/custom-problems";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (p: CustomProblem) => void;
  existingIds: string[];
};

const FN_NAME_RE = /^[a-z_][a-z0-9_]*$/;
const PROBLEM_ID_RE = /^[a-z0-9-]+$/;

function validateMetadata(
  problemId: string,
  description: string,
  functionName: string,
): string[] {
  const errors: string[] = [];
  if (!problemId.trim()) errors.push("Problem ID is required");
  else if (!PROBLEM_ID_RE.test(problemId.trim()))
    errors.push("Problem ID: lowercase letters, digits, hyphens only");

  if (!description.trim()) errors.push("Description is required");
  else if (description.trim().length < 10)
    errors.push("Description should be at least 10 characters");

  if (!functionName.trim()) errors.push("Function name is required");
  else if (!FN_NAME_RE.test(functionName.trim()))
    errors.push("Function name: must be a valid Python identifier (lowercase)");

  return errors;
}

export function AddProblemModal({ open, onClose, onSave, existingIds }: Props) {
  const [problemId, setProblemId] = useState("");
  const [description, setDescription] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Cancel flag for the in-flight generate request: if the user closes the
  // modal before the LLM responds, skip the setState that would re-open it.
  const cancelRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  useEffect(() => {
    if (open) {
      setProblemId("");
      setDescription("");
      setFunctionName("");
      setErrors([]);
      setSaving(false);
      setSaveError(null);
      cancelRef.current = { cancelled: false };
    }
    return () => {
      cancelRef.current.cancelled = true;
    };
  }, [open]);

  const handleSave = async () => {
    const metaErrors = validateMetadata(problemId, description, functionName);
    if (metaErrors.length > 0) {
      setErrors(metaErrors);
      setSaveError(null);
      return;
    }
    if (existingIds.includes(problemId.trim())) {
      setErrors([`Problem ID "${problemId.trim()}" already exists`]);
      setSaveError(null);
      return;
    }
    setErrors([]);

    cancelRef.current = { cancelled: false };
    const localCancel = cancelRef.current;

    setSaving(true);
    setSaveError(null);

    try {
      const generated = await generateTestCases(
        description.trim(),
        functionName.trim(),
        5,
      );
      if (localCancel.cancelled) return;

      const problem: CustomProblem = {
        problem_id: problemId.trim(),
        problem_text: description.trim(),
        entry_function: functionName.trim(),
        test_cases: generated.map((tc) => ({
          input: tc.input,
          expected: tc.expected,
          description: tc.description ?? "",
        })),
        source: "custom",
        createdAt: Date.now(),
      };

      // Defensive: backend Pydantic + LLM should already produce valid
      // test cases, but if a response came back empty, surface it as a
      // generation failure rather than saving an unusable problem.
      const finalCheck = validateCustomProblem(problem);
      if (!finalCheck.valid) {
        setSaveError(`Generated test cases were invalid: ${finalCheck.errors.join("; ")}`);
        setSaving(false);
        return;
      }

      onSave(problem);
      onClose();
    } catch (e) {
      if (localCancel.cancelled) return;
      setSaveError(
        e instanceof Error
          ? `Failed to generate test cases: ${e.message}`
          : "Failed to generate test cases",
      );
      setSaving(false);
    }
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
              disabled={saving}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded disabled:bg-gray-50 disabled:text-gray-500"
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
              disabled={saving}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded disabled:bg-gray-50 disabled:text-gray-500"
              data-testid="problem-text-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Function name</label>
            <input
              type="text"
              value={functionName}
              onChange={(e) => setFunctionName(e.target.value)}
              placeholder="fizzbuzz"
              disabled={saving}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded disabled:bg-gray-50 disabled:text-gray-500"
              data-testid="function-name-input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Python identifier (test cases will auto-generate on Save)
            </p>
          </div>

          {saving && (
            <div
              className="p-3 bg-blue-50 text-blue-800 rounded text-sm"
              data-testid="saving-banner"
            >
              🪄 Generating test cases... (this takes 5-10 seconds)
            </div>
          )}

          {saveError && (
            <div
              role="alert"
              data-testid="save-error"
              className="p-3 bg-red-50 text-red-700 rounded text-sm"
            >
              {saveError}
            </div>
          )}

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
            disabled={saving}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="save-problem-button"
          >
            {saving ? "Generating..." : "Save & Try"}
          </button>
        </div>
      </div>
    </div>
  );
}
