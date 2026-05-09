import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services";
import { useAuthStore } from "@/stores/auth.store";
import { notify } from "@/lib/toast";

export const useLogin = () => {
  const router = useRouter();

  const setAuth = useAuthStore(
    (state) => state.setAuth
  );

  const setPendingVerificationEmail =
    useAuthStore(
      (state) => state.setPendingVerificationEmail
    );

  return useMutation({
    mutationFn: authService.login,

    onSuccess: (res) => {

      // User needs verification
      if (res.data.redirect === "/verify-otp") {

        setPendingVerificationEmail(
          res.data.email
        );

        notify.info(
          "Please verify your email first"
        );

        router.push("/verify-otp");

        return;
      }

      // Successful login
      if (
        res.data.accessToken &&
        res.data.user
      ) {

        setAuth(
          res.data.user,
          res.data.accessToken
        );

        notify.success(
          `Welcome back ${res.data.user.username || "User"}`
        );

        router.push("/chat");
      }
    },

    onError: (error: any) => {

      const message =
        error?.response?.data?.message ||
        "Login failed";

      notify.error(message);
    },
  });
};