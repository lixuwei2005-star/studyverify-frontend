import { test, expect } from "@playwright/test";

// Single end-to-end smoke test against mock mode. Assertions are structural
// (data-testid + .toBeVisible / .toBeEnabled / regex .toContainText) — no
// matches against exact LLM-driven text, since Phase 7+ will hit the real
// backend whose responses are not deterministic.

test("MVP full flow in mock mode", async ({ page }) => {
  // 1. Page loads + ProblemCard rendered server-side.
  await page.goto("/");
  await expect(page.getByTestId("problem-card")).toBeVisible();

  // 2. /solve initialization completes — loading placeholder disappears,
  //    Monaco wrapper appears.
  await expect(page.getByTestId("initializing")).toBeHidden({ timeout: 5000 });
  await expect(page.getByTestId("code-editor")).toBeVisible();

  // 3. Click Submit with default buggy code (DEFAULT_BUGGY_CODE returns 0).
  await page.getByTestId("verify-button").click();

  // 4. Mock /verify (~800ms) resolves; results table appears.
  await expect(page.getByTestId("test-results")).toBeVisible({ timeout: 5000 });
  await expect(page.getByTestId("verify-header")).toContainText(/(failed|passed)/i);

  // 5. Get-Hint button is enabled now that we have a verifier session.
  await expect(page.getByTestId("get-hint-button")).toBeEnabled();

  // 6. Click Get a Hint.
  await page.getByTestId("get-hint-button").click();

  // 7. First hint appears (mock /hint ~600ms).
  await expect(page.getByTestId("hint-item").first()).toBeVisible({ timeout: 5000 });

  // 8. Counter shows 1/5.
  await expect(page.getByTestId("hint-counter")).toContainText("1/5");
});
