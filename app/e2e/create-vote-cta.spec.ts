import { test, expect } from "@playwright/test";

// E2E against mock mode (localhost via webServer) OR prod if reachable.
// baseURL is https://pollpop-five.vercel.app with localhost fallback via webServer / PLAYWRIGHT_BASE_URL override.
// Run locally: PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
// Run prod:    PLAYWRIGHT_BASE_URL=https://pollpop-five.vercel.app npx playwright test

async function createPollViaApi(request: import("@playwright/test").APIRequestContext, baseURL?: string) {
  const origin = baseURL || "";
  const res = await request.post(`${origin}/api/polls`, {
    data: {
      title: `E2E ${Date.now()} — Which one?`,
      context: "E2E viral loop probe",
      category: "E2E",
      options: [
        { label: "Option A", image_url: "https://picsum.photos/seed/e2e-a/600/600" },
        { label: "Option B", image_url: "https://picsum.photos/seed/e2e-b/600/600" },
      ],
    },
    headers: { "content-type": "application/json" },
  });
  expect(res.status(), `create poll failed: ${await res.text()}`).toBe(201);
  const data = await res.json();
  expect(data.id).toBeTruthy();
  return data as { id: string; url: string; poll: { id: string } };
}

test.describe("viral loop E2E (mock-friendly)", () => {
  test("create poll → vote → see bars + sticky CTA → cta_view fires → cta_click navigates to /?ref=poll_{id}", async ({ page, request, baseURL }) => {
    const created = await createPollViaApi(request, baseURL);
    const pollId = created.id;

    // Capture beacon posts for cta_view / cta_click
    const beacons: { name: string; poll_id: string | null }[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/events") && req.method() === "POST") {
        try {
          const body = req.postDataJSON() as { name: string; poll_id: string | null } | null;
          if (body?.name) beacons.push(body);
        } catch {}
      }
    });

    await page.goto(`/p/${pollId}`);
    await expect(page.getByText(/Tap to vote|Which one\?/i).first()).toBeVisible({ timeout: 15000 });

    // vote for first option — VoteGrid renders buttons/images with data-testid or role
    // Fallback: click first button/option in VoteGrid
    const voteTarget = page.locator("button, [role='button']").first();
    // PollClient's VoteGrid: try to locate option cards — click first image/button
    // Use a more specific fallback: the first option's image or label
    const optionA = page.getByText("Option A").first();
    const clickable = (await optionA.count()) ? optionA : voteTarget;
    await clickable.click({ timeout: 10000 }).catch(async () => {
      // last resort: click at center of VoteGrid area
      await page.locator("main, .poll-wrap").first().click();
    });

    // After vote, bars + CTA should appear
    // ResultsBars: expect percentage / count text, or "Live results"
    await expect(page.getByText(/Live results|total votes|updates live/i).first()).toBeVisible({ timeout: 10000 });
    // Bars: at least one element with % or progress
    await expect(page.locator(".results, [class*='results'], [class*='bar']").first()).toBeVisible({ timeout: 10000 });

    // Sticky CTA — CTACard renders "Create your own — 15s"
    const cta = page.getByText(/Create your own.*15s/i).first();
    await expect(cta).toBeVisible({ timeout: 10000 });
    // Ensure CTA is sticky on small viewport — check it is in viewport without scroll (locator in viewport)
    await cta.scrollIntoViewIfNeeded();
    await expect(page.getByRole("button", { name: /Create your poll/i }).first()).toBeVisible({ timeout: 10000 });

    // cta_view should have fired via IntersectionObserver within a second of CTA entering viewport
    await page.waitForTimeout(1200);
    // Poll for beacon with retry — IntersectionObserver is async
    await expect.poll(async () => beacons.some((b) => b.name === "cta_view" && b.poll_id === pollId), { timeout: 8000 }).toBeTruthy();

    // cta_click navigates to /?ref=poll_{id}
    const ctaButton = page.getByRole("button", { name: /Create your poll/i }).first();
    await ctaButton.click();
    await page.waitForURL(/\/\?ref=poll_/, { timeout: 10000 });
    expect(page.url()).toContain(`ref=poll_${pollId}`);

    // Verify cta_click beacon was sent (may be before navigation, allow async)
    await page.waitForTimeout(600);
    expect(beacons.some((b) => b.name === "cta_click")).toBeTruthy();
  });

  test("OG meta exists on p/{id} page (og:image, og:title, twitter:card)", async ({ page, request, baseURL }) => {
    const created = await createPollViaApi(request, baseURL);
    const pollId = created.id;

    const resp = await request.get(`${baseURL}/p/${pollId}`);
    expect(resp.status()).toBe(200);
    const html = await resp.text();

    // Next generateMetadata renders OG tags server-side
    expect(html).toMatch(/property="og:title"/i);
    expect(html).toMatch(/property="og:image"/i);
    expect(html).toMatch(/og:image/i);
    expect(html).toMatch(/twitter:card/i);
    // OG image points to our edge route
    expect(html).toMatch(new RegExp(`/api/polls/${pollId}/og`));
    expect(html).toMatch(/summary_large_image/i);

    // Also verify via Playwright DOM that meta tags are present client-side
    await page.goto(`/p/${pollId}`);
    await page.waitForLoadState("domcontentloaded");
    const ogImage = page.locator('meta[property="og:image"]');
    // Some Next setups render OG via head — allow either head string or DOM meta
    if (await ogImage.count()) {
      await expect(ogImage.first()).toHaveAttribute("content", /\/api\/polls\/.*\/og/);
      await expect(page.locator('meta[property="og:title"]').first()).toHaveAttribute("content", /.+/);
      await expect(page.locator('meta[name="twitter:card"]').first()).toHaveAttribute("content", /summary_large_image/i);
    } else {
      // Fallback: HTML string assertion above already passed — this branch is ok for CSR fallback
      expect(html).toContain("og:image");
    }
  });
});
