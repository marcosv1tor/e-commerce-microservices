import { create } from "zustand";

interface AuthState {
  token: string | null;
  user: string | null;
  role: string | null;
  isAutenticated: boolean;
  login: (token: string, userName: string, role: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem("auth_token"),
    user: localStorage.getItem("user_name"),
    role: localStorage.getItem("user_role"),
    // se tiver token no storage, começa ja autenticado
    isAutenticated: !!localStorage.getItem("auth_token"),

  login: (token: string, userName: string, role: string) => {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_name", userName);
      localStorage.setItem("user_role", role);
      set({ token, user: userName, role, isAutenticated: true });
    },

    logout: () => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_role");
      set({ token: null, user: null, role: null, isAutenticated: false });
    }
}));