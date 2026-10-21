import { describe, expect, it } from "vitest";
import { canonicalRedirect } from "./canonical-host";

describe("canonicalRedirect", () => {
  it("sends www.bannertimer.com to the same path and query on bannertimer.com", () => {
    const res = canonicalRedirect(new Request("https://www.bannertimer.com/hsr/4.6/?x=1"));
    expect(res?.status).toBe(301);
    expect(res?.headers.get("location")).toBe("https://bannertimer.com/hsr/4.6/?x=1");
  });

  it("leaves every other host alone", () => {
    expect(canonicalRedirect(new Request("https://bannertimer.com/hsr/"))).toBeNull();
    expect(canonicalRedirect(new Request("http://127.0.0.1:3100/hsr/"))).toBeNull();
  });
});
