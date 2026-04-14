const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type RequestOptions = RequestInit & {
  token?: string | null;
};

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiClientError(data.message || "Erreur API", response.status);
  }

  return data as T;
}

export { API_BASE_URL };
