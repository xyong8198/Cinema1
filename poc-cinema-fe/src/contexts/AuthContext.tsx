"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, Role } from "@/types/user";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for authentication token on component mount
    const token = Cookies.get("auth_token");

    if (token) {
      try {
        // Decode token to get user information
        // This assumes your token contains user data
        const decodedToken: any = jwtDecode(token);

        // You might want to validate the token's expiration
        if (decodedToken.exp * 1000 < Date.now()) {
          // Token expired, log user out
          handleLogout();
          setIsLoading(false);
          return;
        }

        // Get stored user data
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        handleLogout();
      }
    }

    setIsLoading(false);
  }, []);

  const handleLogin = (token: string, userData: User) => {
    // Store token in cookies
    Cookies.set("auth_token", token, { expires: 7 }); // Expires in 7 days

    // Store user role for middleware usage
    Cookies.set("user_role", userData.role, { expires: 7 });

    // Store user data in localStorage
    localStorage.setItem("user", JSON.stringify(userData));

    // Update state
    setUser(userData);
  };

  const handleLogout = () => {
    // Remove token from cookies
    Cookies.remove("auth_token");
    Cookies.remove("user_role");

    // Remove user data from localStorage
    localStorage.removeItem("user");

    // Update state
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: handleLogin,
    logout: handleLogout,
    updateUser,
    isAdmin: user?.role === Role.ADMIN,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
