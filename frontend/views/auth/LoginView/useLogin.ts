import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services";
import { authStore } from "@/stores/auth.store";

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => {
      if (res.data.redirect === "/verify-otp") {
        router.push("/verify-otp");
        return;
      }

      if (res.data.accessToken && res.data.user) {
        authStore.getState().setAuth(res.data.user, res.data.accessToken);
        router.push("/chat");
      }
    },
  });
};
