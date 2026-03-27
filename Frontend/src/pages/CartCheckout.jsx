import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/apiClient";

const CartCheckout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [validatingCart, setValidatingCart] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    zipCode: user?.zipCode || "",
    country: "India",
  });
  const [contactPhone, setContactPhone] = useState(user?.phone || "");

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cart]
  );

  const validateCartAgainstInventory = async () => {
    setValidatingCart(true);

    try {
      const productResponses = await Promise.all(
        cart.map((item) => apiClient.get(`/products/${item._id}`))
      );

      const freshProducts = productResponses
        .map((response) => response.data?.data)
        .filter(Boolean);
      const productById = new Map(freshProducts.map((product) => [product._id, product]));
      const issues = [];

      cart.forEach((item) => {
        const product = productById.get(item._id);

        if (!product) {
          issues.push(`${item.name} is no longer available.`);
          return;
        }

        if (product.stockQuantity <= 0) {
          issues.push(`${product.name} is out of stock.`);
          removeFromCart(item.cartItemId);
          return;
        }

        if (item.quantity > product.stockQuantity) {
          issues.push(
            `${product.name} quantity was reduced to available stock (${product.stockQuantity}).`
          );
          updateQuantity(item.cartItemId, product.stockQuantity);
        }
      });

      return issues;
    } finally {
      setValidatingCart(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      return;
    }

    if (!contactPhone.trim()) {
      toast({
        title: "Phone number required",
        description: "A phone number is required so the shop can contact you.",
        variant: "destructive",
      });
      return;
    }

    try {
      setPlacingOrder(true);
      const inventoryIssues = await validateCartAgainstInventory();

      if (inventoryIssues?.length) {
        toast({
          title: "Cart updated",
          description: inventoryIssues[0],
          variant: "destructive",
        });
        setPlacingOrder(false);
        return;
      }

      await apiClient.post("/orders", {
        products: cart.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        shippingAddress,
        contactPhone,
      });

      clearCart();
      toast({
        title: "Reservation created",
        description: "Your fertilizer has been reserved for offline pickup.",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Order failed",
        description: error.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f6f0db_0%,#edf5e8_42%,#f7f4ee_100%)]">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <Button
            variant="outline"
            asChild
            className="mb-6 rounded-full border-primary/15 bg-white/75 px-5"
          >
            <Link to="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>

          <section className="section-shell overflow-hidden px-6 py-8 md:px-8 lg:px-10">
            <div className="organic-orb -left-10 top-6 h-32 w-32 bg-gold/20" />
            <div className="organic-orb right-0 top-0 h-40 w-40 bg-leaf/20" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_390px]">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary/75">
                  Checkout workspace
                </p>
                <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                  Review your cart before dispatch.
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
                  Adjust quantities, confirm contact details, and reserve fertilizer with
                  live stock validation before it is held for pickup.
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {[
                    {
                      label: "Items",
                      value: itemCount,
                      icon: ShoppingCart,
                    },
                    {
                      label: "Cart total",
                      value: `Rs.${total.toFixed(2)}`,
                      icon: PackageCheck,
                    },
                    {
                      label: "Pickup region",
                      value: shippingAddress.city || "Local store",
                      icon: Truck,
                    },
                  ].map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="rounded-[1.5rem] border border-primary/10 bg-white/80 p-5 shadow-soft"
                    >
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-2 font-display text-2xl text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-panel relative z-10 p-6">
                <div className="rounded-[1.35rem] border border-primary/10 bg-white/80 p-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Protected reservation flow</p>
                      <p className="text-sm text-muted-foreground">
                        Stock is reserved immediately after the booking is created.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Items subtotal</span>
                    <span className="font-medium text-foreground">Rs.{total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fulfilment</span>
                    <span className="font-medium text-foreground">Pay and collect offline</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-primary/10 pt-3">
                    <span className="font-semibold text-foreground">Reserved value</span>
                    <span className="font-display text-3xl text-primary">
                      Rs.{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <Card className="overflow-hidden border-white/60 bg-white/80 shadow-strong">
              <CardHeader className="border-b border-primary/10 bg-[linear-gradient(135deg,rgba(89,126,82,0.08),rgba(255,255,255,0.8))]">
                <CardTitle className="flex items-center gap-2 font-display text-2xl">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Cart Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {cart.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-dashed border-primary/15 bg-white/75 p-8 text-center">
                    <p className="text-muted-foreground">Your cart is empty.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="rounded-[1.5rem] border border-primary/10 bg-white/90 p-5 shadow-soft"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{item.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Rs.{Number(item.price).toFixed(2)} each
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-primary/70">
                            Stock-linked cart item
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                          onClick={() => removeFromCart(item.cartItemId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="min-w-10 text-center font-semibold text-foreground">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            Line total
                          </p>
                          <p className="font-display text-2xl text-primary">
                            Rs.{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-white/60 bg-white/80 shadow-strong">
              <CardHeader className="border-b border-primary/10 bg-[linear-gradient(135deg,rgba(212,176,82,0.10),rgba(255,255,255,0.85))]">
                <CardTitle className="flex items-center gap-2 font-display text-2xl">
                  <MapPin className="h-5 w-5 text-primary" />
                  Reserve Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="rounded-[1.35rem] border border-primary/10 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Reservation details
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    This does not create an online purchase. It reserves stock so the shop
                    can call you and prepare pickup.
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Phone number"
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-foreground outline-none"
                />

                <input
                  type="text"
                  placeholder="Street address (optional)"
                  value={shippingAddress.street}
                  onChange={(event) =>
                    setShippingAddress((prev) => ({
                      ...prev,
                      street: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-foreground outline-none"
                />
                <input
                  type="text"
                  placeholder="City / area"
                  value={shippingAddress.city}
                  onChange={(event) =>
                    setShippingAddress((prev) => ({
                      ...prev,
                      city: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-foreground outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="State"
                    value={shippingAddress.state}
                    onChange={(event) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        state: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-foreground outline-none"
                  />
                  <input
                    type="text"
                    placeholder="ZIP code"
                    value={shippingAddress.zipCode}
                    onChange={(event) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        zipCode: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-foreground outline-none"
                  />
                </div>

                <Button
                  className="h-12 w-full rounded-full text-base"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || validatingCart || cart.length === 0}
                >
                  {placingOrder || validatingCart ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reserving Stock...
                    </>
                  ) : (
                    "Reserve Fertilizer"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartCheckout;
