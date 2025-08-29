import { prefetchRoute, routeImporters } from "@/lib/routeImporters";

// mock dynamic imports to resolved promises
vi.mock("@/pages/LandingPage", () => ({ default: () => null }));
vi.mock("@/pages/LoginPage", () => ({ default: () => null }));

describe("routeImporters", () => {
  it("prefetchRoute caches promises per key", async () => {
    const p1 = prefetchRoute("root");
    const p2 = prefetchRoute("root");
    expect(p1).toBe(p2);

    // Ensure the importer is callable for another key
    const p3 = prefetchRoute("login");
    expect(p3).not.toBe(p1);
  });

  it("has importers for all keys", () => {
    expect(Object.keys(routeImporters)).toEqual(
      expect.arrayContaining([
        "root",
        "login",
        "app",
        "create",
        "settings",
        "story",
        "folder",
      ])
    );
  });
});
