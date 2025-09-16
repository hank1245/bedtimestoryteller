import { MEASUREMENT_ID } from "@/constants/analytics";

let analyticsInitialized = false;

const loadGoogleAnalytics = () => {
  if (document.getElementById("ga4-script")) {
    return;
  }

  const scriptTag = document.createElement("script");
  scriptTag.async = true;
  scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  scriptTag.id = "ga4-script";
  document.head.appendChild(scriptTag);
};

const configureGtag = () => {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, { send_page_view: false });
};

export const initializeAnalytics = () => {
  if (analyticsInitialized) {
    return;
  }

  loadGoogleAnalytics();
  configureGtag();
  analyticsInitialized = true;
};

export const trackPageView = (url: string) => {
  if (!analyticsInitialized || !window.gtag) return;

  window.gtag("event", "page_view", {
    page_path: url,
  });
};

export const trackCustomEvent = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  if (!analyticsInitialized || !window.gtag) return;

  window.gtag("event", eventName, params);
};

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}
