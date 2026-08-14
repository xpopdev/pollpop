// app/api/polls/route.test.ts — route-level validation (mock store, isSupabaseConfigured=false)
import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

function resetMock() {
  (globalThis as unknown as Record<string, unknown>).__pollpop_mock = undefined;
  try {
    const file = path.join(process.cwd(), ".pollpop-mock.json");
    if (fs.existsSync(file)) fs.unlinkSync(file);
  } catch {}
}

function makeReq(body: unknown, extraHeaders: Record<string, string> = {}) {
  const url = "http://localhost:3000/api/polls";
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...extraHeaders },
    body: JSON.stringify(body),
  });
}

describe("POST /api/polls", () => {
  beforeEach(() => {
    resetMock();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it("succeeds with 2 opts (201) and returns poll with options", async () => {
    const { POST } = await import("./route");
    const req = makeReq(
      {
        title: "Which one?",
        context: "help me choose",
        category: "Test",
        options: [
          { label: "Option A", image_url: "https://picsum.photos/seed/route-a/600/600" },
          { label: "Option B", image_url: "https://picsum.photos/seed/route-b/600/600" },
        ],
        ref: null,
      },
      { "x-forwarded-for": "1.1.1.1" }
    );

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBeDefined();
    expect(data.url).toContain(`/p/${data.id}`);
    expect(data.poll.title).toBe("Which one?");
    expect(data.poll.options).toHaveLength(2);
    expect(data.poll.options[0].label).toBe("Option A");
  });

  it("fails with 1 opt (400) and with empty title", async () => {
    const { POST } = await import("./route");

    const req1 = makeReq({
      title: "Solo",
      options: [{ label: "Only", image_url: "https://picsum.photos/seed/solo/600/600" }],
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(400);
    const data1 = await res1.json();
    expect(data1.error).toMatch(/2.*4|options/i);

    const req2 = makeReq({
      title: "",
      options: [
        { label: "A", image_url: "https://picsum.photos/seed/a2/600/600" },
        { label: "B", image_url: "https://picsum.photos/seed/b2/600/600" },
      ],
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(400);
    const data2 = await res2.json();
    expect(data2.error).toMatch(/Title/i);
  });
});
