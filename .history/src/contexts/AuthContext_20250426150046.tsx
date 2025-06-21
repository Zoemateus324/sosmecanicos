"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createComponentClient } from "@/models/supabase";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userType: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userType: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createComponentClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial session
    const fetchSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw new Error("Error fetching session: " + error.message);
        setSession(session);
        setUser(session?.user ?? null);
        console.log("Loading session and user type for:", session?.user?.email);
      } catch (err: any) {
        console.error("Session fetch error:", err.message);
      }
    };

    // Fetch user type if user exists
    const fetchUserType = async (userId: string) => {
      try {
        console.log("Fetching user type for ID:", userId);
        const { data, error } = await supabase
          .from("profiles")
          .select("user_type, tipo_usuario")
          .eq("id", userId)
          .single();
        if (error) throw new Error("Error fetching user type: " + error.message);
        setUserType(data?.user_type ?? data?.tipo_usuario ?? null);
      } catch (err: any) {
        console.error("User type fetch error:", err.message);
      }
    };

    // Initialize session and subscribe to auth changes
    fetchSession().then(() => {
      if (user?.id) {
        fetchUserType(user.id).then(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user?.id) {
        fetchUserType(newSession.user.id);
      } else {
        setUserType(null);
      }
    });

    // Cleanup subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, user?.id]);

  return (
    <AuthContext.Provider value={{ session, user, userType, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}