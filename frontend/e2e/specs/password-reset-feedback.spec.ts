import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

test("shows the generic acknowledgement for a password reset request", async ({
  page,
}) => {
  await page.goto("/auth/forgot-password?type=customer");
  await page
    .getByPlaceholder("e-mail")
    .fill(`reset-${randomUUID()}@example.com`);
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(
    page.getByText(
      "If this email address is registered, you'll receive a password reset link. Please check your inbox.",
    ),
  ).toBeVisible();
});
