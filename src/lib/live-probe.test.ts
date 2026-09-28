import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { probe } from "./live-probe.ts";

const realFetch = globalThis.fetch;

function serve(html: string) {
  globalThis.fetch = (async (input: string | URL | Request) =>
    Object.defineProperty(new Response(html, { status: 200 }), "url", {
      value: String(input),
    })) as typeof fetch;
}

describe("probe", () => {
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it("does not call the third-party potion-eta.vercel.app up", async () => {
    const { status } = await probe("https://potion-eta.vercel.app", "Potion");
    assert.ok(status === "unknown" || status === "down", `got ${status}`);
  });

  it("reports a host outside Eric's Vercel/Netlify accounts as unknown", async () => {
    serve("<html><head><title>Potion</title></head></html>");
    const { status } = await probe("https://potion-eta.vercel.app", "Potion");
    assert.equal(status, "unknown");
  });

  it("needs the exact title, not a title that merely contains the name", async () => {
    serve("<html><head><title>POTION Dashboard</title></head></html>");
    const { status } = await probe("https://font-manager-eta.vercel.app", "Potion");
    assert.equal(status, "down");
  });

  it("passes an owned host whose title is exactly the app name", async () => {
    serve('<html><head><meta charset="utf-8"><title>Font Manager</title></head></html>');
    const { status } = await probe("https://font-manager-eta.vercel.app", "Font Manager");
    assert.equal(status, "up");
  });

  it("does not treat a -eect13.vercel.app name as owned", async () => {
    serve("<html><head><title>Atrium</title></head></html>");
    const { status } = await probe("https://x-eect13.vercel.app", "Atrium");
    assert.equal(status, "unknown");
  });
});
