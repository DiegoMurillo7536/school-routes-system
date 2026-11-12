import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PhaseList from "./PhaseList";

/** Builds phase data for PhaseList where phase 1 has a chosen status. */
class PhaseFixture {
  static readonly STATUSES = ["Planificada", "En progreso", "Disponible"];

  /** Return four phases where phase 1 has the given status and the rest are "Planificada". */
  static withFirstStatus(status: string) {
    return [
      { title: "Fase uno", description: "Descripción uno.", status },
      {
        title: "Fase dos",
        description: "Descripción dos.",
        status: "Planificada",
      },
      {
        title: "Fase tres",
        description: "Descripción tres.",
        status: "Planificada",
      },
      {
        title: "Fase cuatro",
        description: "Descripción cuatro.",
        status: "Planificada",
      },
    ];
  }
}

describe("S3 Show the status a phase has been given", () => {
  it.each([
    { status: "Planificada" },
    { status: "En progreso" },
    { status: "Disponible" },
  ])('S3 phase 1 shows the status "$status"', ({ status }) => {
    // Arrange
    const phases = PhaseFixture.withFirstStatus(status);

    // Act
    render(<PhaseList phases={phases} />);

    // Assert
    const firstPhase = within(screen.getByRole("list")).getAllByRole(
      "listitem",
    )[0];
    expect(within(firstPhase).getByText(status)).toBeTruthy();
    for (const otherStatus of PhaseFixture.STATUSES) {
      if (otherStatus !== status) {
        expect(within(firstPhase).queryByText(otherStatus)).toBeNull();
      }
    }
  });
});
