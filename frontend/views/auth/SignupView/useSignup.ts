import { authService } from "@/services";
import { useAuthStore } from "@/stores/auth.store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";

export const useSignup = () => {

  const router = useRouter();

  const setPendingVerificationEmail =
    useAuthStore(
      (state) => state.setPendingVerificationEmail
    );

  return useMutation({
    mutationFn: authService.signup,

    onSuccess: (res) => {

      if (res.data.requiresVerification) {

        setPendingVerificationEmail(
          res.data.newUser.email
        );

        notify.success(
          "Account created successfully"
        );

        notify.info(
          "Please verify your email"
        );

        router.push("/verify-otp");

        return;
      }
    },

    onError: (error: any) => {

      const message =
        error?.response?.data?.message ||
        "Signup failed";

      notify.error(message);
    },
  });
};

export const useCheckUsername = (
  username: string
) => {

  return useQuery({
    queryKey: [
      "check-username",
      username,
    ],

    queryFn: () =>
      authService.checkUsername(username),

    enabled: username.length > 3,

    retry: false,

    staleTime: 1000 * 60 * 5,
  });
};