const configuredApiBase =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "http://localhost:8000" : "");
const API_BASE = configuredApiBase.replace(/\/+$/, "");

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("policywise_token");

  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Could not reach the API. Check VITE_API_BASE_URL and the backend CORS settings."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.headers.get("content-type")?.includes("json")) {
    throw new Error(
      "The API returned an unexpected response. Check that VITE_API_BASE_URL points to the backend."
    );
  }

  if (!response.ok) {
    const message =
      data?.detail?.error?.message ||
      data?.detail ||
      "Something went wrong";

    throw new Error(message);
  }

  return data;
}

export async function loginUser(email: string, password: string) {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (typeof data.access_token !== "string" || !data.access_token) {
    throw new Error("The login response did not include an access token.");
  }

  localStorage.setItem("policywise_token", data.access_token);
  return data;
}

export async function signupUser(
  email: string,
  password: string,
  full_name: string
) {
  return apiRequest("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name }),
  });
}

export async function getCurrentUser() {
  return apiRequest("/api/auth/me");
}

export function logoutUser() {
  localStorage.removeItem("policywise_token");
  localStorage.removeItem("policywise_policy_id");
}

export async function uploadPolicy(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest("/api/policies/upload", {
    method: "POST",
    body: formData,
  });
}

export async function getPolicyStatus(policyId: string) {
  return apiRequest(`/api/policies/${policyId}/status`);
}

export async function getPolicyOverview(policyId: string) {
  return apiRequest(`/api/policies/${policyId}`);
}

export async function askPolicy(
  policyId: string,
  question: string
) {
  return apiRequest("/api/assistant/ask", {
    method: "POST",
    body: JSON.stringify({
      policy_id: policyId,
      question,
    }),
  });
}

