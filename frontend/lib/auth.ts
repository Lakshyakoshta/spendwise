export function saveToken(token: string) {
  localStorage.setItem("accessToken", token);
}

export function getToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function clearToken() {
  localStorage.removeItem("accessToken");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}