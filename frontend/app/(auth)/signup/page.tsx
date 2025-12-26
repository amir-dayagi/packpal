"use client"

import Link from "next/link";
import { useActionState } from "react";
import { SignupState } from "@/app/types/auth";
import { useAuth } from "@/app/contexts/auth";
import GradientButton from "@/app/components/GradientButton";
import AuthErrorMessage from "@/app/components/auth/AuthErrorMessage";
import AuthInput from "@/app/components/auth/AuthInput";


export default function Signup() {
    const { signup } = useAuth();
    const action = async (prevState: SignupState, formData: FormData) => {
        return await signup(prevState, formData);
    };
    const [state, formAction, isPending] = useActionState<SignupState>(
        action as (prevState: SignupState) => Promise<SignupState>,
        {
            email: "",
            password: "",
            confirmPassword: "",
            error: "",
        }
    );

    return (
        
        <div className="card">
            <div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">
                    Create your account
                </h2>
                <p className="text-sm text-secondary">
                    Get started with PackPal today
                </p>
            </div>

            <form className="space-y-5" action={formAction}>
                {state.error && (
                    <AuthErrorMessage errorMessage={state.error}/>
                )}

                <div className="space-y-4">
                    <AuthInput 
                        label="Email adress"
                        type="email"                        
                        defaultValue={state.email}
                        placeholder="you@example.com"
                    />

                    <AuthInput 
                        label="Password"
                        type="password"                        
                        defaultValue={state.password}
                        placeholder="Create a password"
                    />

                    <AuthInput 
                        label="Confirm Password"
                        type="confirmPassword"                        
                        defaultValue={state.confirmPassword}
                        placeholder="Confirm your password"
                    />

                </div>
                
                <GradientButton
                    type="submit"
                    loading={isPending}
                    className="w-full"
                >
                    <span>Create account</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </GradientButton>
            </form>

            <div className="pt-4 border-t border-tertiary">
                <p className="text-center text-sm text-secondary">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:text-primary-hover transition-colors duration-200">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
} 