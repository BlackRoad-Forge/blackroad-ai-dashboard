import { test, expect } from '@playwright/test'

test.describe('Pricing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('tab-pricing').click()
  })

  test('shows pricing view', async ({ page }) => {
    await expect(page.getByTestId('pricing-view')).toBeVisible()
  })

  test('displays all three plans', async ({ page }) => {
    await expect(page.getByTestId('plan-free')).toBeVisible()
    await expect(page.getByTestId('plan-pro')).toBeVisible()
    await expect(page.getByTestId('plan-enterprise')).toBeVisible()
  })

  test('shows correct prices', async ({ page }) => {
    await expect(page.getByTestId('plan-free')).toContainText('$0')
    await expect(page.getByTestId('plan-pro')).toContainText('$19')
    await expect(page.getByTestId('plan-enterprise')).toContainText('$49')
  })

  test('pro plan is marked as popular', async ({ page }) => {
    await expect(page.getByText('POPULAR')).toBeVisible()
  })

  test('free plan button says Current Plan', async ({ page }) => {
    await expect(page.getByTestId('checkout-free')).toContainText('Current Plan')
  })

  test('paid plans have Subscribe buttons', async ({ page }) => {
    await expect(page.getByTestId('checkout-pro')).toContainText('Subscribe')
    await expect(page.getByTestId('checkout-enterprise')).toContainText('Subscribe')
  })

  test('shows plan features', async ({ page }) => {
    await expect(page.getByTestId('plan-free')).toContainText('1 agent access')
    await expect(page.getByTestId('plan-pro')).toContainText('5 agent access')
    await expect(page.getByTestId('plan-enterprise')).toContainText('All 9 agents')
  })

  test('shows Stripe payment notice', async ({ page }) => {
    await expect(page.getByText('Payments processed securely by Stripe')).toBeVisible()
  })
})
