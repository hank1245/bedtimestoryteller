import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { setGetTokenFunction } from "../../services/client";

export default function AuthSetup({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    // Initialize the token function globally
    setGetTokenFunction(getToken);
  }, [getToken]);

  return <>{children}</>;
}
