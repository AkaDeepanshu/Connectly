import { authService } from "@/services";
import { useAuthStore } from "@/stores/auth.store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useSignup = () => {
  const router = useRouter();
  const setPendingVerificationEmail = useAuthStore((state) => state.setPendingVerificationEmail);

  return useMutation({
    mutationFn: authService.signup,
    onSuccess: (res) => {
      if(res.data.requiresVerification){
        // Store email for OTP verification
        setPendingVerificationEmail(res.data.newUser.email);
        router.push("/verify-otp");
        return;
      }
    },
  });
};

export const useCheckUsername = (username: string) => {
  return useQuery({
    queryKey: ["check-username", username],
    queryFn: ()=> authService.checkUsername(username),
    enabled: username.length > 3,
    retry: false,
  })
}