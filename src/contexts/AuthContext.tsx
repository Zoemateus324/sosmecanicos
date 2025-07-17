"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

interface Profiles {
  id: string;
  nome: string;
  email: string;
  conta: string;
  telefone: string;
}

interface AuthContextType {
  user: User | null;
  profiles: Profiles | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, userType: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  setAuth: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<Profiles | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, nome, email, conta, telefone")
          .eq("id", userId)
          .single();

        if (error) {
          toast.error("Erro ao carregar perfil do usuário.");
          console.error(error.message);
          return null;
        }

        return data as Profiles;
      } catch (err) {
        toast.error("Erro inesperado ao carregar perfil.");
        console.error(err);
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

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const profileData = await fetchProfile(currentUser.id);
        setProfiles(profileData);
      }

      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const profileData = await fetchProfile(currentUser.id);
          setProfiles(profileData);
        } else {
          setProfiles(null);
        }

        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, [supabase, fetchProfile]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error("Conexão indisponível.");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email inválido.");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(`Erro ao fazer login: ${error.message}`);
      throw error;
    }

    toast.success("Login realizado com sucesso!");
  };

  const signUp = async (email: string, password: string, fullName: string, userType: string, phone: string) => {
    if (!supabase) throw new Error("Conexão indisponível.");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email inválido.");
      return;
    }

    if (password.length < 6) {
      toast.error("Senha muito curta.");
      return;
    }

    if (!fullName.trim()) {
      toast.error("Nome obrigatório.");
      return;
    }

    if (!["cliente", "mecanico", "guincho", "seguradora"].includes(userType)) {
      toast.error("Tipo de usuário inválido.");
      return;
    }

    if (!/^\+?\d{10,15}$/.test(phone)) {
      toast.error("Telefone inválido.");
      return;
    }

    const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      toast.error(`Erro ao cadastrar: ${signUpError.message}`);
      throw signUpError;
    }

    if (newUser) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: newUser.id,
          nome: fullName,
          email,
          conta: userType,
          telefone: phone,
        },
      ]);

      if (profileError) {
        toast.error(`Erro ao salvar perfil: ${profileError.message}`);
        throw profileError;
      }

      const profileData = await fetchProfile(newUser.id);
      setProfiles(profileData);
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

    setUser(null);
    setProfiles(null);
    toast.success("Logout realizado com sucesso!");
  };

  const setAuth = (user: User) => {
    setUser(user);
    fetchProfile(user.id).then(setProfiles);
    setLoading(false);
    toast.success("Sessão autenticada!");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profiles,
        loading,
        signIn,
        signUp,
        signOut,
        setAuth,
      }}
    >
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-100" aria-live="polite">
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