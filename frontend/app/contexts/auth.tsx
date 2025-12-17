import React from "react";
import { createContext, useState, useEffect, useContext } from "react";
import { createClient } from "../utils/supabase/client";
import { useRouter } from "next/navigation";
import { LoginState, SignupState } from "../types/auth";

interface AuthContextType {
  session: string | null;
  login: (state: LoginState, formData: FormData) => Promise<LoginState>;
  signup: (state: SignupState, formData: FormData) => Promise<SignupState>;
  logout: () => Promise<void>;
}

const Context = createContext<AuthContextType | null>(null);

const Provider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const supabase = createClient();
  const [session, setSession] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
        const { data } = await supabase.auth.getSession();
        setSession(data.session?.access_token ?? null);
    }

    getSession();

    supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN") {
            setSession(session?.access_token ?? null);
        } else if (event === "SIGNED_OUT") {
            setSession(null);
            router.replace("/login");
        }
    });
  }, []);

  
  const login = async (state: LoginState, formData: FormData): Promise<LoginState> => {
        const data = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
        }
    
        const { error } = await supabase.auth.signInWithPassword(data)
    
        if (error) {
            return {
                email: data.email,
                password: data.password,
                error: error.message,
            }
        }
        router.replace("/");
        return {
            email: data.email,
            password: data.password,
        };
  };

  const signup = async (state: SignupState, formData: FormData): Promise<SignupState> => {
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string,
    }

    if (data.password !== data.confirmPassword) {
        return {
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
            error: "Passwords do not match",
        }
    }

    const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
    })

    if (error) {
        return {
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
            error: error.message,
        }
    }
    
    router.replace("/login");
    return {
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
    };
  }

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.replace("/login");
  };

  const exposed: AuthContextType = {
    session,
    login,
    signup,
    logout,
  };

  return (
    <Context.Provider value={exposed}>
      {children}
    </Context.Provider>
  )
};

export const useAuth = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default Provider;