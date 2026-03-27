import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Leaf,
  Loader2,
  MessageSquare,
  Minus,
  PencilLine,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import apiClient from "@/lib/apiClient";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingReview, setSavingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [productResponse, reviewResponse] = await Promise.all([
        apiClient.get(`/products/${id}`),
        apiClient.get(`/reviews/product/${id}`),
      ]);

      setProduct(productResponse.data?.data || null);
      setReviews(reviewResponse.data?.data || []);
    } catch (error) {
      console.error("Failed to load product detail:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setSelectedQuantity(1);
  }, [product?._id]);

  const ownReview = useMemo(
    () => reviews.find((review) => review.user?._id === user?._id) || null,
    [reviews, user?._id]
  );

  const highlights = useMemo(() => {
    if (!product) {
      return [];
    }

    return [
      product.manufacturer ? `Made by ${product.manufacturer}` : "Trusted farm-grade formula",
      product.instructions || "Application guidance available after purchase",
      product.stockQuantity > 0
        ? `${product.stockQuantity} ${product.unit} currently available`
        : "Currently unavailable for dispatch",
    ];
  }, [product]);

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    addToCart(product, selectedQuantity);
    toast({
      title: "Added to cart",
      description: `${selectedQuantity} unit(s) of ${product.name} added to your cart.`,
    });

    setSelectedQuantity(1);
  };

  const resetReviewForm = () => {
    setReviewForm({ rating: 5, comment: "" });
    setEditingReviewId(null);
  };

  const handleReviewSubmit = async () => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    if (reviewForm.comment.trim().length < 10) {
      toast({
        title: "Review too short",
        description: "Enter at least 10 characters.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingReview(true);
      const targetReviewId = editingReviewId || ownReview?._id;

      if (targetReviewId) {
        await apiClient.put(`/reviews/${targetReviewId}`, {
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
          title: `${product.name} review`,
        });
      } else {
        await apiClient.post("/reviews", {
          productId: id,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
          title: `${product.name} review`,
        });
      }

      await load();
      resetReviewForm();
      toast({
        title: targetReviewId ? "Review updated" : "Review saved",
        description: targetReviewId
          ? "Your review was updated successfully."
          : "Your review was added successfully.",
      });
    } catch (error) {
      toast({
        title: "Review failed",
        description: error.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setSavingReview(false);
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
      await load();

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8f3df_0%,#edf5e8_40%,#f7f5ef_100%)]">
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
              Back to Products
            </Link>
          </Button>

          {loading ? (
            <div className="section-shell py-20 text-center">
              <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading product...</p>
            </div>
          ) : !product ? (
            <div className="section-shell py-20 text-center">
              <p className="text-muted-foreground">Product not found.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <section className="section-shell overflow-hidden px-6 py-8 md:px-8 lg:px-10">
                <div className="organic-orb -left-12 top-4 h-40 w-40 bg-gold/20" />
                <div className="organic-orb right-0 top-0 h-48 w-48 bg-leaf/20" />

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_360px]">
                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                        <Leaf className="h-4 w-4" />
                        {product.category}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm text-muted-foreground">
                        <Sparkles className="h-4 w-4 text-gold" />
                        Field-tested product profile
                      </span>
                    </div>

                    <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                      {product.name}
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                      {product.description}
                    </p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        ["Price", `Rs.${Number(product.price).toFixed(2)}`],
                        ["Stock", `${product.stockQuantity} ${product.unit}`],
                        ["Rating", `${product.rating?.toFixed(1) || "0.0"} / 5`],
                        ["Reviews", String(reviews.length)],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-[1.6rem] border border-primary/10 bg-white/80 p-5 shadow-soft"
                        >
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            {label}
                          </p>
                          <p className="mt-3 font-display text-2xl text-foreground">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 grid gap-3 md:grid-cols-3">
                      {highlights.map((item) => (
                        <div
                          key={item}
                          className="rounded-[1.3rem] border border-primary/10 bg-white/80 p-4 text-sm text-muted-foreground"
                        >
                          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <p className="leading-6">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <aside className="surface-panel relative z-10 p-6 md:p-7">
                    <div className="rounded-[1.4rem] border border-gold/20 bg-gold/10 p-4">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-gold shadow-soft">
                          <Star className="h-5 w-5 fill-current" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Community rating</p>
                          <p className="font-display text-3xl text-foreground">
                            {product.rating?.toFixed(1) || "0.0"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="rounded-[1.3rem] border border-primary/10 bg-white/75 p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          Quantity
                        </p>
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full"
                            onClick={() =>
                              setSelectedQuantity((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={product.stockQuantity <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="min-w-10 text-center font-semibold text-foreground">
                            {selectedQuantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full"
                            onClick={() =>
                              setSelectedQuantity((prev) =>
                                Math.min(prev + 1, Math.max(Number(product.stockQuantity) || 1, 1))
                              )
                            }
                            disabled={product.stockQuantity <= 0}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Available stock: {product.stockQuantity} {product.unit}
                        </p>
                      </div>

                      <div className="rounded-[1.3rem] border border-primary/10 bg-white/75 p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          Best for
                        </p>
                        <p className="mt-3 text-sm leading-6 text-foreground">
                          {(product.bestFor || []).join(", ") || "General crop support"}
                        </p>
                      </div>
                      <div className="rounded-[1.3rem] border border-primary/10 bg-white/75 p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          Application
                        </p>
                        <p className="mt-3 text-sm leading-6 text-foreground">
                          {product.instructions || "Refer to advisor guidance for precise dosage."}
                        </p>
                      </div>
                      <div className="rounded-[1.3rem] border border-primary/10 bg-white/75 p-4">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          Stock and review data are connected to your live backend.
                        </div>
                      </div>
                    </div>

                    <Button
                      className="mt-6 h-12 w-full rounded-full text-base"
                      onClick={handleAddToCart}
                      disabled={product.stockQuantity <= 0}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {product.stockQuantity <= 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                    <Button
                      className="mt-3 h-12 w-full rounded-full"
                      variant="outline"
                      asChild
                    >
                      <Link to="/cart">Open Checkout</Link>
                    </Button>
                  </aside>
                </div>
              </section>

              <div className="grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <Card className="overflow-hidden border-white/60 bg-white/80 shadow-strong">
                  <CardHeader className="border-b border-primary/10 bg-[linear-gradient(135deg,rgba(89,126,82,0.10),rgba(212,176,82,0.06))]">
                    <CardTitle className="font-display text-2xl text-foreground">
                      Product Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 p-6">
                    <div className="rounded-[1.4rem] border border-primary/10 bg-white/80 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        Planning
                      </p>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        Use this product when your crop plan matches the listed application
                        profile and stock is available for immediate fulfilment.
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] border border-primary/10 bg-white/80 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        Trust signal
                      </p>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        Reviews here are live and persisted through the backend, so customers
                        see actual field feedback rather than placeholder content.
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] border border-primary/10 bg-primary/5 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-primary/80">
                        Workflow
                      </p>
                      <p className="mt-3 text-sm leading-7 text-foreground">
                        Pair product selection with the crop advisor, then move straight into
                        checkout from this page for a tighter purchase flow.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-white/60 bg-white/80 shadow-strong">
                  <CardHeader className="border-b border-primary/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.75),rgba(89,126,82,0.08))]">
                    <CardTitle className="flex items-center gap-2 font-display text-2xl text-foreground">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 p-6">
                    {reviews.length === 0 ? (
                      <div className="rounded-[1.4rem] border border-dashed border-primary/15 bg-white/75 p-6 text-sm text-muted-foreground">
                        No reviews yet. Be the first to share your field experience.
                      </div>
                    ) : (
                      reviews.map((review) => (
                        <div
                          key={review._id}
                          className="rounded-[1.4rem] border border-primary/10 bg-white/85 p-5 shadow-soft"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-semibold text-foreground">
                                {review.user?.name || "User"}
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Verified platform review
                              </p>
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-3 py-1 text-sm font-medium text-gold">
                              <Star className="h-4 w-4 fill-current" />
                              {review.rating}/5
                            </div>
                          </div>

                          <p className="mt-4 text-sm leading-7 text-muted-foreground">
                            {review.comment}
                          </p>

                          {review.user?._id === user?._id ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                onClick={() => handleEditReview(review)}
                              >
                                <PencilLine className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="rounded-full"
                                onClick={() => handleDeleteReview(review._id)}
                                disabled={deletingReviewId === review._id}
                              >
                                {deletingReviewId === review._id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Delete
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      ))
                    )}

                    <div className="rounded-[1.6rem] border border-primary/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(237,245,232,0.95))] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">
                            {editingReviewId
                              ? "Edit your review"
                              : ownReview
                                ? "Update your review"
                                : "Add your review"}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Write a short, field-focused review for other buyers.
                          </p>
                        </div>
                        {editingReviewId ? (
                          <Button variant="ghost" size="sm" onClick={resetReviewForm}>
                            Cancel
                          </Button>
                        ) : null}
                      </div>

                      <div className="mt-5 grid gap-4">
                        <select
                          value={reviewForm.rating}
                          onChange={(event) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              rating: event.target.value,
                            }))
                          }
                          className="h-12 rounded-2xl border border-primary/10 bg-white px-4 text-foreground outline-none ring-0"
                        >
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <option key={rating} value={rating}>
                              {rating} stars
                            </option>
                          ))}
                        </select>
                        <textarea
                          rows={5}
                          value={reviewForm.comment}
                          onChange={(event) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              comment: event.target.value,
                            }))
                          }
                          className="min-h-[150px] rounded-[1.4rem] border border-primary/10 bg-white px-4 py-4 text-foreground outline-none"
                          placeholder="Tell other farmers how the product performed, what crop you used it on, and whether the instructions matched the result."
                        />
                        <Button
                          className="h-12 rounded-full"
                          onClick={handleReviewSubmit}
                          disabled={savingReview}
                        >
                          {savingReview
                            ? "Saving Review..."
                            : editingReviewId || ownReview
                              ? "Update Review"
                              : "Submit Review"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
