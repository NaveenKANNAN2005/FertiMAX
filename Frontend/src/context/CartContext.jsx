import { createContext, useContext, useState, useCallback, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCart(parsedCart);
        calculateTotal(parsedCart);
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    calculateTotal(cart);
  }, [cart]);

  const calculateTotal = (cartItems) => {
    const newTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotal(newTotal);
  };

  const addToCart = useCallback((product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      const maxQuantity =
        typeof product.stockQuantity === "number" && product.stockQuantity > 0
          ? product.stockQuantity
          : Number.POSITIVE_INFINITY;

      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, maxQuantity),
                stockQuantity:
                  typeof product.stockQuantity === "number"
                    ? product.stockQuantity
                    : item.stockQuantity,
              }
            : item
        );
      }

      return [
        ...prevCart,
        {
          ...product,
          quantity: Math.min(quantity, maxQuantity),
          cartItemId: `${product._id}-${Date.now()}`,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((cartItemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity:
                typeof item.stockQuantity === "number" && item.stockQuantity > 0
                  ? Math.min(newQuantity, item.stockQuantity)
                  : newQuantity,
            }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setTotal(0);
    localStorage.removeItem("cart");
  }, []);

  const getCartItemCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const getCartItem = useCallback(
    (productId) => {
      return cart.find((item) => item._id === productId);
    },
    [cart]
  );

  const value = {
    cart,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount,
    getCartItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
