"use client";

import type { VerifyResponse } from "@/lib/types";

type Props = {
  output: VerifyResponse["output"];
};

// IMPORTANT: This table renders only Status / Input / Actual columns.
// `expected` is deliberately absent from RedactedTestResult (see
// lib/types.ts and backend/app/agents/verifier/schemas.py) so the verifier
// API cannot leak the answer key. Adding an Expected column here would
// require breaking that type contract — both the type system and this
// comment exist to prevent that.
export function TestResultsTable({ output }: Props) {
  return (
    <div data-testid="test-results" className="bg-white rounded-lg shadow p-4 mt-4">
      {output.verified ? (
        <h3 data-testid="verify-header" className="text-green-700 font-bold">
          ✅ All tests passed
        </h3>
      ) : (
        <h3 data-testid="verify-header" className="text-red-700 font-bold">
          ❌ Verification failed
        </h3>
      )}

      {!output.verified && output.diagnosis && (
        <p data-testid="diagnosis" className="text-gray-700 mt-2 leading-relaxed">
          {output.diagnosis}
        </p>
      )}

      <table className="w-full text-sm mt-3 border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 font-semibold">Status</th>
            <th className="text-left p-2 font-semibold">Input</th>
            <th className="text-left p-2 font-semibold">Actual</th>
          </tr>
        </thead>
        <tbody>
          {output.test_results.map((tr, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="p-2">{tr.passed ? "✅" : "❌"}</td>
              <td className="p-2 font-mono text-gray-800">{tr.input}</td>
              <td className="p-2 font-mono text-gray-800">{tr.actual ?? "(error)"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {output.sandbox_error && (
        <div
          role="alert"
          className="mt-3 bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm"
        >
          <strong className="font-semibold">Sandbox error:</strong> {output.sandbox_error}
        </div>
      )}
    </div>
  );
}
