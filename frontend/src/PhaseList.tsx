import { Component } from "react";
import {
  PhaseCopy,
  PhaseStatusStyle,
  type PhaseStatusValue,
} from "./constants";

/** A phase shown on the index page. */
export interface Phase {
  title: string;
  description: string;
  status: PhaseStatusValue;
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
      <ol
        role="list"
        className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {(this.props.phases ?? PhaseCopy.PHASES).map((phase, index) => (
          <li
            key={phase.title}
            className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 motion-safe:transition motion-safe:duration-200 motion-safe:hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-persian-blue-600 font-display font-semibold text-white">
              {index + 1}
            </span>{" "}
            <h3 className="mt-5 text-xl font-semibold tracking-tight text-persian-blue-950">
              {phase.title}
            </h3>
            <p className="mt-2 flex-1 text-slate-600">{phase.description}</p>
            <span
              className={`mt-6 inline-flex self-start rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${PhaseStatusStyle.CLASSES[phase.status]}`}
            >
              {phase.status}
            </span>
          </li>
        ))}
      </ol>
    );
  }
}
