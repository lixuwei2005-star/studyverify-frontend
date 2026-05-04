// TypeScript shapes for the StudyVerify backend API.
//
// These types mirror the Pydantic schemas in:
//   backend/app/agents/solver/schemas.py    (SolverOutput, PlanStep, TestCase)
//   backend/app/agents/verifier/schemas.py  (VerifierOutput, RedactedTestResult)
//   backend/app/schemas/hint_session.py     (HintResponse — flat shape)
//
// Anti-leak invariant (from backend Step 5.2): RedactedTestResult deliberately
// omits the `expected` field so the verifier API cannot leak the answer key.
// This file mirrors that constraint at the type level — you cannot assign or
// read `.expected` on a RedactedTestResult.

export type TestCase = {
  input: string;
  expected: string;
  description: string;
};

export type Problem = {
  problem_id: string;
  problem_text: string;
  test_cases: TestCase[];
};

export type PlanStep = {
  step_number: number;
  action: string;
  rationale: string;
};

export type SolverTestResult = {
  test_index: number;
  input: string;
  expected: string;
  actual: string | null;
  passed: boolean;
  error: string | null;
  duration_ms: number;
};

export type SolveRequest = Problem;

export type SolveResponse = {
  session_id: string;
  output: {
    problem_id: string;
    entry_function: string;
    analysis: string;
    plan_steps: PlanStep[];
    code: string;
    explanation: string;
    confidence: number;
    verified: boolean;
    test_results: SolverTestResult[];
    retry_used: boolean;
  };
};

// NOTE: no `expected` field. Adding it here would break the anti-leak
// invariant enforced by the backend's verifier schemas.
export type RedactedTestResult = {
  input: string;
  actual: string | null;
  passed: boolean;
  duration_ms: number | null;
  error: string | null;
};

export type VerifyResponse = {
  session_id: string;
  output: {
    problem_id: string;
    verified: boolean;
    status: "all_passed" | "some_failed" | "error" | "timeout";
    pass_count: number;
    fail_count: number;
    test_results: RedactedTestResult[];
    diagnosis: string;
    sandbox_error: string | null;
  };
};

// Flat shape — no `output` wrapper. The hint endpoint returns the hint
// fields at the top level alongside session_id (which is the
// hint_session_id, not the verifier_session_id).
export type HintResponse = {
  session_id: string;
  hint_index: number;
  hint_text: string;
};

export type HintViewModel = {
  index: number;
  text: string;
};
