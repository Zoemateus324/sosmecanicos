"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { toast } from "sonner";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  user_type: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  userNome: string | null;
  userType: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, userType: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string | null) => {
    if (!userId || !supabase) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, user_type")
        .eq("id", userId)
        .single();

      if (error) {
        toast.error(`Erro ao buscar perfil: ${error.message}`, {
          style: { backgroundColor: "#EF4444", color: "#ffffff" },
        });
        throw error;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error("Unexpected error in fetchProfile:", error);
      toast.error("Erro inesperado ao carregar perfil.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setLoading(true);
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Conexão com o banco de dados não está disponível.");
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, insira um email válido.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      throw new Error("Email inválido.");
    }

    // Validação de senha
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      throw new Error("Senha muito curta.");
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error(`Erro ao fazer login: ${error.message}`, {
          style: { backgroundColor: "#EF4444", color: "#ffffff" },
        });
        throw error;
      }
      toast.success("Login realizado com sucesso!", {
        style: { backgroundColor: "#10B981", color: "#ffffff" },
      });
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, userType: string, phone: string) => {
    if (!supabase) {
      throw new Error("Conexão com o banco de dados não está disponível.");
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, insira um email válido.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      throw new Error("Email inválido.");
    }

    // Validação de senha
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      throw new Error("Senha muito curta.");
    }

    // Validação de nome
    if (!fullName.trim()) {
      toast.error("Por favor, insira um nome válido.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      throw new Error("Nome é obrigatório.");
    }

    // Validação de tipo de usuário
    if (!["cliente", "mecanico", "guincho", "seguradora"].includes(userType)) {
      toast.error("Tipo de usuário inválido.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      throw new Error("Tipo de usuário inválido.");
    }

    // Validação de telefone
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(phone)) {
      toast.error("Por favor, insira um número de telefone válido.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      throw new Error("Número de telefone inválido.");
    }

    try {
      const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        toast.error(`Erro ao cadastrar: ${signUpError.message}`, {
          style: { backgroundColor: "#EF4444", color: "#ffffff" },
        });
        throw signUpError;
      }

      if (newUser) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: newUser.id,
            full_name: fullName,
            email,
            user_type: userType,
            phone,
          },
        ]);

        if (profileError) {
          toast.error(`Erro ao criar perfil: ${profileError.message}`, {
            style: { backgroundColor: "#EF4444", color: "#ffffff" },
          });
          throw profileError;
        }

        await fetchProfile(newUser.id);
        toast.success("Cadastro realizado com sucesso!", {
          style: { backgroundColor: "#10B981", color: "#ffffff" },
        });
      }
    } catch (error) {
      console.error("Error during sign-up process:", error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!supabase) {
      throw new Error("Conexão com o banco de dados não está disponível.");
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(`Erro ao sair: ${error.message}`, {
          style: { backgroundColor: "#EF4444", color: "#ffffff" },
        });
        throw error;
      }
      toast.success("Logout realizado com sucesso!", {
        style: { backgroundColor: "#10B981", color: "#ffffff" },
      });
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        userNome: profile?.full_name || null,
        userType: profile?.user_type || null,
        signIn,
        signUp,
        signOut,
      }}
    >
      {loading ? (
        <div
          className="min-h-screen flex items-center justify-center bg-gray-100"
          aria-live="polite"
          role="status"
        >
          <p className="text-lg font-medium text-gray-700">Carregando...</p>
        </div>
      ) : (
        children
      )}
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