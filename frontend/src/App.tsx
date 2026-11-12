import { Component } from "react";
import { IndexPageCopy } from "./constants";

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

  /** Render the system name, its description and the current status message. */
  render() {
    return (
      <main className="mx-auto max-w-2xl p-8 font-sans">
        <h1 className="text-4xl text-persian-blue-700">
          {IndexPageCopy.SYSTEM_NAME}
        </h1>
        <p className="mt-4">{IndexPageCopy.DESCRIPTION}</p>
        <p className="mt-4">{this.state.message}</p>
      </main>
    );
  }
}
