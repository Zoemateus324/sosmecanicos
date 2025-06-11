"use client";

import Navbar from "@/app/(public)/_components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function SejaParceiro() {
  const beneficios = [
    {
      titulo: "Flexibilidade de Horários",
      descricao: "Trabalhe nos horários que melhor se adequam à sua rotina"
    },
    {
      titulo: "Ganhos Atraentes",
      descricao: "Receba até 80% do valor do serviço, com pagamentos semanais"
    },
    {
      titulo: "Suporte Completo",
      descricao: "Acesso a ferramentas, treinamentos e suporte técnico"
    },
    {
      titulo: "Crescimento Profissional",
      descricao: "Oportunidades de desenvolvimento e capacitação contínua"
    }
  ];

  const requisitos = [
    "Experiência mínima de 2 anos na área",
    "Possuir ferramentas básicas",
    "Disponibilidade para atendimentos de emergência",
    "Boa comunicação e atendimento ao cliente",
    "Documentação em dia"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Seja um Parceiro SOS Mecânicos</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Junte-se à maior rede de mecânicos do Brasil e transforme sua carreira profissional
          </p>
        </div>

        {/* Benefícios */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Nossos Diferenciais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {beneficios.map((beneficio, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{beneficio.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{beneficio.descricao}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Requisitos */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Requisitos para Parceria</h2>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {requisitos.map((requisito, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span>{requisito}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Card className="max-w-2xl mx-auto bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-2xl">Pronto para começar?</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Preencha o formulário e nossa equipe entrará em contato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => window.location.href = '/cadastro/mecanico'}
              >
                Quero ser parceiro
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}