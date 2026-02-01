import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services";

export const useLogin = () =>{
    const router = useRouter();
    
    return useMutation({
        mutationFn: authService.login,
        onSuccess: (res)=>{
            if(res.data.redirect === '/verify-otp'){
                router.push('/verify-otp');
            }
        },
    })
}