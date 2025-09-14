import { SignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

function LoginPage() {
  return (
    <>
      <SignedIn>
        <Navigate to="/app" replace />
      </SignedIn>
      <SignedOut>
        <main
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 100,
          }}
          aria-label="Login page"
        >
          <h2>Sign in to continue</h2>
          <SignIn />
        </main>
      </SignedOut>
    </>
  );
}

export default LoginPage;
