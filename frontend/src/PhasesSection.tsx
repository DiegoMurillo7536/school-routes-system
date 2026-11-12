import { Component } from "react";
import { IndexPageCopy } from "./constants";
import PhaseList from "./PhaseList";

/** Section that introduces the phases and shows them as cards. */
export default class PhasesSection extends Component {
  /** Render the section heading, its intro line and the phase cards. */
  render() {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <h2 className="text-3xl font-semibold tracking-tight text-persian-blue-950 md:text-4xl">
          {IndexPageCopy.PHASES_HEADING}
        </h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          {IndexPageCopy.PHASES_INTRO}
        </p>
        <PhaseList />
      </section>
    );
  }
}
