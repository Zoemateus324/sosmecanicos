"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { toast } from "sonner";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  user_type: string;
  telefone: string;
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
  setAuth: (auth: { user: User; userNome: string; userType: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(
    async (userId: string | null) => {
      if (!userId || !supabase) {
        console.warn("Usuário ou Supabase não disponível.");
        toast.error("Erro ao buscar perfil.", {
          style: { backgroundColor: "#EF4444", color: "#ffffff" },
        });
        return null;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, user_type, telefone")
          .eq("id", userId)
          .single();

        if (error) {
          toast.error(`Erro ao buscar perfil: ${error.message}`, {
            style: { backgroundColor: "#EF4444", color: "#ffffff" },
          });
          return null;
        }

        return data as Profile;
      } catch (error) {
        toast.error("Erro inesperado ao carregar perfil.", {
          style: { backgroundColor: "#EF4444", color: "#ffffff" },
        });
        return null;
      }
    },
    [supabase]
  );

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        setLoading(true);
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
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
    if (!supabase) throw new Error("Conexão indisponível.");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email inválido.");
      throw new Error("Email inválido.");
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      throw new Error("Senha muito curta.");
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(`Erro ao fazer login: ${error.message}`);
      throw error;
    }

    toast.success("Login realizado com sucesso!");
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    userType: string,
    phone: string
  ) => {
    if (!supabase) throw new Error("Conexão indisponível.");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email inválido.");
      throw new Error("Email inválido.");
    }

    if (password.length < 6) {
      toast.error("Senha muito curta.");
      throw new Error("Senha muito curta.");
    }

    if (!fullName.trim()) {
      toast.error("Nome obrigatório.");
      throw new Error("Nome obrigatório.");
    }

    if (!["cliente", "mecanico", "guincho", "seguradora"].includes(userType)) {
      toast.error("Tipo de usuário inválido.");
      throw new Error("Tipo de usuário inválido.");
    }

    if (!/^\+?\d{10,15}$/.test(phone)) {
      toast.error("Telefone inválido.");
      throw new Error("Telefone inválido.");
    }

    const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      toast.error(`Erro ao cadastrar: ${signUpError.message}`);
      throw signUpError;
    }

    if (newUser) {
      const { error: profileError } = await supabase.from("profiles").insert([
        { id: newUser.id, full_name: fullName, email, user_type: userType, phone }
      ]);

      if (profileError) {
        toast.error(`Erro ao criar perfil: ${profileError.message}`);
        throw profileError;
      }

      await fetchProfile(newUser.id);
      toast.success("Cadastro realizado com sucesso!");
    }
  };

  const signOut = async () => {
    if (!supabase) throw new Error("Conexão indisponível.");

    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Erro ao sair: ${error.message}`);
      throw error;
    }

    toast.success("Logout realizado com sucesso!");
  };

  const setAuth = (auth: { user: User; userNome: string; userType: string }) => {
    setUser(auth.user);
    setProfile({
      id: auth.user.id,
      full_name: auth.userNome,
      email: auth.user.email || "",
      user_type: auth.userType,
      telefone:"",
    } as Profile);
    setLoading(false);
    toast.success("Autenticação atualizada com sucesso!", {
      style: { backgroundColor: "#4CAF50", color: "#ffffff" },

    });
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
        setAuth,
      }}
    >
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-100" aria-live="polite" role="status">
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
