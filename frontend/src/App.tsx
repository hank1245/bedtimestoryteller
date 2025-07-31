import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "./components/ToastProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthSetup from "./components/AuthSetup";
import MainPage from "./pages/MainPage";
import GenerationPage from "./pages/GenerationPage";
import StoryPage from "./pages/StoryPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import FolderPage from "./pages/FolderPage";
import GlobalStyle from "./GlobalStyle";
import LandingPage from "./pages/LandingPage";

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

function HomeRoute() {
  return (
    <>
      <SignedIn>
        <Navigate to="/app" replace />
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </>
  );
}

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <MainPage onCreate={() => navigate("/app/create")} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/create"
        element={
          <ProtectedRoute>
            <GenerationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/story"
        element={
          <ProtectedRoute>
            <StoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/folder/:folderId"
        element={
          <ProtectedRoute>
            <FolderPage />
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
            <AppRoutes />
            <ToastContainer />
          </BrowserRouter>
        </AuthSetup>
      </ClerkProvider>
    </QueryClientProvider>
  );
}
