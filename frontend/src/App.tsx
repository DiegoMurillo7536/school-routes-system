import { useEffect, useState } from "react";

/** Show whether the API and database are reachable, from one /health request. */
export default function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/health")
      .then((response) => response.json())
      .then((health) =>
        setMessage(
          health.database === "ok"
            ? "All systems connected"
            : "Database unavailable",
        ),
      )
      .catch(() => setMessage("API unreachable"));
  }, []);

  return <p>{message}</p>;
}
