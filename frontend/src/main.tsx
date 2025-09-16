import { createRoot } from "react-dom/client";
import App from "./App";
import { initSentry } from "./sentry";
import { initializeAnalytics } from "./services/analytics";

initSentry();
initializeAnalytics();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);
