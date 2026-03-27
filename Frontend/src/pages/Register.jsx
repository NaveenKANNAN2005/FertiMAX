import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sprout, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { GoogleLoginButton, GoogleOAuthWrapper } from "@/components/GoogleAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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

    if (!formData.name.trim()) {
      nextErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
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
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: "",
      farmSize: 0,
      cropTypes: [],
      soilType: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    });
    setLoading(false);

    if (result.success) {
      toast({
        title: "Success",
        description: "Account created! Redirecting to dashboard...",
        variant: "default",
      });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen grain-overlay">
      <Navbar />

      <div className="container mx-auto grid min-h-[calc(100vh-160px)] items-center gap-10 px-4 pb-20 pt-28 lg:grid-cols-[420px_minmax(0,1fr)]">
        <div className="surface-panel p-8 md:p-10">
          <h2 className="text-center font-display text-4xl font-bold text-gray-900">
            Join FertiMax
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Create your account and start using the full farm workflow.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-xl border bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-primary"
                }`}
                placeholder="John Farmer"
              />
              {errors.name ? <p className="mt-1 text-sm text-red-500">{errors.name}</p> : null}
            </div>

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

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full rounded-xl border bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-primary"
                }`}
                placeholder="********"
              />
              {errors.confirmPassword ? (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              ) : null}
            </div>

            <Button type="submit" disabled={loading} className="w-full py-6 text-base">
              {loading ? "Creating Account..." : "Sign Up"}
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

          <p className="text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/auth/login" className="font-semibold text-primary hover:underline">
              Log In
            </Link>
          </p>
        </div>

        <div className="hidden lg:block">
          <div className="section-shell p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Start your farm workspace
            </div>
            <h1 className="max-w-xl font-display text-5xl font-bold leading-tight text-foreground">
              Build a cleaner digital workflow for your crops.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Create an account to manage crop insights, orders, and inventory-backed
              recommendations from one place.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                ["Advisor", "Personalized crop and dosage guidance"],
                ["Orders", "Track every purchase from cart to delivery"],
                ["Reviews", "Build trust with stored product feedback"],
                ["Profile", "Keep farm and address details ready for checkout"],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-[1.5rem] border border-primary/10 bg-white/80 p-5"
                >
                  <div className="mb-3 inline-flex rounded-2xl bg-primary/10 p-3">
                    <Sprout className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Register;
