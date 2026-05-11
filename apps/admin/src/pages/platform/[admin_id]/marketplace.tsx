import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import PlatformLayout from "@/layout/PlatformLayout";
import axiosInstance from "@/lib/utils/axiosInstance";
import { Button, Icon, Badge, Popup, Table, TableData, Dropdown } from "@graminate/ui";
import Loader from "@/components/ui/Loader";

type OrderItem = {
  order_item_id: number;
  product_id: number;
  producer_id: number;
  quantity: number;
  unit_price: number;
  escrow_released: boolean;
  product?: { name: string; images: string[]; units: string };
  producer?: { first_name: string; last_name: string; business_name: string | null };
};

type Order = {
  order_id: number;
  buyer_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  total_amount: number;
  cgst: number;
  sgst: number;
  status: string;
  created_at: string;
  buyer?: { first_name: string; last_name: string; email: string; business_name: string | null };
  items: OrderItem[];
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid (Escrow Held)",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  RELEASED: "Funds Released",
  CANCELLED: "Cancelled",
};

const statusBadgeType: Record<string, "warning" | "success" | "error" | "default"> = {
  PENDING: "warning",
  PAID: "warning",
  SHIPPED: "default",
  DELIVERED: "success",
  RELEASED: "success",
  CANCELLED: "error",
};

const AdminMarketplacePage = () => {
  const router = useRouter();
  const { admin_id } = router.query;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    text: string;
    variant: "success" | "error" | "info" | "warning";
    showCancelButton?: boolean;
    onConfirm?: () => void;
    confirmButtonText?: string;
  }>({
    isOpen: false,
    title: "",
    text: "",
    variant: "info",
  });

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/marketplace/orders");
      setOrders(res.data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (admin_id) fetchOrders();
  }, [admin_id, fetchOrders]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setProcessingOrderId(orderId);
    try {
      await axiosInstance.post(`/marketplace/orders/${orderId}/update-status`, { status: newStatus });
      setPopup({ isOpen: true, title: "Status Updated", text: `Order #${orderId} marked as ${statusLabels[newStatus]}.`, variant: "success" });
      fetchOrders();
    } catch {
      setPopup({ isOpen: true, title: "Error", text: "Failed to update order status.", variant: "error" });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleReleaseEscrow = (orderId: number, amount: number) => {
    setPopup({
      isOpen: true,
      title: "Release Escrow Funds?",
      text: `This will release ₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })} to the producer(s). This action cannot be undone.`,
      variant: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Release Funds",
      onConfirm: async () => {
        setPopup((prev) => ({ ...prev, isOpen: false }));
        setProcessingOrderId(orderId);
        try {
          await axiosInstance.post(`/marketplace/orders/${orderId}/release`);
          setPopup({ isOpen: true, title: "Escrow Released", text: `Funds for Order #${orderId} have been released to the producer(s).`, variant: "success" });
          fetchOrders();
        } catch {
          setPopup({ isOpen: true, title: "Error", text: "Failed to release escrow.", variant: "error" });
        } finally {
          setProcessingOrderId(null);
        }
      },
    });
  };

  const escrowStats = useMemo(() => {
    const heldOrders = orders.filter((o) => o.status === "PAID" || o.status === "DELIVERED");
    const totalHeld = heldOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const releasedOrders = orders.filter((o) => o.status === "RELEASED");
    const totalReleased = releasedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    return { heldCount: heldOrders.length, totalHeld, releasedCount: releasedOrders.length, totalReleased };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = filterStatus === "All" || o.status === filterStatus;
      const matchesSearch =
        !searchQuery ||
        String(o.order_id).includes(searchQuery) ||
        o.buyer?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.buyer?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.buyer?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, filterStatus, searchQuery]);

  const getBuyerName = (order: Order) => {
    if (!order.buyer) return "Unknown";
    return order.buyer.business_name || `${order.buyer.first_name} ${order.buyer.last_name}`;
  };

  const getProducerNames = (order: Order) => {
    const names = new Set(
      order.items.map((item) =>
        item.producer?.business_name || `${item.producer?.first_name} ${item.producer?.last_name}`
      )
    );
    return Array.from(names).join(", ");
  };

  return (
    <>
      <Head>
        <title>Marketplace Management | Admin</title>
      </Head>
      <PlatformLayout>
        <div className="p-4 sm:p-6 space-y-6">
          <header>
            <h1 className="text-xl font-bold text-dark dark:text-light flex items-center gap-2">
              <Icon type="storefront" /> Marketplace
            </h1>
            <p className="text-sm text-dark dark:text-light mt-1">
              Manage orders and escrow fund releases.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-400 dark:border-gray-700 shadow-sm">
              <p className="text-xs text-dark dark:text-light uppercase font-bold opacity-60">Total Orders</p>
              <p className="text-2xl font-bold text-dark dark:text-light mt-1">{orders.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-400 dark:border-gray-700 shadow-sm">
              <p className="text-xs text-dark dark:text-light uppercase font-bold opacity-60">Escrow Held</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">₹{escrowStats.totalHeld.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-dark dark:text-light mt-0.5">{escrowStats.heldCount} order(s)</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-400 dark:border-gray-700 shadow-sm">
              <p className="text-xs text-dark dark:text-light uppercase font-bold opacity-60">Funds Released</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">₹{escrowStats.totalReleased.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-dark dark:text-light mt-0.5">{escrowStats.releasedCount} order(s)</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-400 dark:border-gray-700 shadow-sm">
              <p className="text-xs text-dark dark:text-light uppercase font-bold opacity-60">Pending Actions</p>
              <p className="text-2xl font-bold text-dark dark:text-light mt-1">{orders.filter((o) => o.status === "DELIVERED").length}</p>
              <p className="text-xs text-dark dark:text-light mt-0.5">awaiting release</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-2">
            <div className="w-full sm:w-64">
              <Dropdown
                label=""
                items={["All", "PENDING", "PAID", "SHIPPED", "DELIVERED", "RELEASED", "CANCELLED"]}
                selectedItem={filterStatus}
                onSelect={setFilterStatus}
                placeholder="Filter by status"
                width="full"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader /></div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-400 dark:bg-gray-200 flex items-center justify-center mb-4">
                <Icon type="receipt_long" className="text-4xl! text-dark dark:text-light" />
              </div>
              <p className="text-dark dark:text-light text-sm">No orders found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrderId === order.order_id;
                const isProcessing = processingOrderId === order.order_id;
                const canRelease = order.status === "PAID" || order.status === "DELIVERED";
                const canUpdateStatus = order.status !== "RELEASED" && order.status !== "CANCELLED";

                return (
                  <div key={order.order_id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors gap-3"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.order_id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-dark dark:text-light">Order #{order.order_id}</span>
                          <span className="text-xs text-dark dark:text-light mt-0.5">
                            {new Date(order.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge type={statusBadgeType[order.status] || "default"} label={statusLabels[order.status] || order.status} />
                        <span className="text-sm font-bold text-dark dark:text-light">
                          ₹{Number(order.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                        <Icon type={isExpanded ? "expand_less" : "expand_more"} className="text-dark dark:text-light" />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-gray-400 dark:border-gray-700 pt-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-dark dark:text-light opacity-60 mb-0.5">Buyer</p>
                            <p className="font-medium text-dark dark:text-light">{getBuyerName(order)}</p>
                            <p className="text-xs text-dark dark:text-light">{order.buyer?.email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-dark dark:text-light opacity-60 mb-0.5">Producer(s)</p>
                            <p className="font-medium text-dark dark:text-light">{getProducerNames(order)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-dark dark:text-light opacity-60 mb-0.5">Payment ID</p>
                            <p className="font-mono text-xs text-dark dark:text-light">{order.razorpay_payment_id || "—"}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-bold text-dark dark:text-light uppercase opacity-60">Items</p>
                          {order.items.map((item) => (
                            <div key={item.order_item_id} className="flex items-center gap-3 py-2 border-t border-gray-400 dark:border-gray-700">
                              <div className="w-10 h-10 rounded bg-gray-400 dark:bg-gray-700 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                                {item.product?.images?.[0] ? (
                                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                ) : "📦"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-dark dark:text-light truncate">{item.product?.name}</p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <p className="text-xs text-dark dark:text-light">
                                    {item.quantity} × ₹{Number(item.unit_price).toLocaleString("en-IN")}
                                  </p>
                                  {item.producer && (
                                    <Badge
                                      size="sm"
                                      type="default"
                                      iconLeft="storefront"
                                      label={
                                        item.producer.business_name && item.producer.business_name !== "Individual Account"
                                          ? item.producer.business_name
                                          : `${item.producer.first_name} ${item.producer.last_name}`
                                      }
                                    />
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-dark dark:text-light">₹{(item.quantity * Number(item.unit_price)).toLocaleString("en-IN")}</span>
                                {item.escrow_released && (
                                  <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">Released</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-3 gap-3 py-3 border-t border-gray-400 dark:border-gray-700 text-sm">
                          <div>
                            <span className="text-xs text-dark dark:text-light opacity-60">CGST</span>
                            <p className="font-medium text-dark dark:text-light">₹{Number(order.cgst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div>
                            <span className="text-xs text-dark dark:text-light opacity-60">SGST</span>
                            <p className="font-medium text-dark dark:text-light">₹{Number(order.sgst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div>
                            <span className="text-xs text-dark dark:text-light opacity-60">Grand Total</span>
                            <p className="font-bold text-blue-600 dark:text-blue-400">₹{Number(order.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>

                        {canUpdateStatus && (
                          <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            {order.status === "PAID" && (
                              <Button
                                label={isProcessing ? "Updating..." : "Mark as Shipped"}
                                variant="outline"
                                icon={{ left: "local_shipping" }}
                                onClick={() => handleUpdateStatus(order.order_id, "SHIPPED")}
                                disabled={isProcessing}
                              />
                            )}
                            {order.status === "SHIPPED" && (
                              <>
                                <Button
                                  label={isProcessing ? "Updating..." : "Mark as Delivered"}
                                  variant="outline"
                                  icon={{ left: "inventory" }}
                                  onClick={() => handleUpdateStatus(order.order_id, "DELIVERED")}
                                  disabled={isProcessing}
                                />
                                <Button
                                  label={isProcessing ? "Undoing..." : "Unmark as Shipped"}
                                  variant="outline"
                                  icon={{ left: "undo" }}
                                  onClick={() => handleUpdateStatus(order.order_id, "PAID")}
                                  disabled={isProcessing}
                                />
                              </>
                            )}
                            {canRelease && (
                              <Button
                                label={isProcessing ? "Releasing..." : "Release Escrow"}
                                variant="primary"
                                icon={{ left: "account_balance" }}
                                onClick={() => handleReleaseEscrow(order.order_id, Number(order.total_amount))}
                                disabled={isProcessing}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PlatformLayout>
      <Popup
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        title={popup.title}
        text={popup.text}
        variant={popup.variant}
        showCancelButton={popup.showCancelButton}
        onConfirm={popup.onConfirm}
        confirmButtonText={popup.confirmButtonText}
      />
    </>
  );
};

export default AdminMarketplacePage;
