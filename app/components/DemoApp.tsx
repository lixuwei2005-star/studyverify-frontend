"use client";

import { useEffect, useState } from "react";

import { AddProblemModal } from "./AddProblemModal";
import { CodeEditor } from "./CodeEditor";
import { HintPanel } from "./HintPanel";
import ProblemCard from "./ProblemCard";
import { ProblemSidebar } from "./ProblemSidebar";
import { TestResultsTable } from "./TestResultsTable";
import { VerifyButton } from "./VerifyButton";
import { getHint, solveProblem, verifyCode } from "@/lib/api";
import {
  type CustomProblem,
  deleteCustomProblem,
  loadCustomProblems,
  saveCustomProblem,
} from "@/lib/custom-problems";
import { defaultBuggyCode, DEFAULT_BUGGY_CODE, DEMO_PROBLEM } from "@/lib/demo-problem";
import type { HintViewModel, VerifyResponse } from "@/lib/types";
import { useLoadingTimer, type LoadingStage } from "@/lib/use-loading-timer";

const MAX_HINTS = 5;

const INIT_STAGES: LoadingStage[] = [
  { untilSeconds: 5, label: "Calling LLM" },
  { untilSeconds: 12, label: "Running sandbox tests" },
  { untilSeconds: 18, label: "Verifying solution" },
  { untilSeconds: Infinity, label: "Almost there" },
];

const VERIFY_STAGES: LoadingStage[] = [
  { untilSeconds: 3, label: "Running sandbox" },
  { untilSeconds: 8, label: "Generating diagnosis" },
  { untilSeconds: Infinity, label: "Almost there" },
];

const HINT_STAGES: LoadingStage[] = [
  { untilSeconds: 2, label: "Retrieving similar cases" },
  { untilSeconds: 6, label: "Generating hint" },
  { untilSeconds: Infinity, label: "Almost there" },
];

function starterCodeFor(problem: CustomProblem): string {
  // Built-in keeps its hand-written buggy starter so smoke tests and demos
  // remain stable; custom problems get the generic single-arg `pass` body.
  return problem.source === "builtin"
    ? DEFAULT_BUGGY_CODE
    : defaultBuggyCode(problem.entry_function);
}

export function DemoApp() {
  const [activeProblem, setActiveProblem] = useState<CustomProblem>(DEMO_PROBLEM);
  const [allProblems, setAllProblems] = useState<CustomProblem[]>([DEMO_PROBLEM]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [code, setCode] = useState<string>(starterCodeFor(DEMO_PROBLEM));
  const [solverSessionId, setSolverSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [verifierSessionId, setVerifierSessionId] = useState<string | null>(null);
  const [verifyOutput, setVerifyOutput] = useState<VerifyResponse["output"] | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [hints, setHints] = useState<HintViewModel[]>([]);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);

  const { elapsed: initElapsed, stage: initStage } = useLoadingTimer(loading, INIT_STAGES);
  const { elapsed: verifyElapsed, stage: verifyStage } = useLoadingTimer(
    verifyLoading,
    VERIFY_STAGES,
  );
  const { elapsed: hintElapsed, stage: hintStage } = useLoadingTimer(hintLoading, HINT_STAGES);

  // Load custom problems from localStorage on mount. Done in an effect so SSR
  // sees only the built-in DEMO_PROBLEM and hydration matches.
  useEffect(() => {
    const customs = loadCustomProblems();
    if (customs.length > 0) {
      setAllProblems([DEMO_PROBLEM, ...customs]);
    }
  }, []);

  // Re-run /solve whenever the active problem changes. Reset every per-
  // problem piece of state — solver session, verify output, hints, errors
  // — so a stale verify table from the prior problem doesn't bleed
  // through. Cancel-flag covers the case where the user clicks a third
  // problem before the second one's /solve resolves.
  useEffect(() => {
    let cancelled = false;

    setCode(starterCodeFor(activeProblem));
    setSolverSessionId(null);
    setVerifierSessionId(null);
    setVerifyOutput(null);
    setVerifyError(null);
    setHints([]);
    setHintError(null);
    setError(null);
    setLoading(true);

    solveProblem(activeProblem)
      .then((res) => {
        if (cancelled) return;
        setSolverSessionId(res.session_id);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Backend is unavailable. Try mock mode or restart the API.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProblem.problem_id]);

  async function handleVerify() {
    if (!solverSessionId) return;
    if (!code.trim()) {
      setVerifyError("Please write some code before submitting.");
      return;
    }
    setVerifyLoading(true);
    setVerifyError(null);
    try {
      const res = await verifyCode(solverSessionId, code);
      setVerifierSessionId(res.session_id);
      setVerifyOutput(res.output);
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "Verify failed");
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleGetHint() {
    if (!verifierSessionId) return;
    setHintLoading(true);
    setHintError(null);
    try {
      const res = await getHint(verifierSessionId);
      setHints((prev) => [...prev, { index: res.hint_index, text: res.hint_text }]);
    } catch (err) {
      setHintError(err instanceof Error ? err.message : "Hint request failed");
    } finally {
      setHintLoading(false);
    }
  }

  function handleAddProblem(p: CustomProblem) {
    saveCustomProblem(p);
    setAllProblems([DEMO_PROBLEM, ...loadCustomProblems()]);
    setActiveProblem(p);
  }

  function handleDeleteProblem(problem_id: string) {
    deleteCustomProblem(problem_id);
    setAllProblems([DEMO_PROBLEM, ...loadCustomProblems()]);
    if (activeProblem.problem_id === problem_id) {
      setActiveProblem(DEMO_PROBLEM);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <ProblemSidebar
        problems={allProblems}
        activeId={activeProblem.problem_id}
        onSelect={setActiveProblem}
        onDelete={handleDeleteProblem}
        onAddNew={() => setShowAddModal(true)}
      />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProblemCard problem={activeProblem} />

        {loading ? (
          <section
            data-testid="initializing"
            className="bg-white rounded-lg shadow p-6 min-h-[400px] flex items-center justify-center text-sm text-gray-600"
          >
            {initStage}... <span className="text-gray-400 ml-1">({initElapsed}s)</span>
          </section>
        ) : error ? (
          <section data-testid="solve-error" className="bg-white rounded-lg shadow p-6">
            <div
              role="alert"
              className="border border-red-200 bg-red-50 text-red-800 rounded p-3 text-sm"
            >
              <strong className="font-semibold">Error:</strong> {error}
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-lg shadow p-6">
            <CodeEditor code={code} onChange={setCode} />

            <div className="mt-4 flex gap-2">
              <VerifyButton
                onClick={handleVerify}
                loading={verifyLoading}
                stage={verifyStage}
                elapsed={verifyElapsed}
              />
            </div>

            {verifyError && (
              <div
                role="alert"
                data-testid="verify-error"
                className="mt-3 bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm"
              >
                {verifyError}
              </div>
            )}

            {verifyOutput && <TestResultsTable output={verifyOutput} />}

            <HintPanel
              hints={hints}
              onGetHint={handleGetHint}
              loading={hintLoading}
              maxReached={hints.length >= MAX_HINTS}
              disabled={!verifierSessionId}
              errorMessage={hintError ?? undefined}
              stage={hintStage}
              elapsed={hintElapsed}
            />

            {solverSessionId && (
              <p className="mt-3 text-xs text-gray-400 font-mono">
                Session: {solverSessionId.slice(0, 8)}
                {verifierSessionId && ` · Verifier: ${verifierSessionId.slice(0, 8)}`}
              </p>
            )}
          </section>
        )}
      </main>

      <AddProblemModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddProblem}
        existingIds={allProblems.map((p) => p.problem_id)}
      />
    </div>
  );
}
