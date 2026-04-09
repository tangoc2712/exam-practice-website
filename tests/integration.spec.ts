import { test, expect } from '@playwright/test';

const APP_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173/exam-practice-website/';

const firstOption = (page: import('@playwright/test').Page) => page.locator('span.leading-snug').first();

test.describe('Exam Practice Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // TC_001: Load exam list smoothly
    await page.goto(APP_URL);
  });

  test('TC_017, TC_018, TC_019 - Add Custom Exam via Modal', async ({ page }) => {
    // TC_017: Open Add Exam Modal
    await page.getByText('Add Your Own Exam').first().click();
    await expect(page.getByText('Add Your Own Exam', { exact: true }).nth(1)).toBeVisible();

    // TC_019: Close Add Exam Modal
    const closeBtn = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
    await closeBtn.click();
    await expect(page.getByText('Add Your Own Exam', { exact: true }).nth(1)).toBeHidden();

    // Reopen and TC_018: Add custom exam via Text Input
    await page.getByText('Add Your Own Exam').first().click();
    await page.getByText('Input Text').click();
    
    const customExamJSON = {
      title: "Playwright Custom Exam",
      questions: [
        {
          domain: "Testing",
          text: "Playwright question 1?",
          type: "single",
          options: [
            { text: "Correct", isCorrect: true, explanation: "Yes" },
            { text: "Wrong", isCorrect: false, explanation: "No" }
          ],
          hint: "Think testing"
        }
      ]
    };

    const textarea = page.locator('textarea');
    await textarea.waitFor({ state: 'visible' });
    await textarea.fill(JSON.stringify(customExamJSON));
    await page.getByRole('button', { name: 'Submit Exam' }).click();

    // Modal should close and the new exam should be visible
    await expect(page.getByText('Playwright Custom Exam')).toBeVisible();
  });

  test('Exam Workflow (TC_002 to TC_016, TC_020 to TC_023)', async ({ page }) => {
    // TC_002: Start an exam session
    await page.getByText(/^Exam #/).first().click();
    await expect(page.getByText(/Question \d+ of \d+/)).toBeVisible();

    // TC_003: Answer single choice question
    await firstOption(page).click();
    
    // TC_006: Toggle Question Hint
    const hintButton = page.locator('button[title="Toggle Hint"]');
    await hintButton.click();
    await expect(hintButton).toHaveClass(/bg-amber-100/);
    await hintButton.click(); // hide
    await expect(hintButton).not.toHaveClass(/bg-amber-100/);

    // TC_007: Toggle Mark for Review
    const flagButton = page.locator('button[title="Mark for Review"]');
    await flagButton.click();
    
    // TC_008: Navigate to next question
    await page.getByRole('button', { name: 'Next Question' }).click();
    await expect(page.getByText(/Question \d+ of \d+/)).toBeVisible();

    // TC_020: Navigate to previous question
    await page.getByRole('button', { name: 'Previous Question' }).click();
    await expect(page.getByText(/Question 1 of \d+/)).toBeVisible();

    // Fast forward to end of exam
    // Answer first question and navigate forward
    await firstOption(page).click();
    while (await page.getByRole('button', { name: 'Next Question' }).isVisible()) {
      await firstOption(page).click();
      await page.getByRole('button', { name: 'Next Question' }).click();
    }

    // Last question - answer it
    await firstOption(page).click();

    // TC_021: Preview page displays question summary table
    await page.getByRole('button', { name: 'Review & Submit' }).click();
    await expect(page.getByText('Exam Preview')).toBeVisible();
    // Verify header columns exist
    await expect(page.getByText('Answered').first()).toBeVisible();
    await expect(page.getByText('Flagged for Review').first()).toBeVisible();
    // Verify table rows exist
    const previewRows = page.locator('[data-testid^="preview-row-"]');
    await expect(previewRows.first()).toBeVisible();

    // TC_022: Navigate from preview to a specific question
    await previewRows.first().click();
    await expect(page.getByText(/Question 1 of \d+/)).toBeVisible();

    // Navigate back to last question and go to preview again
    while (await page.getByRole('button', { name: 'Next Question' }).isVisible()) {
      await page.getByRole('button', { name: 'Next Question' }).click();
    }
    await page.getByRole('button', { name: 'Review & Submit' }).click();
    await expect(page.getByText('Exam Preview')).toBeVisible();

    // TC_023: Submit exam from preview page
    // TC_009: Trigger submit confirmation (now from preview page)
    await page.getByRole('button', { name: 'Submit Exam' }).click();
    await expect(page.getByText('Submit Exam?')).toBeVisible();

    // TC_010: Cancel exam submission
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByText('Submit Exam?')).toBeHidden();

    // TC_011: Confirm exam submission
    await page.getByRole('button', { name: 'Submit Exam' }).click();
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    
    // TC_012: Validate score calculation and display
    await expect(page.getByText('Exam Completed')).toBeVisible();
    // TC_013 & TC_014: Review correct/incorrect answers
    const resultsHeader = page.getByText(/out of \d+ correct/);
    await expect(resultsHeader).toBeVisible();

    // TC_015: Retake current exam
    await page.getByRole('button', { name: 'Retake Exam' }).click();
    await expect(page.getByText(/Question \d+ of \d+/)).toBeVisible();

    // Skip to end again via next + review & submit
    while (await page.getByRole('button', { name: 'Next Question' }).isVisible()) {
      await page.getByRole('button', { name: 'Next Question' }).click();
    }
    await page.getByRole('button', { name: 'Review & Submit' }).click();
    await page.getByRole('button', { name: 'Submit Exam' }).click();
    await page.getByRole('button', { name: 'Submit', exact: true }).click();

    // TC_016: Navigate to select a different exam
    await page.getByRole('button', { name: 'Choose Another Exam' }).click();
    await expect(page.getByText('Add Your Own Exam')).toBeVisible();
  });
});
