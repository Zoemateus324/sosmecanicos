"use client"
import { useState } from "react";
import { supabase } from "@/services/supabase";
import { useRouter } from "next/navigation";

export default function Login(){
    const [email,setEmail]= useState("");
    const [password,setPassword]=useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        setError("");
        
        if (!email || !password) {
            setError("Por favor, preencha todos os campos.");
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message.includes("Invalid login credentials")) {
                    setError("Email ou senha incorretos.");
                } else {
                    setError("Erro ao fazer login. Por favor, tente novamente.");
                }
            } else if (data?.user) {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
        }
    };

    return(
        <div className="min-h-screen flex items-center justify-center">
            <div className="p-6 bg-white shadow-md rounded">
                <h2 className="text-2x1 mb-4">Login</h2>
                <input type="email"
                placeholder="Email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="border p-2 mb-4 w-full"
                />
                <input type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) =>setPassword(e.target.value)}
                className="border p-2 mb-4 w-full" />
                {error && <p className="text-red-500">{error}</p>}
                <button onClick={handleLogin}
                className="bg-orange-500 text-white p-2 w-full sans">
                    Entrar
                </button>
            </div>
        </div>
    )
}