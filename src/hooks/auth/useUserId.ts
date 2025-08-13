import Cookies from "js-cookie";

export function useUserId(): number | null {
  const token = Cookies.get("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || null;
  } catch {
    return null;
  }
}
