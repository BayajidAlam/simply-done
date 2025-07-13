import { createContext, useEffect, useState, ReactNode } from "react";
import { apiService } from "../utils/api";
import { IUser } from "../Types";

interface AuthContextProps {
  user: IUser | null;
  loading: boolean;
  createUser: (
    userName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logInUser: (email: string, password: string) => Promise<void>;
  logOutUser: () => void;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

// Creating auth context
export const AuthContext = createContext<AuthContextProps | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  // States
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Functions
  const createUser = async (
    userName: string,
    email: string,
    password: string
  ) => {
    setLoading(true);
    try {
      const response = await apiService.register({ userName, email, password });

      // Your backend returns { acknowledged: true, insertedId: "..." }
      if (response.data.success && response.data.data?.userId) {
        // Registration successful, but we need to login to get the token
        await logInUser(email, password);
      } else {
        throw new Error("Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(
        error.response?.data?.message || error.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const logInUser = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiService.login({ email, password });

      // Your backend returns { token: "..." }
      if (response.data.token) {
        // Store token
        localStorage.setItem("access-token", response.data.token);

        // Create user object from login data
        const userData: IUser = {
          email: response.data.user.email,
          userName: response.data.user.userName,
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        throw new Error("Login failed - no token received");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(
        error.response?.data?.message || error.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    setLoading(true);
    try {
      if (!user?.email) {
        throw new Error("No user logged in");
      }

      const response = await apiService.changePassword({
        currentPassword,
        newPassword,
      });

      // Your backend returns { error: false, data: {...}, message: "Password changed successfully!" }
      if (response.data.error === false) {
        // Password changed successfully
        console.log("Password changed successfully");
      } else {
        throw new Error(response.data.message || "Password change failed");
      }
    } catch (error: any) {
      console.error("Change password error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Password change failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const logOutUser = () => {
    setLoading(true);

    // Clear local storage
    localStorage.removeItem("access-token");
    localStorage.removeItem("user");

    // Clear user state
    setUser(null);
    setLoading(false);
  };

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem("access-token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Clear invalid data
        localStorage.removeItem("access-token");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const authInfo = {
    user,
    loading,
    createUser,
    logInUser,
    changePassword,
    logOutUser,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
