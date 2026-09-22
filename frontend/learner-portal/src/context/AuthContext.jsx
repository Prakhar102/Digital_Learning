import {
  createContext,
  useState,
} from "react";

export const AuthContext =
  createContext();

export function AuthProvider({
  children,
}) {
  const [isAuthenticated] =
    useState(
      !!localStorage.getItem(
        "accessToken"
      )
    );

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}