import { authService } from "@/services";
import { authStore } from "@/stores/auth.store";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useVerifyOtp = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.verifyOtp,
    onSuccess: (res) => {
      authStore
        .getState()
        .setAuth(res.data.user, res.data.accessToken);

      router.push("/chat");
    },
  });
};
