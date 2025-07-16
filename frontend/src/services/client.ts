import axios from "axios";

// 환경변수에서 API URL 가져오기
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

console.log("🌐 API Base URL:", API_BASE_URL);
console.log("🔧 Environment:", import.meta.env.MODE);

// 백엔드 주소에 맞게 baseURL 설정
const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000, // 프로덕션에서 더 긴 타임아웃
});

// 토큰을 저장할 변수
let authToken: string | null = null;
let getTokenFunction: (() => Promise<string | null>) | null = null;

// 토큰 설정 함수
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

// 토큰 획득 함수 설정
export const setGetTokenFunction = (getToken: () => Promise<string | null>) => {
  getTokenFunction = getToken;
};

// 요청 인터셉터: Bearer 토큰 자동 첨부
client.interceptors.request.use(
  async (config) => {
    // 토큰이 없거나 만료된 경우 새로 가져오기
    if (!authToken && getTokenFunction) {
      try {
        const token = await getTokenFunction();
        setAuthToken(token);
      } catch (error) {
        console.error("Failed to get token:", error);
      }
    }

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
  async (error) => {
    if (error.response?.status === 401 && getTokenFunction) {
      // 토큰이 만료된 경우 새로 가져오기
      try {
        const newToken = await getTokenFunction();
        setAuthToken(newToken);

        // 원래 요청 재시도
        if (error.config && newToken) {
          error.config.headers["Authorization"] = `Bearer ${newToken}`;
          return client.request(error.config);
        }
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
      }
    }

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

export async function createStory(
  title: string,
  story: string,
  age?: string,
  length?: string
) {
  const res = await client.post("/stories", { title, story, age, length });
  return res.data;
}

export async function deleteStory(id: number) {
  const res = await client.delete(`/stories/${id}`);
  return res.data;
}

// Subscription API functions
export async function fetchSubscription() {
  const res = await client.get("/subscription");
  return res.data;
}

export async function updateSubscription(subscriptionData: any) {
  const res = await client.put("/subscription", subscriptionData);
  return res.data;
}

export async function cancelSubscription() {
  const res = await client.post("/subscription/cancel");
  return res.data;
}

export async function fetchPaymentHistory() {
  // Return empty array until payment system is ready
  return [];
  // const res = await client.get("/payments");
  // return res.data;
}

export async function createPaymentRecord(paymentData: any) {
  // Payment system not ready yet
  console.log("Payment system not implemented yet, data:", paymentData);
  throw new Error("Payment system not implemented yet");
  // const res = await client.post("/payments", paymentData);
  // return res.data;
}

export async function deleteUserAccount() {
  const res = await client.delete("/user/account");
  return res.data;
}

export async function fetchUserStats() {
  const res = await client.get("/user/stats");
  return res.data;
}

export async function fetchUserProfile() {
  const res = await client.get("/user/profile");
  return res.data;
}

export async function fetchUserPreferences() {
  const res = await client.get("/user/preferences");
  return res.data;
}

export async function updateUserPreferences(preferences: any) {
  const res = await client.put("/user/preferences", preferences);
  return res.data;
}

export async function exportUserData() {
  const res = await client.get("/user/export");
  return res.data;
}

export async function createSubscription(subscriptionData: any) {
  const res = await client.post("/subscription/create", subscriptionData);
  return res.data;
}

export async function fetchSubscriptionLimits() {
  const res = await client.get("/subscription/limits");
  return res.data;
}

export default client;
