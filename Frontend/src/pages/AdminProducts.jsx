import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Loader2,
  PencilLine,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/apiClient";

const defaultForm = {
  name: "",
  description: "",
  category: "Organic",
  price: "",
  stockQuantity: "",
  unit: "kg",
  bestFor: "",
  manufacturer: "",
  instructions: "",
};

const categoryOptions = [
  "Organic",
  "NPK Blends",
  "Micronutrients",
  "Bio Stimulants",
  "Soil Conditioners",
  "Foliar Sprays",
];

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adjustingProductId, setAdjustingProductId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [search, setSearch] = useState("");
  const [stockAdjustments, setStockAdjustments] = useState({});

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [productsResponse, lowStockResponse] = await Promise.all([
        apiClient.get("/admin/products", {
          params: { limit: 100, search: search || undefined },
        }),
        apiClient.get("/admin/products/low-stock"),
      ]);

      setProducts(productsResponse.data?.data || []);
      setLowStockProducts(lowStockResponse.data?.data || []);
    } catch (error) {
      toast({
        title: "Load failed",
        description: error.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const normalizedPayload = useMemo(
    () => ({
      ...form,
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity),
      bestFor: form.bestFor
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    }),
    [form]
  );

  const resetForm = () => {
    setForm(defaultForm);
    setEditingProductId(null);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (editingProductId) {
        await apiClient.put(`/admin/products/${editingProductId}`, normalizedPayload);
      } else {
        await apiClient.post("/admin/products", normalizedPayload);
      }

      resetForm();
      await loadProducts();
      toast({
        title: editingProductId ? "Product updated" : "Product created",
        description: editingProductId
          ? "Inventory changes were saved successfully."
          : "Product saved successfully.",
      });
    } catch (error) {
      toast({
        title: editingProductId ? "Update failed" : "Create failed",
        description: error.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProductId(product._id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "Organic",
      price: String(product.price ?? ""),
      stockQuantity: String(product.stockQuantity ?? ""),
      unit: product.unit || "kg",
      bestFor: Array.isArray(product.bestFor) ? product.bestFor.join(", ") : "",
      manufacturer: product.manufacturer || "",
      instructions: product.instructions || "",
    });
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/admin/products/${id}`);
      await loadProducts();
      toast({ title: "Product deleted", description: "Inventory updated." });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error.data?.message || error.message,
        variant: "destructive",
      });
    }
  };

  const handleStockAdjustment = async (productId, action) => {
    const quantity = Number(stockAdjustments[productId] || 0);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Enter a stock quantity greater than zero.",
        variant: "destructive",
      });
      return;
    }

    try {
      setAdjustingProductId(productId);
      await apiClient.patch(`/admin/products/${productId}/stock`, {
        action,
        quantity,
      });
      setStockAdjustments((prev) => ({ ...prev, [productId]: "" }));
      await loadProducts();
      toast({
        title: "Stock updated",
        description: `Inventory ${action === "add" ? "increased" : "reduced"} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Stock update failed",
        description: error.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setAdjustingProductId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8f0d9_0%,#edf5e8_45%,#f6f4ef_100%)]">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 space-y-8">
          <section className="section-shell overflow-hidden px-6 py-8 md:px-8 lg:px-10">
            <div className="organic-orb -left-12 top-8 h-36 w-36 bg-gold/20" />
            <div className="organic-orb right-0 top-0 h-48 w-48 bg-leaf/20" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_340px]">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary/75">
                  Admin inventory
                </p>
                <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                  Manage products with a cleaner inventory workflow.
                </h1>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
                  Create, edit, search, and adjust stock from one place while keeping
                  product data aligned with the live MongoDB-backed catalog.
                </p>
              </div>

              <div className="surface-panel relative z-10 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      label: "Products",
                      value: products.length,
                      icon: Boxes,
                    },
                    {
                      label: "Low stock",
                      value: lowStockProducts.length,
                      icon: AlertTriangle,
                    },
                  ].map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="rounded-[1.4rem] border border-primary/10 bg-white/80 p-5 shadow-soft"
                    >
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-2 font-display text-3xl text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <Card className="overflow-hidden border-white/60 bg-white/80 shadow-strong">
            <CardHeader className="border-b border-primary/10 bg-[linear-gradient(135deg,rgba(89,126,82,0.10),rgba(255,255,255,0.82))]">
              <CardTitle className="font-display text-2xl text-foreground">
                {editingProductId ? "Edit Product" : "Create Product"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-4">
              <input
                type="text"
                placeholder="Product name"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="h-12 rounded-2xl border border-primary/10 bg-white px-4 text-foreground outline-none"
              />
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, category: event.target.value }))
                }
                className="h-12 rounded-2xl border border-primary/10 bg-white px-4 text-foreground outline-none"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, price: event.target.value }))
                }
                className="h-12 rounded-2xl border border-primary/10 bg-white px-4 text-foreground outline-none"
              />
              <input
                type="number"
                placeholder="Stock quantity"
                value={form.stockQuantity}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, stockQuantity: event.target.value }))
                }
                className="h-12 rounded-2xl border border-primary/10 bg-white px-4 text-foreground outline-none"
              />
              <input
                type="text"
                placeholder="Best for, comma separated"
                value={form.bestFor}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, bestFor: event.target.value }))
                }
                className="h-12 rounded-2xl border border-primary/10 bg-white px-4 text-foreground outline-none md:col-span-2"
              />
              <input
                type="text"
                placeholder="Manufacturer"
                value={form.manufacturer}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, manufacturer: event.target.value }))
                }
                className="h-12 rounded-2xl border border-primary/10 bg-white px-4 text-foreground outline-none"
              />
              <select
                value={form.unit}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, unit: event.target.value }))
                }
                className="h-12 rounded-2xl border border-primary/10 bg-white px-4 text-foreground outline-none"
              >
                {["kg", "liter", "gram", "ml"].map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <textarea
                rows={4}
                placeholder="Description"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                className="rounded-[1.4rem] border border-primary/10 bg-white px-4 py-4 text-foreground outline-none md:col-span-2"
              />
              <textarea
                rows={4}
                placeholder="Instructions"
                value={form.instructions}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, instructions: event.target.value }))
                }
                className="rounded-[1.4rem] border border-primary/10 bg-white px-4 py-4 text-foreground outline-none md:col-span-2"
              />
              <div className="md:col-span-2 lg:col-span-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="rounded-full"
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {editingProductId ? (
                      <Save className="mr-2 h-4 w-4" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {saving
                      ? editingProductId
                        ? "Saving..."
                        : "Creating..."
                      : editingProductId
                        ? "Save Changes"
                        : "Create Product"}
                  </Button>
                  {editingProductId ? (
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={resetForm}
                      disabled={saving}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel Edit
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-white/60 bg-white/80 shadow-strong">
            <CardHeader className="border-b border-primary/10 bg-[linear-gradient(135deg,rgba(212,176,82,0.10),rgba(255,255,255,0.85))]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle className="font-display text-2xl text-foreground">
                  Inventory
                </CardTitle>
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-12 w-full rounded-full border border-primary/10 bg-white pl-11 pr-4 text-sm text-foreground outline-none"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              {lowStockProducts.length > 0 ? (
                <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50/90 p-5">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900">Low stock alert</p>
                      <p className="text-sm text-amber-800">
                        {lowStockProducts
                          .map((product) => `${product.name} (${product.stockQuantity})`)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="rounded-[1.4rem] border border-primary/10 bg-primary/5 p-4 text-sm text-muted-foreground">
                Use `Deduct Stock` for offline counter collections or manual walk-in sales. Online customer bookings reserve stock automatically through the reservation workflow.
              </div>

              {loading ? (
                <div className="py-12 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="rounded-[1.5rem] border border-primary/10 bg-white/90 p-5 shadow-soft"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="font-semibold text-foreground">{product.name}</p>
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              {product.category}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Rs.{Number(product.price).toFixed(2)} | Stock {product.stockQuantity}{" "}
                            {product.unit}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {product.description}
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 xl:min-w-[340px] xl:items-end">
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="number"
                              min="1"
                              placeholder="Qty"
                              value={stockAdjustments[product._id] || ""}
                              onChange={(event) =>
                                setStockAdjustments((prev) => ({
                                  ...prev,
                                  [product._id]: event.target.value,
                                }))
                              }
                              className="h-11 w-24 rounded-full border border-primary/10 bg-white px-4 text-sm text-foreground outline-none"
                            />
                            <Button
                              variant="outline"
                              className="rounded-full"
                              onClick={() => handleStockAdjustment(product._id, "add")}
                              disabled={adjustingProductId === product._id}
                            >
                              Add Stock
                            </Button>
                            <Button
                              variant="outline"
                              className="rounded-full"
                              onClick={() => handleStockAdjustment(product._id, "deduct")}
                              disabled={adjustingProductId === product._id}
                            >
                              Deduct Stock
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              className="rounded-full"
                              onClick={() => handleEdit(product)}
                            >
                              <PencilLine className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              className="rounded-full"
                              onClick={() => handleDelete(product._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {products.length === 0 ? (
                    <div className="rounded-[1.4rem] border border-dashed border-primary/15 bg-white/75 p-8 text-center text-muted-foreground">
                      No products found for the current search.
                    </div>
                  ) : null}
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

export default AdminProducts;
