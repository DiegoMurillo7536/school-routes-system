import { useEffect, useState } from "react";

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
      );
  }, []);

  return <p>{message}</p>;
}
