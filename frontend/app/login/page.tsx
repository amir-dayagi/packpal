"use client"

import Link from "next/link";
// import { login } from "../actions/auth";
import { useAuth } from "../contexts/auth";
import { useActionState } from "react";

export default function Login() {
    const { login } = useAuth();
    const [state, formAction, isPending] = useActionState(login, {
        email: "",
        password: "",
        error: "",
    });

    return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h1 className="text-center text-4xl font-bold text-primary">
                        PackPal
                    </h1>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
                        Sign in to your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" action={formAction}>
                    {state.error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        {state.error}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="space-y-4 rounded-md">
                        <div>
                            <input
                                type="email"
                                name="email"
                                defaultValue={state.email}
                                required
                                className="relative block w-full rounded-lg border-0 py-3 px-4 bg-tertiary ring-1 ring-inset ring-border placeholder:text-secondary"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                name="password"
                                defaultValue={state.password}
                                required
                                className="relative block w-full rounded-lg border-0 py-3 px-4 bg-tertiary ring-1 ring-inset ring-border placeholder:text-secondary"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="group relative flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? "Signing in..." : "Sign in"}
                        </button>
                    </div>
                </form>
                <p className="mt-2 text-center text-sm text-secondary">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-medium text-primary hover:text-primary-hover">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
  