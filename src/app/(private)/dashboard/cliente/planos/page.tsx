"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const planos = [
  {
    nome: "Básico",
    preco: "R$ 29,90",
    periodo: "mês",
    descricao: "Ideal para quem busca serviços essenciais",
    beneficios: [
      "Atendimento prioritário",
      "Desconto de 5% em serviços",
      "Suporte por WhatsApp",
      "Histórico de serviços"
    ],
    destaque: false
  },
  {
    nome: "Premium",
    preco: "R$ 49,90",
    periodo: "mês",
    descricao: "Para quem busca mais benefícios e economia",
    beneficios: [
      "Atendimento prioritário",
      "Desconto de 10% em serviços",
      "Suporte 24/7",
      "Histórico de serviços",
      "Garantia estendida",
      "Assistência 24h"
    ],
    destaque: true
  },
  {
    nome: "Família",
    preco: "R$ 79,90",
    periodo: "mês",
    descricao: "Perfeito para famílias com múltiplos veículos",
    beneficios: [
      "Atendimento prioritário",
      "Desconto de 15% em serviços",
      "Suporte 24/7",
      "Histórico de serviços",
      "Garantia estendida",
      "Assistência 24h",
      "Até 3 veículos",
      "Check-up mensal"
    ],
    destaque: false
  }
];

export default function PlanosPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAssinar = async (plano: string) => {
    setLoading(plano);
    try {
      // Aqui você implementaria a lógica de assinatura
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulação
      toast.success(`Plano ${plano} assinado com sucesso!`);
    } catch (error) {
      console.error('Erro ao assinar plano:', error);
      toast.error("Erro ao assinar o plano. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Planos Mensais</h1>
        <p className="text-xl text-gray-600">
          Escolha o plano ideal para suas necessidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {planos.map((plano) => (
          <Card 
            key={plano.nome}
            className={`relative ${plano.destaque ? 'border-primary shadow-lg scale-105' : ''}`}
          >
            {plano.destaque && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Mais Popular
                </span>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="text-2xl">{plano.nome}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plano.preco}</span>
                <span className="text-gray-500">/{plano.periodo}</span>
              </div>
              <CardDescription className="mt-2">{plano.descricao}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3">
                {plano.beneficios.map((beneficio, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>{beneficio}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full"
                variant={plano.destaque ? "default" : "outline"}
                onClick={() => handleAssinar(plano.nome)}
                disabled={loading === plano.nome}
              >
                {loading === plano.nome ? "Processando..." : "Assinar Plano"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 