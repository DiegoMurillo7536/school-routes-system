import { act, render, screen, within } from "@testing-library/react";
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

  /** Stub fetch to answer as it does when the API and the database are connected. */
  static connectedApi() {
    return FetchStub.healthResponse(200, { api: "ok", database: "ok" });
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

/** Lets work started by the page, such as pending promises, finish before asserting. */
class PendingWork {
  /** Wait for queued promises and timers to run so any late update has been rendered. */
  static async settle() {
    await act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("S1 Introduce the system to a visitor without an account", () => {
  it("S1 shows the system name as the main heading and its description", async () => {
    // Arrange
    FetchStub.connectedApi();

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

describe("S2 List the four phases in order", () => {
  it.each([
    {
      number: 1,
      title: "Administradores de rutas",
      description: "Registra a las personas que gestionarán las rutas.",
    },
    {
      number: 2,
      title: "Estudiantes",
      description: "Registra a los estudiantes que usan las rutas.",
    },
    {
      number: 3,
      title: "Padres y acudientes o tutores",
      description:
        "Registra a los padres y acudientes o tutores de cada estudiante.",
    },
    {
      number: 4,
      title: "Ejecución de rutas",
      description:
        "Pon en marcha las rutas con los administradores, estudiantes, padres y acudientes o tutores registrados.",
    },
  ])(
    'S2 shows phase $number "$title" in position $number with its description and status "Planificada"',
    async ({ number, title, description }) => {
      // Arrange
      FetchStub.connectedApi();

      // Act
      render(<App />);

      // Assert
      const phaseList = await screen.findByRole("list");
      const phases = within(phaseList).getAllByRole("listitem");
      expect(phases).toHaveLength(4);
      const phase = phases[number - 1];
      expect(phase.textContent).toMatch(new RegExp(`\\b${number}\\b`));
      expect(within(phase).getByRole("heading", { name: title })).toBeTruthy();
      expect(within(phase).getByText(description)).toBeTruthy();
      expect(within(phase).getByText("Planificada")).toBeTruthy();
    },
  );
});

describe("S4 Do not show the system status message", () => {
  it("S4 does not show a message about the API or database connection when both are connected", async () => {
    // Arrange
    FetchStub.connectedApi();

    // Act
    render(<App />);
    await screen.findByRole("heading", {
      level: 1,
      name: "School Route System",
    });
    await PendingWork.settle();

    // Assert
    expect(screen.queryByText("All systems connected")).toBeNull();
    expect(screen.queryByText("Database unavailable")).toBeNull();
    expect(screen.queryByText("API unreachable")).toBeNull();
  });
});
