import type { Problem } from "./types";

export const DEMO_PROBLEM: Problem = {
  problem_id: "py-001-sum-list",
  problem_text:
    "Write a Python function `sum_list(nums)` that returns the sum of all integers in the input list. If the list is empty, return 0.",
  test_cases: [
    { input: "[1, 2, 3]", expected: "6", description: "basic" },
    { input: "[]", expected: "0", description: "empty list" },
    { input: "[-1, 1, 0]", expected: "0", description: "negatives + zero" },
  ],
};

export const DEFAULT_BUGGY_CODE = `def sum_list(nums):
    return 0
`;
