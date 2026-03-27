import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Leaf, LogOut, ShoppingCart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/fertimax-logo.png";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/crop-advisor", label: "AI Crop Advisor" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();
  const homePath = isAuthenticated ? "/home" : "/";
  const resolvedNavLinks = navLinks.map((link) =>
    link.to === "/" ? { ...link, to: homePath } : link
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/30 bg-cream/70 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to={homePath} className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/80 p-2 shadow-soft ring-1 ring-primary/10">
              <img src={logo} alt="FertiMax" className="h-9 w-9" width={36} height={36} />
            </div>
            <div>
              <span className="block font-display text-xl font-bold text-primary">FertiMax</span>
              <span className="block text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Smart Agriculture
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 rounded-full border border-white/60 bg-white/60 p-1 shadow-soft">
            {resolvedNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground hover:bg-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {loading ? null : !isAuthenticated ? (
              <>
                <Button variant="outline" size="sm" className="border-white/70 bg-white/60" asChild>
                  <Link to="/auth/login">Log In</Link>
                </Button>
                <Button variant="default" size="sm" className="shadow-soft" asChild>
                  <Link to="/auth/register">Sign Up</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="border-white/70 bg-white/60" asChild>
                  <Link to="/cart">Cart ({cartItemCount})</Link>
                </Button>
                <Button variant="outline" size="sm" className="border-white/70 bg-white/60" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                {user?.role === "admin" && (
                  <Button variant="outline" size="sm" className="border-white/70 bg-white/60" asChild>
                    <Link to="/admin/products">
                      <Shield className="w-4 h-4 mr-1" />
                      Admin
                    </Link>
                  </Button>
                )}
                {user?.role === "admin" && (
                  <Button variant="outline" size="sm" className="border-white/70 bg-white/60" asChild>
                    <Link to="/admin/orders">Orders</Link>
                  </Button>
                )}
                <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-4 py-2 shadow-soft">
                  <span className="text-sm font-medium text-foreground">
                    {user?.name || user?.email}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button variant="hero" size="lg" asChild>
              <Link to="/crop-advisor">
                <Leaf className="w-4 h-4" />
                AI Advisor
              </Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden rounded-xl border border-white/60 bg-white/65 p-2 shadow-soft"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden mt-3 rounded-[1.5rem] border border-white/50 bg-white/80 p-4 shadow-medium animate-fade-in-up">
            {resolvedNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 px-4 space-y-2">
              {loading ? null : !isAuthenticated ? (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth/login" onClick={() => setIsOpen(false)}>
                      Log In
                    </Link>
                  </Button>
                  <Button variant="default" className="w-full" asChild>
                    <Link to="/auth/register" onClick={() => setIsOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="default" className="w-full" asChild>
                    <Link to="/cart" onClick={() => setIsOpen(false)}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Cart ({cartItemCount})
                    </Link>
                  </Button>
                  <Button variant="default" className="w-full" asChild>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  {user?.role === "admin" && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/admin/products" onClick={() => setIsOpen(false)}>
                        <Shield className="w-4 h-4 mr-2" />
                        Admin
                      </Link>
                    </Button>
                  )}
                  {user?.role === "admin" && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/admin/orders" onClick={() => setIsOpen(false)}>
                        Orders
                      </Link>
                    </Button>
                  )}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm font-medium">
                    {user?.name || user?.email}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </Button>
                </>
              )}
              <Button variant="hero" className="w-full" asChild>
                <Link to="/crop-advisor" onClick={() => setIsOpen(false)}>
                  <Leaf className="w-4 h-4" />
                  AI Advisor
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
