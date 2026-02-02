import { authService } from "@/services";
import { useAuthStore } from "@/stores/auth.store";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useVerifyOtp = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setPendingVerificationEmail = useAuthStore((state) => state.setPendingVerificationEmail);

  return useMutation({
    mutationFn: authService.verifyOtp,
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.accessToken);
      setPendingVerificationEmail(null as any); // Clear pending email
      router.push("/chat");
    },
  });
};
