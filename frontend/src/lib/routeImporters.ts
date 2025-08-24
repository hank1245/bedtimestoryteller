// Central registry of route component dynamic imports for lazy loading and prefetching.
// Keeping paths here avoids duplication and enables consistent chunking.

export const routeImporters = {
  root: () => import("../pages/LandingPage"),
  login: () => import("../pages/LoginPage"),
  app: () => import("../pages/MainPage"),
  create: () => import("../pages/GenerationPage"),
  settings: () => import("../pages/SettingsPage"),
  story: () => import("../pages/StoryPage"),
  folder: () => import("../pages/FolderPage"),
};

// Simple cache so repeated prefetch calls don't refetch
const prefetchCache = new Map<string, Promise<unknown>>();

export function prefetchRoute(key: keyof typeof routeImporters) {
  if (!prefetchCache.has(key)) {
    prefetchCache.set(key, routeImporters[key]());
  }
  return prefetchCache.get(key)!;
}

export type RouteKey = keyof typeof routeImporters;
