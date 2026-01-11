"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { isAuthenticated, user, isAdmin, isClient, logout } = useAuth();
  const pathname = usePathname();

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              E-commerce
            </Link>

            <div className="hidden md:flex space-x-4">
              <Link
                href="/products"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/products"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Products
              </Link>

              {isAdmin && (
                <Link
                  href="/products/new"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === "/products/new"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Add Product
                </Link>
              )}

              <Link
                href="/orders"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/orders"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Orders
              </Link>

              {isClient && (
                <Link
                  href="/orders/new"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === "/orders/new"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  New Order
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{user?.username}</span>
              <div className="flex gap-1 mt-1">
                {isAdmin && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                    ADMIN
                  </span>
                )}
                {isClient && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    CLIENT
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={logout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
