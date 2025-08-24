import { useCallback, useRef } from "react";
import { prefetchRoute, RouteKey } from "../lib/routeImporters";

// Usage: const { onHover, onFocus } = useRoutePrefetch('create'); attach to buttons/links
export function useRoutePrefetch(key: RouteKey) {
  const prefetched = useRef(false);

  const runPrefetch = useCallback(() => {
    if (!prefetched.current) {
      prefetched.current = true;
      // Fire and forget
      prefetchRoute(key).catch(() => {
        // ignore prefetch errors
        prefetched.current = false;
      });
    }
  }, [key]);

  // Handlers that can be attached to any interactive element
  const onMouseEnter = runPrefetch;
  const onFocus = runPrefetch;
  const onTouchStart = runPrefetch;

  return { onMouseEnter, onFocus, onTouchStart };
}
