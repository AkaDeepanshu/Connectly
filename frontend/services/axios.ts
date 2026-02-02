import { authStore } from "@/stores/auth.store";
import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
})


api.interceptors.request.use(
    (config)=>{
        const token = authStore.getState().accessToken;
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
)

api.interceptors.response.use(
    (response)=>response,
    async (error)=>{
        const originalRequest = error.config;

        if(error.response?.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;

            try{
                const res = await api.post("/auth/refresh");
                authStore.getState().setAccessToken(res.data.accessToken);

                originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;

                return api(originalRequest);
            } catch(err){
                authStore.getState().logout();
                window.location.href = "/login";
            }

        } 
        return Promise.reject(error);
    }
)

export default api;