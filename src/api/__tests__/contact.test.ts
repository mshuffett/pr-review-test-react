import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { submitContact } from "../contact";

describe("submitContact", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("sends POST request with correct payload", async () => {
    const mockResponse = { success: true, id: "abc123" };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await submitContact({
      name: "John",
      email: "john@example.com",
      message: "Hello",
    });

    expect(fetch).toHaveBeenCalledWith("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "John", email: "john@example.com", message: "Hello" }),
    });
    expect(result).toEqual(mockResponse);
  });

  it("throws error when response is not ok", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "server error" }),
    });

    await expect(
      submitContact({ name: "John", email: "john@example.com", message: "Hello" }),
    ).rejects.toThrow("Contact submission failed (500)");
  });

  it("throws error when fetch fails", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));

    await expect(
      submitContact({ name: "John", email: "john@example.com", message: "Hello" }),
    ).rejects.toThrow("Network failure");
  });

  it("does not log sensitive user data to console", async () => {
    const consoleSpy = vi.spyOn(console, "log");
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await submitContact({
      name: "John",
      email: "john@example.com",
      message: "Secret message",
    });

    // Verify no call contains the user payload
    for (const call of consoleSpy.mock.calls) {
      const logStr = call.join(" ");
      expect(logStr).not.toContain("john@example.com");
      expect(logStr).not.toContain("Secret message");
    }
  });
});
