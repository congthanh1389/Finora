export type ApiUser = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: string;
};

function nativeApiUnavailable(): never {
  throw new Error("Finora Android uses local device authentication and does not use the server API.");
}

export async function apiCall<T>(_endpoint: string, _options?: RequestInit): Promise<T> {
  return nativeApiUnavailable();
}

export async function localLogin(_email: string, _password: string) {
  return nativeApiUnavailable() as Promise<{ app_session_id: string; user: ApiUser }>;
}

export async function localRegister(_email: string, _name: string, _password: string) {
  return nativeApiUnavailable() as Promise<{ app_session_id: string; user: ApiUser }>;
}

export async function exchangeOAuthCode(_code: string, _state: string) {
  return nativeApiUnavailable() as Promise<{ sessionToken: string; user: ApiUser }>;
}

export async function logout(): Promise<void> {
  return nativeApiUnavailable();
}

export async function getMe(): Promise<ApiUser | null> {
  return nativeApiUnavailable();
}

export async function establishSession(_token: string): Promise<boolean> {
  return nativeApiUnavailable();
}
