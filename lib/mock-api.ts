// Frontend-only canned responses used while NEXT_PUBLIC_API_MODE=mock.
// Phases 4-6 build the UI against this; Phase 7 flips the env flag and the
// real backend at https://api.005917.xyz takes over. Mock data is recognizably
// fake (every text field carries a `[mock]` prefix) so it cannot be confused
// with backend output during demos or screenshots.
//
// Anti-leak invariant: VerifyResponse.output.test_results uses RedactedTestResult
// (no `expected`). Re-importing the type from ./types ensures the mock cannot
// accidentally drift from that contract.

import type {
  HintResponse,
  SolveRequest,
  SolveResponse,
  TestCase,
  VerifyResponse,
} from "./types";

const MOCK_SOLVER_SESSION_ID = "00000000-0000-4000-8000-000000000001";
const MOCK_VERIFIER_SESSION_ID = "00000000-0000-4000-8000-000000000002";
const MOCK_HINT_SESSION_ID = "00000000-0000-4000-8000-000000000003";

const MOCK_DIAGNOSIS =
  "[mock] Your function currently returns a constant value, so it does not react to the numbers inside nums.";

const MOCK_HINTS: string[] = [
  "[mock] Try asking what information from nums your function is currently ignoring.",
  "[mock] A running total usually starts from the value that represents nothing accumulated yet.",
  "[mock] Think about how each number in the list should affect that running total.",
  "[mock] Empty input should naturally fall out of your starting value.",
  "[mock] Before returning, check whether every element had a chance to update the result.",
];

const MAX_MOCK_HINTS = MOCK_HINTS.length; // mirrors backend MAX_HINTS_PER_VERIFIER_SESSION = 5

// Module-scoped state. Persists across renders so the hint counter advances
// across calls within a single page session, matching backend's per-verifier
// hint chain. Page reload resets (matches backend's per-session model since
// reload creates a new verifier_session anyway).
let _hintCounter = 0;

export function _resetMocks(): void {
  _hintCounter = 0;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateTestCasesMock(
  _problem_text: string,
  _entry_function: string,
  _n: number,
): Promise<TestCase[]> {
  await delay(1000);
  return [
    { input: "[1, 2, 3]", expected: "6", description: "[mock] normal case" },
    { input: "[]", expected: "0", description: "[mock] empty list" },
    { input: "[-1, 1]", expected: "0", description: "[mock] negatives" },
  ];
}

export async function solveProblemMock(problem: SolveRequest): Promise<SolveResponse> {
  await delay(500);
  return {
    session_id: MOCK_SOLVER_SESSION_ID,
    output: {
      problem_id: problem.problem_id,
      entry_function: "sum_list",
      analysis:
        "[mock] Sum all integers in the input list; return 0 for the empty list.",
      plan_steps: [
        {
          step_number: 1,
          action: "[mock] Define sum_list(nums)",
          rationale: "Match the required function signature.",
        },
        {
          step_number: 2,
          action: "[mock] Return Python's built-in sum(nums)",
          rationale: "sum() handles the empty list naturally by returning 0.",
        },
      ],
      code: "def sum_list(nums):\n    return sum(nums)\n",
      explanation:
        "[mock] Python's built-in sum() iterates over the list and returns 0 when the list is empty, so a one-line solution covers every test case.",
      confidence: 0.95,
      verified: true,
      test_results: [
        {
          test_index: 0,
          input: "[1, 2, 3]",
          expected: "6",
          actual: "6",
          passed: true,
          error: null,
          duration_ms: 1,
        },
        {
          test_index: 1,
          input: "[]",
          expected: "0",
          actual: "0",
          passed: true,
          error: null,
          duration_ms: 1,
        },
        {
          test_index: 2,
          input: "[-1, 1, 0]",
          expected: "0",
          actual: "0",
          passed: true,
          error: null,
          duration_ms: 1,
        },
      ],
      retry_used: false,
    },
  };
}

export async function verifyCodeMock(
  _solverSessionId: string,
  studentCode: string,
): Promise<VerifyResponse> {
  await delay(800);
  const passes =
    studentCode.includes("return sum(nums)") ||
    studentCode.includes("return total");

  if (passes) {
    return {
      session_id: MOCK_VERIFIER_SESSION_ID,
      output: {
        problem_id: "py-001-sum-list",
        verified: true,
        status: "all_passed",
        pass_count: 3,
        fail_count: 0,
        test_results: [
          { input: "[1, 2, 3]", actual: "6", passed: true, duration_ms: 1, error: null },
          { input: "[]", actual: "0", passed: true, duration_ms: 1, error: null },
          { input: "[-1, 1, 0]", actual: "0", passed: true, duration_ms: 1, error: null },
        ],
        diagnosis: "",
        sandbox_error: null,
      },
    };
  }

  return {
    session_id: MOCK_VERIFIER_SESSION_ID,
    output: {
      problem_id: "py-001-sum-list",
      verified: false,
      status: "some_failed",
      pass_count: 1,
      fail_count: 2,
      // RedactedTestResult shape: NO `expected` field. Mirrors backend's
      // anti-leak invariant — the verifier API never exposes the answer key.
      test_results: [
        { input: "[1, 2, 3]", actual: "0", passed: false, duration_ms: 2, error: null },
        { input: "[]", actual: "0", passed: true, duration_ms: 1, error: null },
        { input: "[-1, 1, 0]", actual: "0", passed: true, duration_ms: 1, error: null },
      ],
      diagnosis: MOCK_DIAGNOSIS,
      sandbox_error: null,
    },
  };
}

export async function getHintMock(_verifierSessionId: string): Promise<HintResponse> {
  await delay(600);
  if (_hintCounter >= MAX_MOCK_HINTS) {
    // Mirrors backend's HintLimitExceededError. Phase 6 surfaces this as a
    // user-facing "max reached" message; the mock just throws so the api.ts
    // wrapper's error path is exercised during dev.
    throw new Error("[mock] Hint limit exceeded — maximum 5 hints per verifier session");
  }
  const hint_index = _hintCounter + 1;
  const hint_text = MOCK_HINTS[_hintCounter];
  _hintCounter += 1;
  return {
    session_id: MOCK_HINT_SESSION_ID,
    hint_index,
    hint_text,
  };
}
