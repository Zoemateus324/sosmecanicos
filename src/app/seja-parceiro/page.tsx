"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/services/supabase";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// import { sendNotification } from "@/services/onesignal-notifications";

export default function SejaParceiro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipoParceiro, setTipoParceiro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    // Validação
    if (!nome || !email || !tipoParceiro || !mensagem) {
      setStatus("error");
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage("Por favor, insira um email válido.");
      return;
    }

    try {
      const { error } = await supabase.from("parceiros").insert({
        nome,
        email,
        tipo_parceiro: tipoParceiro,
        mensagem,
      });

      if (error) throw error;

      /* await sendNotification({
        userIds: [email],
        title: "Bem-vindo ao SOS Mecânicos",
        message: "Sua solicitação de parceria está em análise!",
      }); */

      setStatus("success");
      setNome("");
      setEmail("");
      setTipoParceiro("");
      setMensagem("");
      setTimeout(() => setStatus("idle"), 3000); // Reseta o status após 3 segundos
    } catch (error) {
      setStatus("error");
      setErrorMessage("Erro ao enviar a solicitação. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-blue-900 mb-4">
            Seja Nosso Parceiro
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600">
            Junte-se à rede SOS Mecânicos e expanda sua atuação como mecânico, guincho ou seguradora.
          </p>
        </motion.div>

        {/* Benefits Section */}
        <section className="bg-white p-4 md:p-8 rounded-lg shadow-lg mb-12 relative">
          {/* Floating Elements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute top-4 left-4 hidden md:block"
          >
            
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="absolute bottom-4 right-4 hidden md:block"
          >
            
          </motion.div>

          <h3 className="text-xl md:text-2xl font-semibold text-blue-900 mb-6 md:mb-8 text-center">
            Benefícios de Ser um Parceiro
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "Aumente Sua Clientela",
                description: "Tenha acesso a milhares de motoristas que precisam dos seus serviços.",
                icon: "/assets/clientele.svg",
              },
              {
                title: "Plataforma Intuitiva",
                description: "Gerencie solicitações e pagamentos de forma simples e segura.",
                icon: "/assets/platform.svg",
              },
              {
                title: "Suporte Dedicado",
                description: "Nossa equipe está pronta para ajudar você a crescer no SOS Mecânicos.",
                icon: "/assets/support.svg",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.3 }}
                className="text-center p-4 md:p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                <Image
                  src={benefit.icon}
                  alt={benefit.title}
                  width={50}
                  height={50}
                  className="mx-auto mb-4"
                />
                <h4 className="text-base md:text-lg font-semibold text-blue-900 mb-2">{benefit.title}</h4>
                <p className="text-gray-600 text-sm md:text-base">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Partner Form Section */}
        <section className="bg-white p-4 md:p-8 rounded-lg shadow-lg">
          <h3 className="text-xl md:text-2xl font-semibold text-blue-900 mb-6 md:mb-8 text-center">
            Envie Sua Solicitação
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
            />
            <select
              value={tipoParceiro}
              onChange={(e) => setTipoParceiro(e.target.value)}
              className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
            >
              <option value="">Selecione o tipo de parceiro</option>
              <option value="mecanico">Mecânico</option>
              <option value="guincho">Guincho</option>
              <option value="seguradora">Seguradora</option>
            </select>
            <textarea
              placeholder="Mensagem (fale sobre sua experiência e serviços)"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="border border-gray-300 p-3 w-full rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
            />
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-3 w-full rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all text-base md:text-lg"
            >
              Enviar Solicitação
            </button>
            {status === "success" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-600 text-center mt-4"
              >
                Solicitação enviada com sucesso! Entraremos em contato em breve.
              </motion.p>
            )}
            {status === "error" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-600 text-center mt-4"
              >
                {errorMessage}
              </motion.p>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}