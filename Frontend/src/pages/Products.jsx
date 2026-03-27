import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Leaf, Star, Loader2, ShoppingCart, MessageSquare, Plus, Minus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import apiClient from "@/lib/apiClient";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const allCategories = [
  "All",
  "Organic",
  "NPK Blends",
  "Micronutrients",
  "Bio Stimulants",
  "Soil Conditioners",
  "Foliar Sprays",
];

const emptyShipping = {
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "India",
};

const formatBestFor = (bestFor) => {
  if (!bestFor || bestFor.length === 0) {
    return "General use";
  }

  return Array.isArray(bestFor) ? bestFor.join(", ") : bestFor;
};

const Products = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { cart, total, addToCart, getCartItem, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeProductId, setActiveProductId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [shippingAddress, setShippingAddress] = useState(emptyShipping);
  const [contactPhone, setContactPhone] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/products?limit=50");
        setProducts(response.data?.data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load products:", err);
        setError("Unable to load products from the database.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    setShippingAddress((prev) => ({
      street: prev.street || user?.address || "",
      city: prev.city || user?.city || "",
      state: prev.state || user?.state || "",
      zipCode: prev.zipCode || user?.zipCode || "",
      country: prev.country || "India",
    }));
    setContactPhone((prev) => prev || user?.phone || "");
  }, [user]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!activeProductId) {
        return;
      }

      try {
        setReviewsLoading(true);
        const response = await apiClient.get(`/reviews/product/${activeProductId}`);
        setReviews(response.data?.data || []);
      } catch (err) {
        console.error("Failed to load reviews:", err);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [activeProductId]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      if (!normalizedQuery) {
        return matchesCategory;
      }

      const haystack = [
        product.name,
        product.description,
        product.category,
        ...(product.bestFor || []),
        product.manufacturer,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && haystack.includes(normalizedQuery);
    });
  }, [products, searchQuery, selectedCategory]);

  const activeProduct = useMemo(
    () => products.find((product) => product._id === activeProductId) || null,
    [products, activeProductId]
  );

  const ownReview = useMemo(
    () => reviews.find((review) => review.user?._id === user?._id) || null,
    [reviews, user?._id]
  );

  const getSelectedQuantity = (productId) => {
    return selectedQuantities[productId] || 1;
  };

  const updateSelectedQuantity = (product, nextQuantity) => {
    const safeQuantity = Math.min(
      Math.max(Number(nextQuantity) || 1, 1),
      Math.max(Number(product.stockQuantity) || 1, 1)
    );

    setSelectedQuantities((prev) => ({
      ...prev,
      [product._id]: safeQuantity,
    }));
  };

  const handleAddToCart = (product) => {
    const quantity = getSelectedQuantity(product._id);
    addToCart(product, quantity);
    const existingItem = getCartItem(product._id);

    toast({
      title: existingItem ? "Cart updated" : "Added to cart",
      description: `${quantity} unit(s) of ${product.name} added to cart.`,
    });

    setSelectedQuantities((prev) => ({
      ...prev,
      [product._id]: 1,
    }));
  };

  const openReviews = (product) => {
    setActiveProductId(product._id);
    setReviewForm({ rating: 5, comment: "" });
    setEditingReviewId(null);
  };

  const resetReviewForm = () => {
    setReviewForm({ rating: 5, comment: "" });
    setEditingReviewId(null);
  };

  const handleReviewSubmit = async () => {
    if (!activeProduct) {
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Sign in to submit a product review.",
        variant: "destructive",
      });
      navigate("/auth/login");
      return;
    }

    if (reviewForm.comment.trim().length < 10) {
      toast({
        title: "Review too short",
        description: "Please enter at least 10 characters.",
        variant: "destructive",
      });
      return;
    }

    try {
      const targetReviewId = editingReviewId || ownReview?._id;

      if (targetReviewId) {
        await apiClient.put(`/reviews/${targetReviewId}`, {
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
          title: `${activeProduct.name} review`,
        });
      } else {
        await apiClient.post("/reviews", {
          productId: activeProduct._id,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
          title: `${activeProduct.name} review`,
        });
      }

      const response = await apiClient.get(`/reviews/product/${activeProduct._id}`);
      setReviews(response.data?.data || []);
      resetReviewForm();
      toast({
        title: targetReviewId ? "Review updated" : "Review saved",
        description: targetReviewId
          ? "Your review has been updated in MongoDB."
          : "Your review has been added to MongoDB.",
      });
    } catch (error) {
      toast({
        title: "Review failed",
        description: error.data?.message || error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review._id);
    setReviewForm({
      rating: review.rating,
      comment: review.comment || "",
    });
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      setDeletingReviewId(reviewId);
      await apiClient.delete(`/reviews/${reviewId}`);
      const response = await apiClient.get(`/reviews/product/${activeProduct._id}`);
      setReviews(response.data?.data || []);
      if (editingReviewId === reviewId) {
        resetReviewForm();
      }
      toast({
        title: "Review deleted",
        description: "Your review has been removed.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add products before placing an order.",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please sign in before placing an order.",
        variant: "destructive",
      });
      navigate("/auth/login");
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
        description: "Your fertilizer has been reserved and is visible in the dashboard.",
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
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="section-shell mb-12 overflow-hidden p-8 md:p-12">
            <div className="organic-orb -left-8 top-10 h-40 w-40 bg-gold/15" />
            <div className="organic-orb right-0 top-0 h-44 w-44 bg-leaf/20" />
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="mb-4 font-display text-4xl font-bold md:text-5xl">Our Products</h1>
              <p className="text-lg text-muted-foreground">
                Live catalog, reviews, and reservation flows connected to your backend data.
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder='Search by crop, category, or product name'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-soft font-body text-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                <Leaf className="w-3 h-3" />
                Live Data
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8">
            <div>
              {loading ? (
                <div className="py-16 text-center">
                  <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading products from MongoDB...</p>
                </div>
              ) : error ? (
                <div className="max-w-2xl mx-auto rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                  <p className="text-red-700">{error}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        className="group relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/75 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-strong"
                      >
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-accent" />
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                            {product.category}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-gold">
                            <Star className="w-4 h-4 fill-current" />
                            {product.rating?.toFixed(1) || "0.0"}
                          </div>
                        </div>

                    <Link to={`/products/${product._id}`}>
                      <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          {product.description}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          <span className="font-medium text-foreground">Best for:</span>{" "}
                          {formatBestFor(product.bestFor)}
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          <span className="font-medium text-foreground">Stock:</span>{" "}
                          {product.stockQuantity} {product.unit}
                        </p>

                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="text-xs font-medium text-muted-foreground">Quantity</span>
                          <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() =>
                                updateSelectedQuantity(
                                  product,
                                  getSelectedQuantity(product._id) - 1
                                )
                              }
                              disabled={product.stockQuantity <= 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="min-w-8 text-center text-sm font-semibold text-foreground">
                              {getSelectedQuantity(product._id)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() =>
                                updateSelectedQuantity(
                                  product,
                                  getSelectedQuantity(product._id) + 1
                                )
                              }
                              disabled={product.stockQuantity <= 0}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 mb-3">
                          <span className="font-display text-2xl font-bold text-primary">
                            Rs.{Number(product.price).toFixed(2)}
                          </span>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stockQuantity <= 0}
                          >
                            {product.stockQuantity <= 0 ? "Out of Stock" : "Add to Cart"}
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/products/${product._id}`}>Details</Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => openReviews(product)}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Reviews
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-16">
                      <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-display text-xl font-semibold mb-2">No products found</h3>
                      <p className="text-muted-foreground">
                        Try a different search term or category.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-6">
              <Card className="sticky top-28 border-white/50 bg-white/80 shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    Cart and Reservation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div
                            key={item.cartItemId}
                            className="rounded-[1.25rem] border border-primary/10 bg-white/80 p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Rs.{Number(item.price).toFixed(2)} each
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => removeFromCart(item.cartItemId)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="min-w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-[1.25rem] bg-gradient-to-br from-primary/10 to-gold/10 p-4">
                        <p className="font-semibold text-lg">Total: Rs.{total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Reservations are stored through `/api/orders` in MongoDB.
                        </p>
                        <Button variant="outline" className="mt-3" asChild>
                          <Link to="/cart">Open dedicated checkout</Link>
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Phone number"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Street address (optional)"
                          value={shippingAddress.street}
                          onChange={(e) =>
                            setShippingAddress((prev) => ({ ...prev, street: e.target.value }))
                          }
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                        <input
                          type="text"
                          placeholder="City / area"
                          value={shippingAddress.city}
                          onChange={(e) =>
                            setShippingAddress((prev) => ({ ...prev, city: e.target.value }))
                          }
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="State"
                            value={shippingAddress.state}
                            onChange={(e) =>
                              setShippingAddress((prev) => ({ ...prev, state: e.target.value }))
                            }
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                          />
                          <input
                            type="text"
                            placeholder="ZIP code"
                            value={shippingAddress.zipCode}
                            onChange={(e) =>
                              setShippingAddress((prev) => ({ ...prev, zipCode: e.target.value }))
                            }
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                          />
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={handlePlaceOrder}
                        disabled={placingOrder}
                      >
                        {placingOrder ? "Reserving..." : "Reserve Fertilizer"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {activeProduct && (
                <Card className="border-white/50 bg-white/80 shadow-medium">
                  <CardHeader>
                    <CardTitle>{activeProduct.name} Reviews</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reviewsLoading ? (
                      <div className="text-center py-6">
                        <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />
                      </div>
                    ) : reviews.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No reviews yet for this product.</p>
                    ) : (
                      <div className="space-y-3">
                        {reviews.map((review) => (
                          <div key={review._id} className="rounded-lg border border-border p-3">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{review.user?.name || "User"}</p>
                              <p className="text-sm text-gold">{review.rating}/5</p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                            {review.user?._id === user?._id && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditReview(review)}>
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteReview(review._id)}
                                  disabled={deletingReviewId === review._id}
                                >
                                  {deletingReviewId === review._id ? "Deleting..." : "Delete"}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-3 border-t border-border pt-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">
                          {editingReviewId || ownReview ? "Update your review" : "Write a review"}
                        </p>
                        {editingReviewId && (
                          <Button variant="ghost" size="sm" onClick={resetReviewForm}>
                            Cancel
                          </Button>
                        )}
                      </div>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) =>
                          setReviewForm((prev) => ({ ...prev, rating: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      >
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <option key={rating} value={rating}>
                            {rating} stars
                          </option>
                        ))}
                      </select>
                      <textarea
                        rows={4}
                        value={reviewForm.comment}
                        onChange={(e) =>
                          setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                        }
                        placeholder="Share your experience with this product"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
                      />
                      <Button className="w-full" onClick={handleReviewSubmit}>
                        {editingReviewId || ownReview ? "Update Review" : "Save Review"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products;
