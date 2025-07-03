import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

// 백엔드 주소에 맞게 baseURL 설정 (예: http://localhost:4000/api)
const client = axios.create({
  baseURL: "http://localhost:4000/api",
  timeout: 10000,
});

// 요청 인터셉터: Bearer 토큰 자동 첨부
client.interceptors.request.use(
  async (config) => {
    // 토큰이 있으면 헤더에 첨부
    if (typeof window !== "undefined" && window.__clerkAuthToken) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${window.__clerkAuthToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 에러 로깅 및 공통 처리
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("No response from API:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Clerk 토큰을 window에 저장하는 helper (App 루트에서 사용)
export function useClerkApiToken() {
  const { getToken } = useAuth();

  async function setToken() {
    try {
      const token = await getToken();
      if (token) {
        window.__clerkAuthToken = token;
        window.__clerkGetToken = getToken;
      }
    } catch (error) {
      console.error("Failed to set Clerk token:", error);
    }
  }

  return setToken;
}

// CRUD API 함수들
export async function fetchStories() {
  const res = await client.get("/stories");
  return res.data;
}

export async function createStory(story: string) {
  const res = await client.post("/stories", { story });
  return res.data;
}

// (필요시) story 삭제/수정 함수도 추가 가능
export default client;
