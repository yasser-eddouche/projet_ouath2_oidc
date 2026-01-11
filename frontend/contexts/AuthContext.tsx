"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import keycloak from "@/lib/keycloak";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  roles: string[];
  isAdmin: boolean;
  isClient: boolean;
  login: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initKeycloak();
  }, []);

  const initKeycloak = async () => {
    try {
      const authenticated = await keycloak.init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri:
          window.location.origin + "/silent-check-sso.html",
        pkceMethod: "S256",
        redirectUri: window.location.origin + "/",
      });

      setIsAuthenticated(authenticated);

      if (authenticated) {
        const userProfile = await keycloak.loadUserProfile();
        setUser(userProfile);

        // Extract roles from token
        const tokenParsed = keycloak.tokenParsed;
        const realmRoles = tokenParsed?.realm_access?.roles || [];
        const resourceRoles =
          tokenParsed?.resource_access?.["microservices-app"]?.roles || [];
        const allRoles = [...realmRoles, ...resourceRoles];

        setRoles(allRoles);
      }

      // Setup token refresh
      keycloak.onTokenExpired = () => {
        keycloak.updateToken(30).catch(() => {
          console.error("Failed to refresh token");
          keycloak.login();
        });
      };

      setLoading(false);
    } catch (error) {
      console.error("Failed to initialize Keycloak", error);
      setLoading(false);
    }
  };

  const login = () => {
    keycloak.login();
  };

  const logout = () => {
    keycloak.logout();
  };

  const isAdmin = roles.includes("ADMIN");
  const isClient = roles.includes("CLIENT");

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        roles,
        isAdmin,
        isClient,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
