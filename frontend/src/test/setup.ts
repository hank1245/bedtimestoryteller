import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Clean up DOM after each test
afterEach(() => {
  cleanup();
});

// Provide minimal env for App
if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  (import.meta as any).env = {
    ...(import.meta as any).env,
    VITE_CLERK_PUBLISHABLE_KEY: "test_pk",
  };
}

// Mock window.scrollTo to avoid jsdom errors
// @ts-ignore
window.scrollTo = window.scrollTo || vi.fn();
