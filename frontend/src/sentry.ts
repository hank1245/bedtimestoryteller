import * as Sentry from "@sentry/react";
import { captureConsoleIntegration } from "@sentry/integrations";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { useEffect } from "react";

let isInitialized = false;

export const initSentry = () => {
  if (isInitialized || Sentry.isInitialized()) {
    return;
  }

  Sentry.init({
    dsn: "https://30e009e7fe28e59445da0affb7df0bf8@o4510029446971392.ingest.de.sentry.io/4510029451886672",
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration(),
      captureConsoleIntegration({ levels: ["error", "warn"] }),
    ],
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
  });

  isInitialized = true;
};
