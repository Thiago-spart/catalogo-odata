import { expect, test } from '@playwright/test';

// Runs against the real Northwind service: proves the OData contract end to end.
test('search, open a product and come back with the filters kept', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/77 produtos/)).toBeVisible();

  await page.getByRole('searchbox', { name: 'Buscar produto' }).fill('chef');
  await expect(page).toHaveURL(/q=chef/);
  await expect(page.getByText(/^2 produtos/)).toBeVisible();
  await expect(page.getByRole('region', { name: 'Requisição OData' })).toContainText("contains(tolower(ProductName),'chef')");

  await page.getByRole('link', { name: /Chef Anton's Cajun Seasoning/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: "Chef Anton's Cajun Seasoning" })).toBeVisible();
  await expect(page.getByText('New Orleans Cajun Delights')).toBeVisible();

  await page.getByRole('link', { name: '← Voltar aos produtos' }).click();
  await expect(page.getByRole('searchbox', { name: 'Buscar produto' })).toHaveValue('chef');
});

test('pages through results with a stable order', async ({ page }) => {
  await page.goto('/?sort=%22price-desc%22');
  const first = page.getByRole('list').first().getByRole('link').first();
  await expect(first).toContainText('Côte de Blaye');
  await page.getByRole('link', { name: 'Próxima' }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByText(/página 2 de 8/)).toBeVisible();
});
