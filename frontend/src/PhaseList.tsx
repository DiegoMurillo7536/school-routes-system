import { Component } from "react";
import { PhaseCopy } from "./constants";

/** A phase shown on the index page. */
interface Phase {
  title: string;
  description: string;
  status: string;
}

/** The props of PhaseList: the phases to show, defaulting to the real ones. */
interface PhaseListProps {
  phases?: readonly Phase[];
}

/** Ordered list of the system phases, each with its number, title, description and status. */
export default class PhaseList extends Component<PhaseListProps> {
  /** Render one numbered card per phase, in the order they are defined. */
  render() {
    return (
      <ol className="mt-8 space-y-4">
        {(this.props.phases ?? PhaseCopy.PHASES).map((phase, index) => (
          <li
            key={phase.title}
            className="rounded border border-persian-blue-200 p-4"
          >
            <span className="text-sm text-persian-blue-600">{index + 1}.</span>
            <h2 className="text-xl text-persian-blue-700">{phase.title}</h2>
            <p className="mt-1">{phase.description}</p>
            <span className="mt-2 inline-block text-sm">
              {phase.status}
            </span>
          </li>
        ))}
      </ol>
    );
  }
}
