"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { productsAPI, ordersAPI } from "@/lib/api";
import { Product, OrderItem } from "@/types";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function NewOrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      console.log("API Response:", response.data);

      // Handle different response structures
      const productData = Array.isArray(response.data)
        ? response.data
        : response.data._embedded?.products || response.data.content || [];

      setProducts(productData);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
      setLoading(false);
    }
  };

  const handleAddItem = (product: Product) => {
    // Prevent adding products with 0 stock or invalid price
    if (product.quantity <= 0) {
      alert("This product is out of stock");
      return;
    }

    const existingItem = orderItems.find(
      (item) => item.productId === product.id
    );

    if (existingItem) {
      // Check if we can increment (stock available)
      if (existingItem.quantity >= product.quantity) {
        alert("Cannot add more - insufficient stock");
        return;
      }
      // Increment quantity
      setOrderItems(
        orderItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // Add new item
      setOrderItems([
        ...orderItems,
        {
          productId: product.id,
          quantity: 1,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setOrderItems(
      orderItems.map((item) =>
        item.productId === productId ? { ...item, quantity: quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: number) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (orderItems.length === 0) {
      alert("Please add at least one item to the order");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const orderData = {
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      await ordersAPI.create(orderData);
      alert("Order created successfully");
      router.push("/orders");
    } catch (err: any) {
      console.error("Error creating order:", err);
      if (err.response?.status === 403) {
        setError("Access forbidden: Only CLIENT can create orders");
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Invalid order data");
      } else {
        setError(err.response?.data?.message || "Failed to create order");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={["CLIENT"]}>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading products...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={["CLIENT"]}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Create New Order
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Products List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Available Products
                </h2>
                <div className="space-y-4">
                  {products.map((product) => {
                    const itemInCart = orderItems.find(
                      (item) => item.productId === product.id
                    );
                    const subtotal = itemInCart
                      ? product.price * itemInCart.quantity
                      : 0;

                    return (
                      <div
                        key={product.id}
                        className={`flex justify-between items-center p-4 border-2 rounded-lg transition-all ${
                          itemInCart
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">
                              {product.name}
                            </h3>
                            {itemInCart && (
                              <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full font-medium">
                                {itemInCart.quantity} in cart
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {product.description}
                          </p>
                          <div className="flex gap-4 items-center flex-wrap">
                            <span className="text-lg font-semibold text-indigo-600">
                              ${product.price.toFixed(2)}
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                product.quantity > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              Stock: {product.quantity}
                            </span>
                            {itemInCart && (
                              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 rounded-md">
                                <span className="text-sm text-gray-600">
                                  Subtotal:
                                </span>
                                <span className="text-base font-bold text-indigo-700">
                                  ${subtotal.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddItem(product)}
                          disabled={
                            product.quantity === 0 ||
                            (itemInCart &&
                              itemInCart.quantity >= product.quantity)
                          }
                          className="ml-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium transition-colors"
                        >
                          {product.quantity === 0
                            ? "Out of Stock"
                            : itemInCart &&
                              itemInCart.quantity >= product.quantity
                            ? "Max Stock Reached"
                            : itemInCart
                            ? "+ Add More"
                            : "Add to Order"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>

                {orderItems.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <p className="mt-4 text-gray-600">No items added yet</p>
                    <p className="mt-2 text-sm text-gray-500">
                      Select products from the left to start your order
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {orderItems.map((item) => {
                        const product = products.find(
                          (p) => p.id === item.productId
                        );
                        const itemTotal = (product?.price || 0) * item.quantity;

                        return (
                          <div
                            key={item.productId}
                            className="bg-gray-50 p-3 rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-gray-900">
                                {product?.name}
                              </h3>
                              <button
                                onClick={() => handleRemoveItem(item.productId)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <label className="text-sm text-gray-600">
                                Quantity:
                              </label>
                              <input
                                type="number"
                                min="1"
                                max={product?.quantity}
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateQuantity(
                                    item.productId,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-20 text-black px-2 py-1 border rounded"
                              />
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">
                                ${(product?.price || 0).toFixed(2)} ×{" "}
                                {item.quantity}
                              </span>
                              <span className="font-semibold text-gray-900">
                                ${itemTotal.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total Amount - Calculated in Frontend */}
                    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 mb-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-600 block">
                            Order Total
                          </span>
                          <span className="text-xs text-gray-500">
                            {orderItems.length} item
                            {orderItems.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <span className="text-3xl font-bold text-indigo-600">
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 rounded-md font-medium transition-colors shadow-lg"
                    >
                      {submitting ? "Creating Order..." : "Place Order"}
                    </button>
                  </>
                )}

                <button
                  onClick={() => router.push("/orders")}
                  className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
