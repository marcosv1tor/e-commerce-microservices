import { create } from "zustand";

interface AuthState {
  token: string | null;
  user: string | null;
  isAutenticated: boolean;
  login: (token: string, userName: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem("auth_token"),
    user: localStorage.getItem("user_name"),
    // se tiver token no storage, começa ja autenticado
    isAutenticated: !!localStorage.getItem("auth_token"),
    
  login: (token: string, userName: string) => {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_name", userName);
      set({ token, user: userName, isAutenticated: true });
    },

    logout: () => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_name");
      set({ token: null, user: null, isAutenticated: false });
    }
}));