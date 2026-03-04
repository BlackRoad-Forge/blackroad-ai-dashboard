import { test, expect } from '@playwright/test'

test.describe('Chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('tab-chat').click()
  })

  test('shows chat interface', async ({ page }) => {
    await expect(page.getByTestId('chat-view')).toBeVisible()
    await expect(page.getByTestId('chat-input')).toBeVisible()
    await expect(page.getByTestId('chat-send')).toBeVisible()
  })

  test('shows all agent selector buttons', async ({ page }) => {
    const agentNames = ['Lucidia', 'Marcus', 'Viktor', 'Sophia', 'CECE', 'Luna', 'Dante', 'Aria-Prime', 'Aria-Tiny']
    for (const name of agentNames) {
      await expect(page.getByTestId(`chat-agent-${name}`)).toBeVisible()
    }
  })

  test('switching agents clears messages', async ({ page }) => {
    // Type a message but don't send
    await page.getByTestId('chat-input').fill('Hello')

    // Switch agent
    await page.getByTestId('chat-agent-Marcus').click()

    // Chat messages area should be empty
    await expect(page.getByTestId('chat-messages')).toContainText('Send a message to talk to Marcus')
  })

  test('send button is disabled when input is empty', async ({ page }) => {
    await expect(page.getByTestId('chat-send')).toBeDisabled()
  })

  test('can type in chat input', async ({ page }) => {
    const input = page.getByTestId('chat-input')
    await input.fill('Hello Lucidia')
    await expect(input).toHaveValue('Hello Lucidia')
  })

  test('sends message and shows user message in chat', async ({ page }) => {
    await page.getByTestId('chat-input').fill('Hello from test')
    await page.getByTestId('chat-send').click()

    // User message should appear in chat
    await expect(page.getByTestId('chat-messages')).toContainText('Hello from test')
    await expect(page.getByTestId('chat-messages')).toContainText('You')
  })

  test('shows loading state while waiting for response', async ({ page }) => {
    await page.getByTestId('chat-input').fill('Test message')
    await page.getByTestId('chat-send').click()

    // Should show thinking indicator
    await expect(page.getByText('is thinking...')).toBeVisible()
  })

  test('displays agent info section', async ({ page }) => {
    await expect(page.getByText('Systems Lead')).toBeVisible()
    await expect(page.getByText('Infrastructure Team')).toBeVisible()
  })
})
