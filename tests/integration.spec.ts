import { test, expect } from '@playwright/test';

test.describe('Exam Practice Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // TC_001: Load exam list smoothly
    await page.goto('http://localhost:5173'); // Attempt default port
    // If not responsive, tests will fail or we can configure base url. Let's assume vite is on 5173 or 5174.
    // The playwright config can set this, but we'll try 5174 since it's the one I used manually.
    await page.goto('http://localhost:5174').catch(() => page.goto('http://localhost:5173'));
  });

  test('TC_017, TC_018, TC_019 - Add Custom Exam via Modal', async ({ page }) => {
    // TC_017: Open Add Exam Modal
    await page.getByText('Add Your Own Exam').first().click();
    // Use nth(1) because both the card and the modal header have this text
    await expect(page.getByText('Add Your Own Exam', { exact: true }).nth(1)).toBeVisible();

    // TC_019: Close Add Exam Modal
    // The close button is absolute positioned top right inside the modal.
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

  test('Exam Workflow (TC_002 to TC_016)', async ({ page }) => {
    // TC_002: Start an exam session
    await page.getByText('Google Professional Data Engineer').first().click();
    await expect(page.getByText(/Question \d+ of \d+/)).toBeVisible();

    // TC_003: Answer single choice question
    // Options are identified by the option text or as children of the card
    const optionLabels = page.locator('span.text-lg');
    await optionLabels.nth(0).click();
    await optionLabels.nth(1).click();
    
    // TC_006: Toggle Question Hint
    const hintButton = page.locator('button[title="Toggle Hint"]');
    await hintButton.click();
    // Hint content should appear. It has specific colors
    await expect(page.locator('div.bg-neon-cyan\\/10 p').last()).toBeVisible(); 
    await hintButton.click(); // hide

    // TC_007: Toggle Mark for Review
    const flagButton = page.locator('button[title="Mark for Review"]');
    await flagButton.click();
    
    // TC_008: Navigate to next question
    await page.getByRole('button', { name: 'Next Question' }).click();
    await expect(page.getByText(/Question \d+ of \d+/)).toBeVisible();

    // Fast forward to end of exam (TC_009)
    // Assume questions are answered with the first option
    while (await page.getByRole('button', { name: 'Next Question' }).isVisible()) {
      // Must re-evaluate optionLabels inside loop because they change per question
      await page.locator('span.text-lg').nth(0).click();
      await page.getByRole('button', { name: 'Next Question' }).click();
    }

    // Last question, answering it before submitting
    await page.locator('span.text-lg').nth(0).click();

    // TC_009: Trigger submit confirmation
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

    // Skip to end again
    while (await page.getByRole('button', { name: 'Next Question' }).isVisible()) {
      await page.getByRole('button', { name: 'Next Question' }).click();
    }
    await page.getByRole('button', { name: 'Submit Exam' }).click();
    await page.getByRole('button', { name: 'Submit', exact: true }).click();

    // TC_016: Navigate to select a different exam
    await page.getByRole('button', { name: 'Choose Another Exam' }).click();
    await expect(page.getByText('Add Your Own Exam')).toBeVisible();
  });
});
