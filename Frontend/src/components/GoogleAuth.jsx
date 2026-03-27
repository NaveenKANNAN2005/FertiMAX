import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

/**
 * Google OAuth Button Component
 * Handles Google login with custom styling
 */
export const GoogleLoginButton = ({ onSuccess, onError, style = "filled_blue" }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setSession } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await apiClient.post("/auth/google/verify-token", {
        token: credentialResponse.credential,
      });
      const payload = response.data?.data;

      if (response.data.success && payload) {
        const { token, user } = payload;
        setSession(token, user);

        toast({
          title: "Success",
          description: `Welcome back, ${user.name}!`,
          variant: "default",
        });

        if (onSuccess) {
          onSuccess({ token, user });
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      const errorMsg = error.data?.message || "Google login failed";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });

      if (onError) {
        onError(error);
      }
    }
  };

  const handleGoogleError = () => {
    toast({
      title: "Error",
      description: "Google login failed. Please try again.",
      variant: "destructive",
    });

    if (onError) {
      onError(new Error("Google login cancelled"));
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      theme="outline"
      size="large"
      text="signin_with"
      locale="en"
    />
  );
};

/**
 * Google OAuth Provider Wrapper
 * Wraps app or sections that need Google OAuth
 */
export const GoogleOAuthWrapper = ({ children, clientId }) => {
  const resolvedClientId = clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!resolvedClientId) {
    return children;
  }

  return (
    <GoogleOAuthProvider clientId={resolvedClientId}>
      {children}
    </GoogleOAuthProvider>
  );
};

/**
 * Hook to use Google authentication
 */
export const useGoogleAuth = () => {
  const { setSession } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleResponse = async (credentialResponse) => {
    try {
      const response = await apiClient.post("/auth/google/verify-token", {
        token: credentialResponse.credential,
      });
      const payload = response.data?.data;

      if (response.data.success && payload) {
        const { token, user } = payload;
        setSession(token, user);

        toast({
          title: "Success",
          description: `Welcome, ${user.name}!`,
          variant: "default",
        });

        navigate("/dashboard");
      }
    } catch (error) {
      const errorMsg = error.data?.message || "Google authentication failed";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  return { handleGoogleResponse };
};
