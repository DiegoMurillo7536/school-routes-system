import { Component } from "react";
import { PhaseCopy } from "./constants";

/** Ordered list of the system phases, each with its number, title, description and status. */
export default class PhaseList extends Component {
  /** Render one numbered card per phase, in the order they are defined. */
  render() {
    return (
      <ol className="mt-8 space-y-4">
        {PhaseCopy.PHASES.map((phase, index) => (
          <li
            key={phase.title}
            className="rounded border border-persian-blue-200 p-4"
          >
            <span className="text-sm text-persian-blue-600">{index + 1}.</span>
            <h2 className="text-xl text-persian-blue-700">{phase.title}</h2>
            <p className="mt-1">{phase.description}</p>
            <span className="mt-2 inline-block text-sm">
              {PhaseCopy.PLANNED_STATUS}
            </span>
          </li>
        ))}
      </ol>
    );
  }
}
