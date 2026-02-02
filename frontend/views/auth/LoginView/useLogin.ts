import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services";
import { useAuthStore } from "@/stores/auth.store";

export const useLogin = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setPendingVerificationEmail = useAuthStore((state) => state.setPendingVerificationEmail);

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => {
      // Handle unverified user (403 response)
      if (res.data.redirect === "/verify-otp") {
        setPendingVerificationEmail(res.data.email);
        router.push("/verify-otp");
        return;
      }

      // Handle successful login
      if (res.data.accessToken && res.data.user) {
        setAuth(res.data.user, res.data.accessToken);
        router.push("/chat");
      }
    },
  });
};
