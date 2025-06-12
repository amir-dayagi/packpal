export interface LoginState {
    email: string;
    password: string;
    error?: string;
}

export interface SignupState {
    email: string;
    password: string;
    confirmPassword: string;
    error?: string;
} 