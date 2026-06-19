import { test, expect } from '@playwright/test'

const CUSTOMER_EMAIL = process.env.E2E_CUSTOMER_EMAIL || 'john@company.com'
const CUSTOMER_PASSWORD = process.env.E2E_CUSTOMER_PASSWORD || 'customer'

test.describe('E-commerce flow', () => {
  test('homepage loads and links to products', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Building Your Safety/i })).toBeVisible()
    await page.getByRole('link', { name: /Shop Now/i }).click()
    await expect(page).toHaveURL(/\/products/)
    await expect(page.getByRole('heading', { name: /Industrial Products/i })).toBeVisible()
  })

  test('customer can login', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByLabel('Email').fill(CUSTOMER_EMAIL)
    await page.getByLabel('Password').fill(CUSTOMER_PASSWORD)
    await page.getByRole('button', { name: /Sign In/i }).click()
    await expect(page).toHaveURL(/\/products/, { timeout: 15_000 })
  })

  test('add product to cart and view cart', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByLabel('Email').fill(CUSTOMER_EMAIL)
    await page.getByLabel('Password').fill(CUSTOMER_PASSWORD)
    await page.getByRole('button', { name: /Sign In/i }).click()
    await expect(page).toHaveURL(/\/products/, { timeout: 15_000 })

    await page.goto('/products')
    const addButton = page.getByRole('button', { name: /^Add$/i }).first()
    await addButton.click()

    await page.goto('/cart')
    await expect(page.getByRole('heading', { name: /Shopping Cart/i })).toBeVisible()
    await expect(page.getByText(/Proceed to Checkout/i)).toBeVisible()
  })

  test('checkout page requires shipping form', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByLabel('Email').fill(CUSTOMER_EMAIL)
    await page.getByLabel('Password').fill(CUSTOMER_PASSWORD)
    await page.getByRole('button', { name: /Sign In/i }).click()
    await expect(page).toHaveURL(/\/products/, { timeout: 15_000 })

    await page.goto('/products')
    await page.getByRole('button', { name: /^Add$/i }).first().click()

    await page.goto('/cart')
    await page.getByRole('link', { name: /Proceed to Checkout/i }).click()
    await expect(page).toHaveURL(/\/checkout/)

    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel(/Street Address/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Place Order & Pay with Mobile Money/i })).toBeVisible()
  })

  test('unauthenticated user is redirected from checkout', async ({ page }) => {
    await page.goto('/checkout')
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})