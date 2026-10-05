import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

type UseAuthOptions = {
  autoFetch?: boolean;
};

type AuthStateListener = (user: Auth.User | null) => void;
const authStateListeners = new Set<AuthStateListener>();

function notifyAuthState(user: Auth.User | null) {
  authStateListeners.forEach((listener) => listener(user));
}

export function useAuth(options?: UseAuthOptions) {
  const { autoFetch = true } = options ?? {};
  const [user, setUser] = useState<Auth.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    console.log("[useAuth] fetchUser called");
    try {
      setLoading(true);
      setError(null);

      // Web platform: use cookie-based auth, fetch user from API
      if (Platform.OS === "web") {
        console.log("[useAuth] Web platform: fetching user from API...");
        const apiUser = await Api.getMe();

        if (apiUser) {
          const userInfo: Auth.User = {
            id: apiUser.id,
            openId: apiUser.openId,
            name: apiUser.name,
            email: apiUser.email,
            loginMethod: apiUser.loginMethod,
            lastSignedIn: new Date(apiUser.lastSignedIn),
          };
          setUser(userInfo);
          // Cache user info in localStorage for faster subsequent loads
          await Auth.setUserInfo(userInfo);
          console.log("[useAuth] Web user set from API");
        } else {
          console.log("[useAuth] Web: No authenticated user from API");
          setUser(null);
          await Auth.clearUserInfo();
        }
        return;
      }

      // Native platform: validate the local account and its device session.
      console.log("[useAuth] Native platform: validating local session...");
      const sessionToken = await Auth.getSessionToken();
      const localAccount = await Auth.localGetAccount();
      if (!sessionToken || !localAccount) {
        console.log("[useAuth] Local session/account missing, setting user to null");
        setUser(null);
        return;
      }

      const expectedToken = `local-session-${localAccount.id}`;
      if (sessionToken !== expectedToken) {
        console.log("[useAuth] Local session token is invalid, clearing session");
        await Auth.removeSessionToken();
        await Auth.clearUserInfo();
        setUser(null);
        return;
      }

      const user: Auth.User = {
        id: localAccount.id,
        openId: localAccount.openId,
        name: localAccount.name,
        email: localAccount.email,
        loginMethod: localAccount.loginMethod,
        lastSignedIn: new Date(localAccount.lastSignedIn),
      };
      await Auth.setUserInfo(user);
      setUser(user);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch user");
      console.error("[useAuth] fetchUser error");
      setError(error);
      setUser(null);
    } finally {
      setLoading(false);
      console.log("[useAuth] fetchUser completed, loading:", false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        await Api.logout();
      } else {
        await Auth.localLogout();
      }
    } catch {
      console.error("[Auth] Logout failed");
    } finally {
      if (Platform.OS !== "web") {
        await Auth.removeSessionToken();
        await Auth.clearUserInfo();
      }
      setUser(null);
      setError(null);
      notifyAuthState(null);
    }
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  useEffect(() => {
    const listener = (nextUser: Auth.User | null) => {
      setUser(nextUser);
      setError(null);
      setLoading(false);
    };
    authStateListeners.add(listener);
    return () => {
      authStateListeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    console.log("[useAuth] useEffect triggered");
    if (autoFetch) {
      if (Platform.OS === "web") {
        // Web: fetch user from API directly (user will login manually if needed)
        console.log("[useAuth] Web: fetching user from API...");
        fetchUser();
      } else {
        // Native: always validate the local session token before restoring the cached user.
        // This prevents a stale cached user from bypassing the login screen.
        fetchUser();
      }
    } else {
      console.log("[useAuth] autoFetch disabled, setting loading to false");
      setLoading(false);
    }
  }, [autoFetch, fetchUser]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    refresh: fetchUser,
    logout,
  };
}
