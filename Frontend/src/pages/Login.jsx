import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { GoogleLoginButton, GoogleOAuthWrapper } from "@/components/GoogleAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors[name];
        return nextErrors;
      });
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      if (formData.rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      navigate("/dashboard");
    }
  };

  const handleDemoLogin = async () => {
    setFormData({
      email: "raj@farm.com",
      password: "password123",
      rememberMe: false,
    });

    setLoading(true);
    const result = await login("raj@farm.com", "password123");
    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen grain-overlay">
      <Navbar />

      <div className="container mx-auto grid min-h-[calc(100vh-160px)] items-center gap-10 px-4 pb-20 pt-28 lg:grid-cols-[minmax(0,1fr)_460px]">
        <div className="hidden lg:block">
          <div className="section-shell p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Welcome back to FertiMax
            </div>
            <h1 className="max-w-xl font-display text-5xl font-bold leading-tight text-foreground">
              Return to your smarter farming workspace.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Access your advisor history, live product catalog, and order tracking
              from one clean dashboard.
            </p>
            <div className="mt-10 grid gap-4">
              {[
                ["Live Catalog", "Inventory and reviews connected to your backend"],
                ["Fast Orders", "Checkout and dashboard tracking in one flow"],
                ["Crop Insights", "Advisor tools built into the same account workspace"],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-[1.5rem] border border-primary/10 bg-white/80 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-primary/10 p-3">
                      <Leaf className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="surface-panel p-8 md:p-10">
          <h2 className="text-center font-display text-4xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Log in to manage your farm workflow and orders.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-xl border bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-primary"
                }`}
                placeholder="your@email.com"
              />
              {errors.email ? <p className="mt-1 text-sm text-red-500">{errors.email}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-xl border bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-primary"
                }`}
                placeholder="********"
              />
              {errors.password ? (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              ) : null}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" disabled={loading} className="w-full py-6 text-base">
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <div className="my-7 flex items-center">
            <div className="h-px flex-1 bg-border" />
            <span className="px-3 text-sm text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="mb-6 flex justify-center">
            <GoogleOAuthWrapper clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <GoogleLoginButton onSuccess={() => navigate("/dashboard")} />
            </GoogleOAuthWrapper>
          </div>

          <div className="rounded-[1.5rem] border border-leaf/20 bg-leaf/10 p-5">
            <p className="text-center text-sm text-muted-foreground">Want to explore quickly?</p>
            <Button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="mt-3 w-full bg-leaf text-leaf-foreground hover:bg-leaf/90"
            >
              Use Demo Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <p className="mt-7 text-center text-gray-600">
            Don&apos;t have an account?{" "}
            <Link to="/auth/register" className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
