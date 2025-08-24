import { useEffect, useState } from "react";
import { BREAKPOINTS } from "../constants/ui";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? window.innerWidth <= BREAKPOINTS.mobile
      : false
  );

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth <= BREAKPOINTS.mobile);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isMobile;
}
