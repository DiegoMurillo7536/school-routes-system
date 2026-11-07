import { Component } from "react";

/** The state of App: the status message shown to the developer. */
interface AppState {
  message: string;
}

/** Show whether the API and database are reachable, from one /health request. */
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

  /** Render the current status message. */
  render() {
    return <p>{this.state.message}</p>;
  }
}
