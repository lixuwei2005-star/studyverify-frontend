"use client";

import { useEffect, useState } from "react";

import { CodeEditor } from "./CodeEditor";
import { TestResultsTable } from "./TestResultsTable";
import { VerifyButton } from "./VerifyButton";
import { solveProblem, verifyCode } from "@/lib/api";
import { DEFAULT_BUGGY_CODE, DEMO_PROBLEM } from "@/lib/demo-problem";
import type { VerifyResponse } from "@/lib/types";

export function DemoApp() {
  const [code, setCode] = useState(DEFAULT_BUGGY_CODE);
  const [solverSessionId, setSolverSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verify state lives separately from initial-solve state. A verify failure
  // should not blank out the editor, and a stale verifyOutput stays visible
  // until the user re-submits — fine for the MVP since clicking Submit
  // overwrites it with fresh data.
  const [verifierSessionId, setVerifierSessionId] = useState<string | null>(null);
  const [verifyOutput, setVerifyOutput] = useState<VerifyResponse["output"] | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // The cancelled flag pattern keeps Strict Mode's dev-only double-mount safe:
  // if the first effect tear-down runs before /solve resolves, the resolved
  // setState calls are skipped instead of warning about state on an unmounted
  // component. Production renders only fire the effect once.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setLoading(true);
        const response = await solveProblem(DEMO_PROBLEM);
        if (!cancelled) {
          setSolverSessionId(response.session_id);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Backend is unavailable. Try mock mode or restart the API.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

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

  if (loading) {
    return (
      <section className="bg-white rounded-lg shadow p-6 min-h-[400px] flex items-center justify-center text-sm text-gray-500">
        Initializing demo...
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white rounded-lg shadow p-6">
        <div
          role="alert"
          className="border border-red-200 bg-red-50 text-red-800 rounded p-3 text-sm"
        >
          <strong className="font-semibold">Error:</strong> {error}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <CodeEditor code={code} onChange={setCode} />

      <div className="mt-4 flex gap-2">
        <VerifyButton onClick={handleVerify} loading={verifyLoading} />
      </div>

      {verifyError && (
        <div
          role="alert"
          className="mt-3 bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm"
        >
          {verifyError}
        </div>
      )}

      {verifyOutput && <TestResultsTable output={verifyOutput} />}

      {solverSessionId && (
        <p className="mt-3 text-xs text-gray-400 font-mono">
          Session: {solverSessionId.slice(0, 8)}
          {verifierSessionId && ` · Verifier: ${verifierSessionId.slice(0, 8)}`}
        </p>
      )}
    </section>
  );
}
