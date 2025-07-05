import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import ProtectedRoute from "./components/ProtectedRoute";
import StoryListPage from "./pages/StoryListPage";
import MainPage from "./pages/MainPage";
import LoginPage from "./LoginPage";
import GlobalStyle from "./GlobalStyle";

export default function App() {
  return (
    <ClerkProvider
      publishableKey={
        "pk_test_cHJvZm91bmQtYm9hci05My5jbGVyay5hY2NvdW50cy5kZXYk"
      }
    >
      <BrowserRouter>
        <GlobalStyle />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <StoryListPage
                  onCreate={() => window.location.replace("/create")}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}
