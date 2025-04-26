"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/models/supabase";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// import { sendNotification } from "@/services/onesignal-notifications";

export default function TrabalheConosco() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [curriculo, setCurriculo] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    // Validação
    if (!nome || !email || !mensagem || !curriculo) {
      setStatus("error");
      setErrorMessage("Por favor, preencha todos os campos e envie um currículo.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage("Por favor, insira um email válido.");
      return;
    }

    if (curriculo && !curriculo.name.endsWith(".pdf")) {
      setStatus("error");
      setErrorMessage("Por favor, envie um currículo no formato PDF.");
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from("curriculos")
        .upload(`curriculo-${Date.now()}.pdf`, curriculo);

      if (error) throw error;

      const curriculoUrl = supabase.storage.from("curriculos").getPublicUrl(data.path).data.publicUrl;

      const { error: insertError } = await supabase.from("candidaturas").insert({
        nome,
        email,
        mensagem,
        curriculo_url: curriculoUrl,
      });

      if (insertError) throw insertError;

      /* await sendNotification({
        userIds: ["admin-id"], // Substituir por ID real
        title: "Nova Candidatura",
        message: `Nova candidatura recebida de ${nome}`,
      }); */

      setStatus("success");
      setNome("");
      setEmail("");
      setMensagem("");
      setCurriculo(null);
      setTimeout(() => setStatus("idle"), 3000); // Reseta o status após 3 segundos
    } catch (error) {
      setStatus("error");
      setErrorMessage("Erro ao enviar a candidatura. Tente novamente.");
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
            Trabalhe Conosco
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600">
            Faça parte da equipe que está revolucionando a assistência automotiva no Brasil!
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
            Por que Trabalhar no SOS Mecânicos?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "Ambiente Inovador",
                description: "Trabalhe em uma empresa que está transformando a assistência automotiva.",
                icon: "/assets/innovation.svg",
              },
              {
                title: "Crescimento Profissional",
                description: "Oportunidades de aprendizado e desenvolvimento contínuo.",
                icon: "/assets/growth.svg",
              },
              {
                title: "Impacto Real",
                description: "Faça a diferença na vida de motoristas e profissionais em todo o Brasil.",
                icon: "/assets/impact.svg",
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

        {/* Application Form Section */}
        <section className="bg-white p-4 md:p-8 rounded-lg shadow-lg">
          <h3 className="text-xl md:text-2xl font-semibold text-blue-900 mb-6 md:mb-8 text-center">
            Envie Sua Candidatura
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
            <textarea
              placeholder="Mensagem (fale sobre você e suas experiências)"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="border border-gray-300 p-3 w-full rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
            />
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setCurriculo(e.target.files?.[0] || null)}
              className="text-gray-600 text-sm md:text-base"
            />
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-3 w-full rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all text-base md:text-lg"
            >
              Enviar Candidatura
            </button>
            {status === "success" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-600 text-center mt-4"
              >
                Candidatura enviada com sucesso! Entraremos em contato em breve.
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