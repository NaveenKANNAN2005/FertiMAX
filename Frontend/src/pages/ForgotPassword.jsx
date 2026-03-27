import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/apiClient";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResetUrl("");

    try {
      const response = await apiClient.post("/users/forgot-password", { email });
      setSubmitted(true);
      setMessage(
        response.data?.message ||
          "If the account exists, password reset instructions have been generated."
      );
      setResetUrl(response.data?.data?.resetUrl || "");
    } catch (requestError) {
      setError(requestError.data?.message || requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3 text-center">
            Reset Password
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Enter your email address and we will generate a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                placeholder="your@email.com"
                required
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {submitted ? <p className="text-sm text-green-700">{message}</p> : null}

            {resetUrl ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Development reset link:
                <div className="mt-2 break-all">
                  <Link className="underline" to={resetUrl.replace(/^https?:\/\/[^/]+/, "")}>
                    {resetUrl}
                  </Link>
                </div>
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Generating Link..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/auth/login">Back to Login</Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
