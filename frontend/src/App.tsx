import { Component } from "react";
import { IndexPageCopy } from "./constants";
import PhaseList from "./PhaseList";

/** Index page: introduce the system and list its phases. */
export default class App extends Component {
  /** Render the system name, its description and the phases. */
  render() {
    return (
      <main className="mx-auto max-w-2xl p-8 font-sans">
        <h1 className="text-4xl text-persian-blue-700">
          {IndexPageCopy.SYSTEM_NAME}
        </h1>
        <p className="mt-4">{IndexPageCopy.DESCRIPTION}</p>
        <PhaseList />
      </main>
    );
  }
}
