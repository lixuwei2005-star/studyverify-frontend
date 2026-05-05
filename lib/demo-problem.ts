import type { CustomProblem } from "./custom-problems";

export const DEMO_PROBLEM: CustomProblem = {
  problem_id: "py-001-sum-list",
  problem_text:
    "Write a Python function `sum_list(nums)` that returns the sum of all integers in the input list. If the list is empty, return 0.",
  entry_function: "sum_list",
  test_cases: [
    { input: "[1, 2, 3]", expected: "6", description: "basic" },
    { input: "[]", expected: "0", description: "empty list" },
    { input: "[-1, 1, 0]", expected: "0", description: "negatives + zero" },
  ],
  source: "builtin",
  createdAt: 0,
};

export const DEFAULT_BUGGY_CODE = `def sum_list(nums):
    return 0
`;

// Generic starter for user-uploaded problems. Single-arg signature with
// `pass` body — explicitly buggy so /solve has something to verify against
// and the user has a clear edit target. Multi-arg signatures must be
// adjusted manually in the editor (out of Phase A scope).
export function defaultBuggyCode(entryFunction: string): string {
  return `def ${entryFunction}(input):\n    pass\n`;
}
