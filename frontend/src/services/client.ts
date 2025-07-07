import axios from "axios";

// 환경변수에서 API URL 가져오기
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// 백엔드 주소에 맞게 baseURL 설정
const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

// 토큰을 저장할 변수
let authToken: string | null = null;

// 토큰 설정 함수
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

// 요청 인터셉터: Bearer 토큰 자동 첨부
client.interceptors.request.use(
  async (config) => {
    // 토큰이 있으면 헤더에 첨부
    if (authToken) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${authToken}`;
      console.log(
        "Request with auth token:",
        authToken?.substring(0, 20) + "..."
      );
    } else {
      console.log("No auth token available for request");
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

// CRUD API 함수들
export async function fetchStories() {
  const res = await client.get("/stories");
  return res.data;
}

export async function fetchStoryById(id: number) {
  const res = await client.get(`/stories/${id}`);
  return res.data;
}

export async function createStory(title: string, story: string) {
  const res = await client.post("/stories", { title, story });
  return res.data;
}

export async function deleteStory(id: number) {
  const res = await client.delete(`/stories/${id}`);
  return res.data;
}

// (필요시) story 삭제/수정 함수도 추가 가능
export default client;
