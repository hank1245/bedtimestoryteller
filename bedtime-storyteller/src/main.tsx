import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import ProtectedRoute from "./components/ProtectedRoute";
import StoryListPage from "./components/StoryListPage";
import App from "./App";
import LoginPage from "./LoginPage";
import GlobalStyle from "./GlobalStyle";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

function MainRouter() {
  const [stories, setStories] = useState<string[]>([]);

  // App에서 새 스토리 생성 시 호출
  const handleCreateStory = (story?: string) => {
    if (story) setStories((prev) => [...prev, story]);
  };

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
                  stories={stories}
                  onCreate={() => window.location.replace("/create")}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <App onStoryCreated={handleCreateStory} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <MainRouter />
  </StrictMode>
);
