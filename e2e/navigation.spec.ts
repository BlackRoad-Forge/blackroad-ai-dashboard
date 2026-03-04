import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('tab navigation works correctly', async ({ page }) => {
    // Start on dashboard
    await expect(page.getByTestId('dashboard-view')).toBeVisible()

    // Go to chat
    await page.getByTestId('tab-chat').click()
    await expect(page.getByTestId('chat-view')).toBeVisible()

    // Go to pricing
    await page.getByTestId('tab-pricing').click()
    await expect(page.getByTestId('pricing-view')).toBeVisible()

    // Back to dashboard
    await page.getByTestId('tab-dashboard').click()
    await expect(page.getByTestId('dashboard-view')).toBeVisible()
  })

  test('footer is always visible', async ({ page }) => {
    await expect(page.getByText('Powered by Raspberry Pi Mesh')).toBeVisible()

    await page.getByTestId('tab-chat').click()
    await expect(page.getByText('Powered by Raspberry Pi Mesh')).toBeVisible()

    await page.getByTestId('tab-pricing').click()
    await expect(page.getByText('Powered by Raspberry Pi Mesh')).toBeVisible()
  })
})
