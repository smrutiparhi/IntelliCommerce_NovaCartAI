import { expect, test } from '@playwright/test'

test('customer can register, add a product, checkout, pay, and open tracking', async ({ page }) => {
  const email = `playwright-${Date.now()}@novacart.local`
  await page.goto('/register')
  await page.getByLabel('Full name').fill('Playwright Customer')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill('NovaCart!2026')
  await page.getByLabel('Confirm password').fill('NovaCart!2026')
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL(/\/home$/)

  const addButton = page.getByRole('button', { name: /^Add .* to cart$/ }).first()
  await addButton.scrollIntoViewIfNeeded()
  await addButton.click({ force: true })
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Shopping cart' })).toBeVisible()
  await page.getByRole('link', { name: /Secure checkout/i }).click()

  await page.getByLabel('Full name').fill('Playwright Customer')
  await page.getByLabel('Mobile number').fill('9999999999')
  await page.getByLabel('PIN code').fill('751001')
  await page.getByLabel('Address').fill('1 Automated Test Avenue')
  await page.getByLabel('City').fill('Bhubaneswar')
  await page.getByLabel('State').fill('Odisha')
  await page.getByRole('button', { name: /Continue to payment/i }).click()
  await expect(page).toHaveURL(/\/payment$/)

  const pay = page.getByRole('button', { name: /Pay securely/i })
  await expect(pay).toBeEnabled({ timeout: 25_000 })
  await pay.click()
  const tracking = page.getByRole('link', { name: /Payment complete.*Track order/i })
  await expect(tracking).toBeVisible({ timeout: 25_000 })
  await tracking.click()
  await expect(page).toHaveURL(/\/orders\/.+/)
  await expect(page.getByText('CONFIRMED')).toBeVisible()
})
