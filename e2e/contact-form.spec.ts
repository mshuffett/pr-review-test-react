import { test, expect } from "@playwright/test";

test.describe("Contact Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("renders the contact form", async ({ page }) => {
    await page.screenshot({ path: "screenshots/contact-form-initial.png", fullPage: true });
    await expect(page.locator("h2", { hasText: "Contact Us" })).toBeVisible();
    await expect(page.locator('label[for="contact-name"]')).toBeVisible();
    await expect(page.locator('label[for="contact-email"]')).toBeVisible();
    await expect(page.locator('label[for="contact-message"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("shows validation errors when submitting empty form", async ({ page }) => {
    await page.click('button[type="submit"]');
    await page.screenshot({ path: "screenshots/contact-form-validation-errors.png", fullPage: true });
    await expect(page.locator("text=Name is required")).toBeVisible();
    await expect(page.locator("text=Email is required")).toBeVisible();
    await expect(page.locator("text=Message is required")).toBeVisible();
  });

  test("shows email validation error for invalid email", async ({ page }) => {
    await page.fill("#contact-name", "John Doe");
    await page.fill("#contact-email", "invalid");
    await page.fill("#contact-message", "Hello");
    // Use dispatch to bypass native email validation
    await page.locator('form[aria-label="Contact form"]').evaluate((form) => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    await page.screenshot({ path: "screenshots/contact-form-email-error.png", fullPage: true });
    await expect(page.locator("text=Please enter a valid email address")).toBeVisible();
  });

  test("submits form successfully with valid data", async ({ page }) => {
    // Mock the API endpoint
    await page.route("/api/contact", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, id: "test-123" }),
      });
    });

    await page.fill("#contact-name", "Jane Smith");
    await page.fill("#contact-email", "jane@example.com");
    await page.fill("#contact-message", "Hello, this is a test message!");
    await page.screenshot({ path: "screenshots/contact-form-filled.png", fullPage: true });

    await page.click('button[type="submit"]');
    await page.waitForSelector("text=Thanks for reaching out!");
    await page.screenshot({ path: "screenshots/contact-form-submitted.png", fullPage: true });

    await expect(page.locator("text=Thanks for reaching out!")).toBeVisible();
    await expect(page.locator('[data-testid="submitted-message"]')).toHaveText("Hello, this is a test message!");
  });

  test("renders submitted message as text not HTML (XSS prevention)", async ({ page }) => {
    await page.route("/api/contact", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, id: "test-456" }),
      });
    });

    await page.fill("#contact-name", "Attacker");
    await page.fill("#contact-email", "attacker@example.com");
    await page.fill("#contact-message", '<img src=x onerror="alert(1)">');

    // Submit via dispatchEvent to bypass native email validation
    await page.click('button[type="submit"]');
    await page.waitForSelector("text=Thanks for reaching out!");
    await page.screenshot({ path: "screenshots/contact-form-xss-safe.png", fullPage: true });

    // Verify the message is rendered as text, not as HTML
    const msgEl = page.locator('[data-testid="submitted-message"]');
    const innerHTML = await msgEl.innerHTML();
    // The < and > should be escaped, not rendered as HTML tags
    expect(innerHTML).not.toContain("<img");
    expect(innerHTML).toContain("&lt;img");
  });

  test("shows error when API call fails", async ({ page }) => {
    await page.route("/api/contact", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    await page.fill("#contact-name", "John");
    await page.fill("#contact-email", "john@example.com");
    await page.fill("#contact-message", "Test");
    await page.click('button[type="submit"]');

    await page.waitForSelector('[role="alert"]');
    await page.screenshot({ path: "screenshots/contact-form-api-error.png", fullPage: true });
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test("has proper accessibility attributes", async ({ page }) => {
    // Check aria-required on all fields
    await expect(page.locator("#contact-name")).toHaveAttribute("aria-required", "true");
    await expect(page.locator("#contact-email")).toHaveAttribute("aria-required", "true");
    await expect(page.locator("#contact-message")).toHaveAttribute("aria-required", "true");

    // Check email input type
    await expect(page.locator("#contact-email")).toHaveAttribute("type", "email");

    // Check label associations
    await expect(page.locator('label[for="contact-name"]')).toBeVisible();
    await expect(page.locator('label[for="contact-email"]')).toBeVisible();
    await expect(page.locator('label[for="contact-message"]')).toBeVisible();
  });
});
