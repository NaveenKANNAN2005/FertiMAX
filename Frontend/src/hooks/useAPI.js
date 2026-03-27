import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for fetching all products
 */
export const useProducts = (options = {}) => {
  return useQuery({
    queryKey: ["products", options],
    queryFn: async () => {
      const params = new URLSearchParams(options);
      const response = await apiClient.get(`/products?${params}`);
      return response.data.data;
    },
  });
};

/**
 * Hook for fetching single product
 */
export const useProduct = (productId) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const response = await apiClient.get(`/products/${productId}`);
      return response.data.data;
    },
    enabled: !!productId,
  });
};

/**
 * Hook for searching products
 */
export const useSearchProducts = (query) => {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: async () => {
      const response = await apiClient.get(`/products/search?q=${query}`);
      return response.data.data;
    },
    enabled: !!query,
  });
};

/**
 * Hook for creating product (Admin)
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productData) => {
      const response = await apiClient.post("/products", productData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Success",
        description: "Product created successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for updating product (Admin)
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ productId, data }) => {
      const response = await apiClient.put(`/products/${productId}`, data);
      return response.data.data;
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", product._id] });
      toast({
        title: "Success",
        description: "Product updated successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for deleting product (Admin)
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productId) => {
      const response = await apiClient.delete(`/products/${productId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for fetching recommendations
 */
export const useGetRecommendations = (params) => {
  return useQuery({
    queryKey: ["recommendations", params],
    queryFn: async () => {
      const response = await apiClient.post("/recommendations", params);
      return response.data.data;
    },
    enabled: !!params,
  });
};

/**
 * Hook for fetching user recommendations
 */
export const useUserRecommendations = (enabled = true) => {
  return useQuery({
    queryKey: ["recommendations", "user"],
    queryFn: async () => {
      const response = await apiClient.get("/recommendations/user");
      return response.data.data;
    },
    enabled,
  });
};

/**
 * Hook for creating order
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orderData) => {
      const response = await apiClient.post("/orders", orderData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Success",
        description: "Order created successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create order",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for fetching user orders
 */
export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await apiClient.get("/orders/my-orders");
      return response.data.data;
    },
  });
};

/**
 * Hook for fetching single order
 */
export const useOrder = (orderId) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data.data;
    },
    enabled: !!orderId,
  });
};

/**
 * Hook for creating review
 */
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reviewData) => {
      const response = await apiClient.post("/reviews", reviewData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({
        title: "Success",
        description: "Review posted successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post review",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for fetching product reviews
 */
export const useProductReviews = (productId) => {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const response = await apiClient.get(`/reviews/product/${productId}`);
      return response.data.data;
    },
    enabled: !!productId,
  });
};
