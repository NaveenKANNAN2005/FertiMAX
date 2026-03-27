import { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LogOut, ShoppingCart, ClipboardList, User, ArrowRight, Loader2, XCircle } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

const statusStyles = {
  collected: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  revoked: "bg-red-100 text-red-800",
  ready_for_pickup: "bg-blue-100 text-blue-800",
  reserved: "bg-amber-100 text-amber-800",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, updateProfile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    farmSize: "",
    cropTypes: "",
    soilType: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, navigate]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/orders/my-orders");
      setOrders(response.data?.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [fetchOrders, isAuthenticated]);

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      zipCode: user?.zipCode || "",
      farmSize: user?.farmSize ? String(user.farmSize) : "",
      cropTypes: user?.cropTypes?.join(", ") || "",
      soilType: user?.soilType || "",
    });
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setCancellingOrderId(orderId);
      await apiClient.patch(`/orders/${orderId}/cancel`);
      await fetchOrders();
      toast({
        title: "Order cancelled",
        description: "Stock was restored and the order has been updated.",
      });
    } catch (err) {
      toast({
        title: "Cancel failed",
        description: err.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleProfileSave = async () => {
    try {
      setSavingProfile(true);
      const result = await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address,
        city: profileForm.city,
        state: profileForm.state,
        zipCode: profileForm.zipCode,
        farmSize: profileForm.farmSize ? Number(profileForm.farmSize) : 0,
        cropTypes: profileForm.cropTypes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        soilType: profileForm.soilType || undefined,
      });

      if (result.success) {
        toast({
          title: "Profile updated",
          description: "Your account information has been saved.",
        });
      }
    } finally {
      setSavingProfile(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cream via-background to-leaf/10">
      <Navbar />

      <div className="flex-1 py-12 px-4 mt-16">
        <div className="container mx-auto">
          <div className="section-shell mb-8 flex flex-col p-8 md:flex-row md:items-center md:justify-between md:p-10">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-primary/70">
                Personal workspace
              </p>
              <h1 className="font-display text-4xl font-bold text-gray-900">
                Welcome, {user?.name || "User"}!
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your account, track reservations, and explore our products
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="mt-4 md:mt-0 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-white/60 bg-white/80 shadow-medium hover:shadow-strong transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Name: <span className="font-semibold text-gray-900">{user?.name}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Email: <span className="font-semibold text-gray-900">{user?.email}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Role:{" "}
                    <span className="font-semibold text-primary capitalize">
                      {user?.role || "farmer"}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/60 bg-white/80 shadow-medium hover:shadow-strong transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  Total Reservations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{orders.length}</p>
                <p className="text-xs text-gray-600 mt-1">All time reservations</p>
              </CardContent>
            </Card>

            <Card className="border-white/60 bg-white/80 shadow-medium hover:shadow-strong transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/products">
                    Browse Products
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-strong">
            <div className="flex gap-0 border-b bg-gray-100 px-6">
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === "orders"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                My Reservations
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === "profile"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </button>
            </div>

            {activeTab === "orders" && (
              <div className="p-6 space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading your reservations...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reservations Yet</h3>
                    <p className="text-gray-600 mb-6">Reserve products to see them here</p>
                    <Button asChild>
                      <Link to="/products">Shop Now</Link>
                    </Button>
                  </div>
                ) : (
                  orders.map((order) => (
                    <Card key={order._id} className="border-l-4 border-l-primary bg-white/85">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                            <CardDescription>
                              Reserved on {new Date(order.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              statusStyles[order.status] || statusStyles.reserved
                            }`}
                          >
                            {order.status.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Reserved Value</p>
                            <p className="text-xl font-bold text-primary">
                              Rs.{order.totalAmount?.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Pickup Contact</p>
                            <p className="font-semibold text-gray-900">
                              {order.contactPhone || user?.phone || "Not set"}
                            </p>
                          </div>
                        </div>
                        {order.reservationExpiresAt && order.status !== "collected" && order.status !== "cancelled" && order.status !== "revoked" && (
                          <div className="bg-amber-50 rounded p-3">
                            <p className="text-sm text-amber-800">
                              Reservation held until {new Date(order.reservationExpiresAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {order.products?.length > 0 && (
                          <div className="bg-gray-50 rounded p-3">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Items:</p>
                            <ul className="space-y-1">
                              {order.products.map((item, index) => (
                                <li key={index} className="text-sm text-gray-600">
                                  {item.product?.name} x {item.quantity}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-3">
                          <Button asChild variant="outline" size="sm">
                            <Link to="/products">Reserve Again</Link>
                          </Button>
                          {(order.status === "reserved" || order.status === "ready_for_pickup") && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelOrder(order._id)}
                              disabled={cancellingOrderId === order._id}
                            >
                              {cancellingOrderId === order._id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-2" />
                              )}
                              Cancel Reservation
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="p-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Your account details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Full Name</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="mt-2 text-lg font-semibold text-gray-900">{user?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Role</label>
                        <p className="mt-2 text-lg font-semibold text-primary capitalize">
                          {user?.role || "farmer"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Phone</label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-600">Address</label>
                        <input
                          type="text"
                          value={profileForm.address}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, address: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">City</label>
                        <input
                          type="text"
                          value={profileForm.city}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, city: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">State</label>
                        <input
                          type="text"
                          value={profileForm.state}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, state: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">ZIP Code</label>
                        <input
                          type="text"
                          value={profileForm.zipCode}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, zipCode: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {user?.role === "farmer" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Farm Information</CardTitle>
                      <CardDescription>Your agricultural details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Farm Size</label>
                          <input
                            type="number"
                            min="0"
                            value={profileForm.farmSize}
                            onChange={(e) =>
                              setProfileForm((prev) => ({ ...prev, farmSize: e.target.value }))
                            }
                            className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Soil Type</label>
                          <select
                            value={profileForm.soilType}
                            onChange={(e) =>
                              setProfileForm((prev) => ({ ...prev, soilType: e.target.value }))
                            }
                            className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3"
                          >
                            <option value="">Select soil type</option>
                            {["Clay", "Sand", "Loam", "Silt", "Other"].map((soil) => (
                              <option key={soil} value={soil}>
                                {soil}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-600">Crop Types</label>
                          <input
                            type="text"
                            value={profileForm.cropTypes}
                            onChange={(e) =>
                              setProfileForm((prev) => ({ ...prev, cropTypes: e.target.value }))
                            }
                            placeholder="Rice, Wheat, Vegetables"
                            className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button className="w-full" onClick={handleProfileSave} disabled={savingProfile}>
                  {savingProfile ? "Saving Profile..." : "Save Profile"}
                </Button>
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>

          {user?.role === "admin" && (
            <Card className="mt-8 bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900">Admin Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800 mb-4">You have administrative privileges</p>
                <Button asChild>
                  <Link to="/admin/products">Manage Products</Link>
                </Button>
                <Button asChild variant="outline" className="mt-3">
                  <Link to="/admin/orders">Manage Orders</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
