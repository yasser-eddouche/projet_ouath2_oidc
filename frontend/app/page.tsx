"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, user, isAdmin, isClient, login, logout, loading } =
    useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect authenticated users to products page
      router.push("/products");
    }
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
      <main className="flex flex-col items-center gap-8 p-16 bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            E-commerce Platform
          </h1>
          <p className="text-gray-600">
            Secure microservices architecture with Keycloak authentication
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="w-full space-y-4">
            <button
              onClick={login}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
            >
              Login with Keycloak
            </button>
            <div className="text-sm text-gray-500 text-center">
              <p>Authenticate to access products and orders</p>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="text-lg font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="mt-2 flex gap-2">
                {isAdmin && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                    ADMIN
                  </span>
                )}
                {isClient && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    CLIENT
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => router.push("/products")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Browse Products
            </button>

            <button
              onClick={logout}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
