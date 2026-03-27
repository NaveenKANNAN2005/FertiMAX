import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, PackageCheck, Phone, RefreshCcw, Search, ShoppingBag, Store, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/apiClient";

const statusOptions = ["reserved", "ready_for_pickup", "collected", "cancelled", "revoked"];

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersResponse, statsResponse] = await Promise.all([
        apiClient.get("/orders/admin/all-orders", {
          params: {
            limit: 100,
            status: statusFilter !== "all" ? statusFilter : undefined,
          },
        }),
        apiClient.get("/orders/admin/stats"),
      ]);
      setOrders(ordersResponse.data?.data || []);
      setStats(statsResponse.data?.data || null);
    } catch (error) {
      toast({
        title: "Load failed",
        description: error.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      await apiClient.patch(`/orders/admin/${orderId}/status`, { status });
      await loadAdminData();
      toast({
        title: "Reservation updated",
        description: `Reservation status changed to ${status.replaceAll("_", " ")}.`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;

    return orders.filter((order) =>
      [
        order.orderNumber,
        order.user?.name,
        order.user?.email,
        order.contactPhone,
        order.shippingAddress?.city,
        ...(order.products?.map((item) => item.product?.name) || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [orders, search]);

  const overdueOrders = filteredOrders.filter((order) => order.isOverdue);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8f1dc_0%,#edf5e8_45%,#f5f4ef_100%)]">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 space-y-8">
          <section className="section-shell overflow-hidden px-6 py-8 md:px-8 lg:px-10">
            <div className="organic-orb -left-10 top-8 h-36 w-36 bg-gold/18" />
            <div className="organic-orb right-0 top-0 h-44 w-44 bg-leaf/20" />
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary/75">Admin reservations</p>
                <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                  Manage stock reservations and offline pickup flow.
                </h1>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
                  Online bookings reserve stock immediately. Admins can prepare, collect, or revoke them, and overdue reservations are surfaced inside this dashboard.
                </p>
              </div>
              <Button variant="outline" className="rounded-full border-primary/15 bg-white/75 px-5" onClick={loadAdminData} disabled={loading}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </section>

          {stats ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              {[
                { label: "Reservations", value: stats.totalOrders, icon: ShoppingBag },
                { label: "Reserved", value: stats.reservedOrders, icon: PackageCheck },
                { label: "Ready", value: stats.readyForPickupOrders, icon: Store },
                { label: "Collected", value: stats.collectedOrders, icon: PackageCheck },
                { label: "Overdue", value: stats.overdueReservations, icon: AlertTriangle },
                { label: "Reserved value", value: `Rs.${Number(stats.reservedValue || 0).toFixed(2)}`, icon: PackageCheck },
              ].map(({ label, value, icon: Icon }) => (
                <Card key={label} className="border-white/60 bg-white/80 shadow-medium">
                  <CardContent className="p-5">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
                    <p className="mt-2 font-display text-3xl text-foreground">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          {overdueOrders.length > 0 ? (
            <Card className="border-amber-200 bg-amber-50 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue Reservations Need Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-amber-900">
                {overdueOrders.slice(0, 5).map((order) => (
                  <div key={order._id} className="rounded-xl border border-amber-200 bg-white/70 p-4">
                    <p className="font-medium">{order.orderNumber}</p>
                    <p>{order.user?.name || "Customer"} | {order.contactPhone || order.user?.phone || "No phone"}</p>
                    <p>Expired hold date: {new Date(order.reservationExpiresAt).toLocaleDateString()}</p>
                  </div>
                ))}
                <p className="text-xs text-amber-800">
                  Revoke these reservations after confirming there was no customer response.
                </p>
              </CardContent>
            </Card>
          ) : null}

          <Card className="overflow-hidden border-white/60 bg-white/80 shadow-strong">
            <CardHeader className="border-b border-primary/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(89,126,82,0.08))]">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <CardTitle className="flex items-center gap-2 font-display text-2xl text-foreground">
                  <PackageCheck className="h-5 w-5 text-primary" />
                  All Reservations
                </CardTitle>
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative w-full md:w-72">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search reservations"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="h-12 w-full rounded-full border border-primary/10 bg-white pl-11 pr-4 text-sm text-foreground outline-none"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="h-12 rounded-full border border-primary/10 bg-white px-4 text-sm text-foreground outline-none"
                  >
                    <option value="all">All statuses</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="py-12 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-primary/15 bg-white/75 p-8 text-center text-muted-foreground">
                  No reservations found.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order._id} className={`rounded-[1.5rem] border bg-white/90 p-5 shadow-soft ${order.isOverdue ? "border-amber-300" : "border-primary/10"}`}>
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="font-semibold text-foreground">{order.orderNumber}</h3>
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              {order.status.replaceAll("_", " ")}
                            </span>
                            {order.isOverdue ? (
                              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                                overdue
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.user?.name || "Unknown user"} | {order.user?.email || "No email"}
                          </p>
                          <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            {order.contactPhone || order.user?.phone || "No phone"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Hold until {new Date(order.reservationExpiresAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm leading-6 text-muted-foreground">
                            {order.products?.map((item) => `${item.product?.name || "Product"} x ${item.quantity}`).join(", ")}
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 xl:min-w-[240px]">
                          <div className="rounded-[1.2rem] border border-primary/10 bg-primary/5 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reserved value</p>
                            <p className="mt-2 font-display text-3xl text-primary">
                              Rs.{Number(order.totalAmount || 0).toFixed(2)}
                            </p>
                          </div>

                          <select
                            value={order.status}
                            onChange={(event) => handleStatusChange(order._id, event.target.value)}
                            disabled={updatingOrderId === order._id}
                            className="h-12 rounded-2xl border border-primary/10 bg-white px-4 text-sm text-foreground outline-none"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status.replaceAll("_", " ")}
                              </option>
                            ))}
                          </select>

                          {updatingOrderId === order._id ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Updating reservation
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminOrders;
