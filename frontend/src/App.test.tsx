import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

function stubFetch(
  implementation: (input: RequestInfo | URL) => Promise<Response>,
) {
  const fetchStub = vi.fn(implementation);
  vi.stubGlobal("fetch", fetchStub);
  return fetchStub;
}

function stubHealthResponse(status: number, body: unknown) {
  return stubFetch(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  );
}

function stubUnreachableApi() {
  return stubFetch(async () => {
    throw new TypeError("Failed to fetch");
  });
}

describe("S4 Show the system status to the developer", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    {
      healthResult: "healthy",
      status: 200,
      body: { api: "ok", database: "ok" },
      message: "All systems connected",
    },
    {
      healthResult: "database unavailable",
      status: 503,
      body: { api: "ok", database: "unavailable" },
      message: "Database unavailable",
    },
  ])(
    'S4.1 shows "$message" when the health result is $healthResult',
    async ({ status, body, message }) => {
      // Arrange
      const fetchStub = stubHealthResponse(status, body);

      // Act
      render(<App />);

      // Assert
      expect(await screen.findByText(message)).toBeTruthy();
      expect(String(fetchStub.mock.calls[0][0])).toMatch(/\/health$/);
    },
  );

  it('S4.2 shows "API unreachable" when the health check cannot reach the API', async () => {
    // Arrange
    const fetchStub = stubUnreachableApi();

    // Act
    render(<App />);

    // Assert
    expect(await screen.findByText("API unreachable")).toBeTruthy();
    expect(String(fetchStub.mock.calls[0][0])).toMatch(/\/health$/);
  });
});
