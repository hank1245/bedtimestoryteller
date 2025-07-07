import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "./components/ToastProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import MainPage from "./pages/MainPage";
import GenerationPage from "./pages/GenerationPage";
import StoryPage from "./pages/StoryPage";
import LoginPage from "./LoginPage";
import GlobalStyle from "./GlobalStyle";

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

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainPage onCreate={() => navigate("/create")} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <GenerationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/story"
        element={
          <ProtectedRoute>
            <StoryPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
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
        <BrowserRouter>
          <GlobalStyle />
          <AppRoutes />
          <ToastContainer />
        </BrowserRouter>
      </ClerkProvider>
    </QueryClientProvider>
  );
}
