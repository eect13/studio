import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { resetProjectRefreshState, runRefresh } from "./projects-live.ts";

const realFetch = globalThis.fetch;

describe("runRefresh", () => {
  afterEach(() => {
    resetProjectRefreshState();
    globalThis.fetch = realFetch;
    delete process.env.GITHUB_TOKEN;
  });

  it("keeps the Atrium seed after a 403 and skips the network for 60s", async () => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      return new Response("rate limited", { status: 403 });
    }) as typeof fetch;

    const first = await runRefresh();
    const atrium = first.cards.find((card) => card.id === "atrium");
    assert.equal(atrium?.version, "1.2.36");
    const used = calls;
    assert.ok(used > 0);

    const second = await runRefresh();
    assert.equal(second.cards.find((card) => card.id === "atrium")?.version, "1.2.36");
    assert.equal(calls, used);
  });
});
