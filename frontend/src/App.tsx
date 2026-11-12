import { Component } from "react";
import { IndexPageCopy, PhaseCopy } from "./constants";

/** The state of App: the status message shown to the developer. */
interface AppState {
  message: string;
}

/** Index page: introduce the system and show the /health status message. */
export default class App extends Component<object, AppState> {
  state: AppState = { message: "" };

  /** Request /health once and turn the result into the status message. */
  async componentDidMount() {
    try {
      const response = await fetch("/health");
      const health = await response.json();
      this.setState({
        message:
          health.database === "ok"
            ? "All systems connected"
            : "Database unavailable",
      });
    } catch {
      this.setState({ message: "API unreachable" });
    }
  }

  /** Render the system name, its description, the phases and the current status message. */
  render() {
    return (
      <main className="mx-auto max-w-2xl p-8 font-sans">
        <h1 className="text-4xl text-persian-blue-700">
          {IndexPageCopy.SYSTEM_NAME}
        </h1>
        <p className="mt-4">{IndexPageCopy.DESCRIPTION}</p>
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
        <p className="mt-4">{this.state.message}</p>
      </main>
    );
  }
}
