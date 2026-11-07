/// <reference types="vite/client" />
import { render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

// A static import of a missing file aborts the whole test file before any test
// runs. import.meta.glob yields an empty map instead, so a missing component is
// reported as a failed assertion in each test below.
const appModules = import.meta.glob<{ default: ComponentType }>("./App.tsx");

async function loadApp(): Promise<ComponentType> {
  const loadAppModule = appModules["./App.tsx"];
  expect(
    loadAppModule,
    "src/App.tsx must exist and default-export the status page",
  ).toBeDefined();
  const { default: App } = await loadAppModule();
  return App;
}

function stubHealthResponse(status: number, body: unknown) {
  const fetchStub = vi.fn(
    async (_input: RequestInfo | URL) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  );
  vi.stubGlobal("fetch", fetchStub);
  return fetchStub;
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
      const App = await loadApp();

      // Act
      render(<App />);

      // Assert
      expect(await screen.findByText(message)).toBeTruthy();
      expect(String(fetchStub.mock.calls[0][0])).toMatch(/\/health$/);
    },
  );
});
