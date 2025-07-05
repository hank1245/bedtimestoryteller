import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import ProtectedRoute from "./components/ProtectedRoute";
import MainPage from "./pages/MainPage";
import GenerationPage from "./pages/GenerationPage";
import StoryPage from "./pages/StoryPage";
import LoginPage from "./LoginPage";
import GlobalStyle from "./GlobalStyle";

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
  return (
    <ClerkProvider
      publishableKey={
        "pk_test_cHJvZm91bmQtYm9hci05My5jbGVyay5hY2NvdW50cy5kZXYk"
      }
    >
      <BrowserRouter>
        <GlobalStyle />
        <AppRoutes />
      </BrowserRouter>
    </ClerkProvider>
  );
}
