import { SignIn, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

function LoginPage() {
  return (
    <>
      <SignedIn>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 100,
          }}
        >
          <h2>Welcome!</h2>
          <UserButton />
        </div>
      </SignedIn>
      <SignedOut>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 100,
          }}
        >
          <h2>Sign in to continue</h2>
          <SignIn />
        </div>
      </SignedOut>
    </>
  );
}

export default LoginPage;
