import { authService } from "@/services";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useSignup = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.signup,
    onSuccess: () => {
      router.push("/verify-otp");
    },
  });
};