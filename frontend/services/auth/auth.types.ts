export interface SignupPayload {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface LoginPayload {
    identifier: string; // can be email or username
    password: string;
}

export interface AuthResponse {
    id: number;
    name: string;
    username: string;
    email: string;
    status: string;
    token: string;
}

export interface VerifyOtpPayload {
    email: string;
    otp: string;
}