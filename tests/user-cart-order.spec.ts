import { test, expect } from '@playwright/test';

test('Validate creation of user, add to cart and order history', async ({ page }) => {
  const timestamp = Date.now();
  const fullName = `Test User ${timestamp}`;
  const email = `test.user.${timestamp}@example.com`;
  const password = 'Password123!';

  await page.goto('/login.html');

  await page.getByRole('link', { name: 'Create one' }).click();

  await page.fill('[data-testid="reg-name"]', fullName);
  await page.fill('[data-testid="reg-email"]', email);
  await page.fill('[data-testid="reg-password"]', password);

  const registerButton = page.getByTestId('reg-btn');
  await registerButton.click();

  await expect(registerButton).toHaveText('Creating account...');
  await expect(registerButton).toBeDisabled();

  await expect(registerButton).toHaveText('Account Created');
  await expect(registerButton).toBeDisabled();

  const successAlert = page.getByTestId('reg-success-msg');
  await expect(successAlert).toBeVisible();
  await expect(successAlert).toHaveText('Account created! Redirecting you to the shop...');

  await page.waitForURL('**/index.html', { timeout: 10000 });

  const wirelessCard = page.locator('.product-card', { hasText: 'Wireless Headphones' });
  const addToCartButton = wirelessCard.getByRole('button', { name: /Add to cart/i });
  await addToCartButton.click();

  const addToast = page.locator('.toast', { hasText: 'Wireless Headphones added to cart' });
  await expect(addToast).toBeVisible();

  await page.getByRole('link', { name: /Cart/i }).click();

  await page.getByRole('button', { name: 'Checkout' }).click();

  await page.fill('[data-testid="ship-name"]', fullName);
  await page.fill('[data-testid="ship-address"]', '123 Test Lane\nTest City, TC 12345');

  const placeOrderButton = page.getByTestId('place-order-btn');
  await placeOrderButton.click();

  await expect(placeOrderButton).toHaveText('Placing order...');

  const orderToast = page.locator('.toast', { hasText: 'Order placed! Thank you.' });
  await expect(orderToast).toBeVisible();

  await page.waitForURL('**/orders.html', { timeout: 10000 });

  await expect(page.getByText('Wireless Headphones')).toBeVisible();
});
