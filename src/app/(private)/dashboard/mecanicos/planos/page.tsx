"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const planos = [
  {
    nome: "Iniciante",
    preco: "R$ 49,90",
    periodo: "mês",
    descricao: "Ideal para mecânicos que estão começando",
    beneficios: [
      "Até 5 serviços por mês",
      "Perfil profissional básico",
      "Suporte por WhatsApp",
      "Acesso à plataforma"
    ],
    destaque: false
  },
  {
    nome: "Profissional",
    preco: "R$ 99,90",
    periodo: "mês",
    descricao: "Para mecânicos que buscam mais oportunidades",
    beneficios: [
      "Serviços ilimitados",
      "Perfil profissional completo",
      "Suporte prioritário",
      "Acesso à plataforma",
      "Ferramentas de gestão",
      "Relatórios de desempenho"
    ],
    destaque: true
  },
  {
    nome: "Empresarial",
    preco: "R$ 199,90",
    periodo: "mês",
    descricao: "Perfeito para oficinas e equipes",
    beneficios: [
      "Serviços ilimitados",
      "Perfil profissional completo",
      "Suporte prioritário 24/7",
      "Acesso à plataforma",
      "Ferramentas de gestão avançadas",
      "Relatórios detalhados",
      "Até 5 mecânicos",
      "Treinamentos exclusivos"
    ],
    destaque: false
  }
];

export default function PlanosMecanicosPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAssinar = async (plano: string) => {
    setLoading(plano);
    try {
      // Aqui você implementaria a lógica de assinatura
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulação
      toast.success(`Plano ${plano} assinado com sucesso!`);
    } catch (error) {
      toast.error("Erro ao assinar o plano. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Planos para Mecânicos</h1>
        <p className="text-xl text-gray-600">
          Escolha o plano que melhor se adapta ao seu negócio
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

      {/* Seção de FAQ */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Perguntas Frequentes</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Como funciona o pagamento?</h3>
            <p className="text-gray-600">
              O pagamento é realizado mensalmente através de cartão de crédito ou boleto bancário.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Posso trocar de plano?</h3>
            <p className="text-gray-600">
              Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Como recebo os serviços?</h3>
            <p className="text-gray-600">
              Os serviços são distribuídos automaticamente com base na sua localização e especialidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 