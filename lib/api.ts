// Single public API wrapper. Components import only from here; the real-vs-mock
// switch is a concern of this file alone.
//
// Mode is read from NEXT_PUBLIC_API_MODE at build/dev-server start time
// (Next.js inlines NEXT_PUBLIC_* env vars into the client bundle). Default is
// "mock" so a fresh `npm run dev` works without any backend dependency.

import {
  generateTestCasesMock,
  getHintMock,
  solveProblemMock,
  verifyCodeMock,
} from "./mock-api";
import type {
  HintResponse,
  SolveRequest,
  SolveResponse,
  TestCase,
  VerifyResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

function isMockMode(): boolean {
  return API_MODE === "mock";
}

export async function solveProblem(problem: SolveRequest): Promise<SolveResponse> {
  if (isMockMode()) return solveProblemMock(problem);

  const res = await fetch(`${API_BASE}/api/v1/solve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(problem),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Solve failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function verifyCode(
  solverSessionId: string,
  studentCode: string,
): Promise<VerifyResponse> {
  if (isMockMode()) return verifyCodeMock(solverSessionId, studentCode);

  const res = await fetch(`${API_BASE}/api/v1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      solver_session_id: solverSessionId,
      student_code: studentCode,
    }),
  });
  if (!res.ok) {
    throw new Error(`Verify failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function generateTestCases(
  problem_text: string,
  entry_function: string,
  n: number = 5,
): Promise<TestCase[]> {
  if (isMockMode()) return generateTestCasesMock(problem_text, entry_function, n);

  const res = await fetch(`${API_BASE}/api/v1/generate-test-cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problem_text, entry_function, n }),
  });
  if (!res.ok) {
    throw new Error(`Test case generation failed: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as { test_cases: TestCase[] };
  return data.test_cases;
}

export async function getHint(verifierSessionId: string): Promise<HintResponse> {
  if (isMockMode()) return getHintMock(verifierSessionId);

  const res = await fetch(`${API_BASE}/api/v1/hint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verifier_session_id: verifierSessionId }),
  });
  if (!res.ok) {
    throw new Error(`Hint failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
