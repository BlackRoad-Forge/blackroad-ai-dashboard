import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders page title', async ({ page }) => {
    await expect(page.getByText('BlackRoad AI Network')).toBeVisible()
  })

  test('shows dashboard tab by default', async ({ page }) => {
    await expect(page.getByTestId('dashboard-view')).toBeVisible()
  })

  test('displays all three team sections', async ({ page }) => {
    await expect(page.getByText('Infrastructure Team')).toBeVisible()
    await expect(page.getByText('Creative Team')).toBeVisible()
    await expect(page.getByText('Coding Team')).toBeVisible()
  })

  test('shows all 9 agents', async ({ page }) => {
    const agentNames = ['Lucidia', 'Marcus', 'Viktor', 'Sophia', 'CECE', 'Luna', 'Dante', 'Aria-Prime', 'Aria-Tiny']
    for (const name of agentNames) {
      await expect(page.getByTestId(`agent-card-${name}`)).toBeVisible()
    }
  })

  test('clicking agent card navigates to chat', async ({ page }) => {
    await page.getByTestId('agent-card-Lucidia').click()
    await expect(page.getByTestId('chat-view')).toBeVisible()
    await expect(page.getByTestId('chat-input')).toBeVisible()
  })

  test('stat cards display values', async ({ page }) => {
    await expect(page.getByText('AGENTS')).toBeVisible()
    await expect(page.getByText('DEVICES')).toBeVisible()
    await expect(page.getByText('STATUS')).toBeVisible()
  })
})
