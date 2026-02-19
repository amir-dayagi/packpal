"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { LoginState, SignupState } from "@/types/auth";

interface AuthFormProps {
    type: "login" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
    const { login, signup } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(event.currentTarget);

        try {
            if (type === "login") {
                const initialState: LoginState = { email: "", password: "" };
                const result = await login(initialState, formData);
                if (result.error) {
                    setError(result.error);
                }
            } else {
                const initialState: SignupState = { email: "", password: "", confirmPassword: "" };
                const result = await signup(initialState, formData);
                if (result.error) {
                    setError(result.error);
                }
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const isLogin = type === "login";

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{isLogin ? "Welcome back" : "Create an account"}</CardTitle>
                <CardDescription>
                    {isLogin
                        ? "Enter your credentials to access your account"
                        : "Enter your details to create a new account"}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="user@example.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                        />
                    </div>
                    {!isLogin && (
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                            />
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col py-4 space-y-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        {isLogin ? (
                            <>
                                Don't have an account?{" "}
                                <Link href="/signup" className="underline hover:text-primary">
                                    Sign up
                                </Link>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <Link href="/login" className="underline hover:text-primary">
                                    Log in
                                </Link>
                            </>
                        )}
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
