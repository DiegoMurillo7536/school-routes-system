import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

/** Replaces global fetch with spies that answer as each scenario needs. */
class FetchStub {
  /** Replace global fetch with a spy that runs the given implementation. */
  private static install(
    implementation: (input: RequestInfo | URL) => Promise<Response>,
  ) {
    const fetchStub = vi.fn(implementation);
    vi.stubGlobal("fetch", fetchStub);
    return fetchStub;
  }

  /** Stub fetch to answer with the given status and JSON body. */
  static healthResponse(status: number, body: unknown) {
    /** Answer with the given status and JSON body. */
    const answer = async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    return FetchStub.install(answer);
  }

  /** Stub fetch to reject as it does when the API cannot be reached. */
  static unreachableApi() {
    /** Reject with the error fetch raises for an unreachable server. */
    const reject = async () => {
      throw new TypeError("Failed to fetch");
    };
    return FetchStub.install(reject);
  }
}

describe("S1 Introduce the system to a visitor without an account", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("S1 shows the system name as the main heading and its description", async () => {
    // Arrange
    FetchStub.healthResponse(200, { api: "ok", database: "ok" });

    // Act
    render(<App />);

    // Assert
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "School Route System",
      }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Un sistema para organizar las rutas escolares y mantener informadas a las familias.",
      ),
    ).toBeTruthy();
  });
});

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
      const fetchStub = FetchStub.healthResponse(status, body);

      // Act
      render(<App />);

      // Assert
      expect(await screen.findByText(message)).toBeTruthy();
      expect(String(fetchStub.mock.calls[0][0])).toMatch(/\/health$/);
    },
  );

  it('S4.2 shows "API unreachable" when the health check cannot reach the API', async () => {
    // Arrange
    const fetchStub = FetchStub.unreachableApi();

    // Act
    render(<App />);

    // Assert
    expect(await screen.findByText("API unreachable")).toBeTruthy();
    expect(String(fetchStub.mock.calls[0][0])).toMatch(/\/health$/);
  });
});
