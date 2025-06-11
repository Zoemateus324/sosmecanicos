"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, MapPin, Settings, Shield, Wrench } from "lucide-react";
import Link from "next/link";
import Navbar from "@/app/(public)/_components/Navbar";
import Footer from "@/app/(public)/_components/Footer";

const servicos = [
  {
    titulo: "Guincho 24h",
    descricao: "Assistência em caso de pane, acidente ou necessidade de transporte do veículo.",
    icone: <Wrench className="w-8 h-8 text-primary" />
  },
  {
    titulo: "Mecânica Geral",
    descricao: "Manutenção preventiva e corretiva para seu veículo.",
    icone: <Settings className="w-8 h-8 text-primary" />
  },
  {
    titulo: "Troca de Pneus",
    descricao: "Serviço de troca de pneus em qualquer local.",
    icone: <Shield className="w-8 h-8 text-primary" />
  }
];

const passos = [
  {
    numero: "01",
    titulo: "Escolha o Serviço",
    descricao: "Selecione o tipo de serviço que você precisa no nosso aplicativo ou site."
  },
  {
    numero: "02",
    titulo: "Informe a Localização",
    descricao: "Nos informe onde você está para enviarmos o mecânico mais próximo."
  },
  {
    numero: "03",
    titulo: "Aguarde o Atendimento",
    descricao: "Nossa equipe chegará em até 30 minutos no local solicitado."
  }
];

export default function SolicitarPage() {
  return (
    <div className="w-full ">
      <Navbar/>
      <div className="container mx-auto px-4 py-8">

      
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Como Solicitar um Serviço</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Solicite serviços mecânicos de forma rápida e segura, com profissionais qualificados
        </p>
      </div>

      {/* Serviços Disponíveis */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Nossos Serviços</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {servicos.map((servico, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-4">{servico.icone}</div>
                <CardTitle>{servico.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{servico.descricao}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Como Funciona */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Como Funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {passos.map((passo, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-bold text-gray-100 absolute -top-4 -left-4">
                {passo.numero}
              </div>
              <Card className="relative z-10">
                <CardHeader>
                  <CardTitle>{passo.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{passo.descricao}</CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Benefícios */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Por que escolher o SOS Mecânicos?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                <CardTitle>Atendimento Rápido</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Nossos mecânicos chegam em até 30 minutos no local solicitado
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                <CardTitle>Cobertura Nacional</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Atendimento em todo o Brasil com a maior rede de mecânicos
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Card className="max-w-2xl mx-auto bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-2xl">Pronto para solicitar um serviço?</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Clique no botão abaixo e faça sua solicitação agora mesmo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/solicitar">
              <Button 
                size="lg" 
                variant="secondary"
                className="w-full"
              >
                Solicitar Serviço
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
      </div>
      <Footer/>
    </div>
  );
}