const API_BASE = "http://localhost:8000";

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

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

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

