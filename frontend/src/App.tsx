import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { ToastContainer } from "./components/ToastProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthSetup from "./components/AuthSetup";
import GlobalStyle from "./GlobalStyle";
import RouteLoader from "./components/RouteLoader";
import { routeImporters } from "./lib/routeImporters";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (gcTime instead of cacheTime in v5)
    },
  },
});

const LandingPage = lazy(routeImporters.root);
const LoginPage = lazy(routeImporters.login);
const MainPage = lazy(routeImporters.app);
const GenerationPage = lazy(routeImporters.create);
const SettingsPage = lazy(routeImporters.settings);
const StoryPage = lazy(routeImporters.story);
const FolderPage = lazy(routeImporters.folder);

function HomeRoute() {
  return (
    <>
      <SignedIn>
        <Navigate to="/app" replace />
      </SignedIn>
      <SignedOut>
        <Suspense fallback={<RouteLoader text="Loading..." />}>
          <LandingPage />
        </Suspense>
      </SignedOut>
    </>
  );
}

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route
        path="/login"
        element={
          <Suspense fallback={<RouteLoader text="Opening login..." />}>
            <LoginPage />
          </Suspense>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteLoader text="Loading your stories..." />}>
              <MainPage onCreate={() => navigate("/app/create")} />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/create"
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteLoader text="Preparing studio..." />}>
              <GenerationPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/settings"
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteLoader text="Opening settings..." />}>
              <SettingsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/story"
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteLoader text="Loading story..." />}>
              <StoryPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/folder/:folderId"
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteLoader text="Opening folder..." />}>
              <FolderPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!clerkPublishableKey) {
    throw new Error("Missing Clerk Publishable Key");
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <AuthSetup>
          <BrowserRouter>
            <GlobalStyle />
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
            <ToastContainer />
          </BrowserRouter>
        </AuthSetup>
      </ClerkProvider>
    </QueryClientProvider>
  );
}
