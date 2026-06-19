import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@fabrio.com'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'admin123'

test.describe('Admin panel', () => {
  test('admin can access dashboard', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByLabel('Email').fill(ADMIN_EMAIL)
    await page.getByLabel('Password').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: /Sign In/i }).click()
    await expect(page).toHaveURL(/\/products/, { timeout: 15_000 })

    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: /Dashboard Overview/i })).toBeVisible()
  })

  test('admin can open new product form', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByLabel('Email').fill(ADMIN_EMAIL)
    await page.getByLabel('Password').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: /Sign In/i }).click()
    await expect(page).toHaveURL(/\/products/, { timeout: 15_000 })

    await page.goto('/admin/products/new')
    await expect(page.getByRole('heading', { name: /Add Product/i })).toBeVisible()
    await expect(page.getByLabel(/Product Name/i)).toBeVisible()
  })
})