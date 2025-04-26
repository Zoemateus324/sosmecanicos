"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/models/supabase";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Suporte() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const handleSubmit = async () => {
    // Validação
    if (!nome || !email || !mensagem) {
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
      const { error } = await supabase.from("suporte").insert({
        nome,
        email,
        mensagem,
      });

      if (error) throw error;

      setStatus("success");
      setNome("");
      setEmail("");
      setMensagem("");
      setTimeout(() => setStatus("idle"), 3000); // Reseta o status após 3 segundos
    } catch (error) {
      setStatus("error");
      setErrorMessage("Erro ao enviar a mensagem. Tente novamente.");
    }
  };

  const faqs = [
    {
      question: "Como solicito um serviço?",
      answer: "Basta se cadastrar, escolher o tipo de serviço e descrever o problema. Você receberá propostas de profissionais próximos em poucos minutos.",
    },
    {
      question: "Quais formas de pagamento são aceitas?",
      answer: "Aceitamos PIX, boleto e cartão de crédito, tudo de forma segura através da nossa plataforma.",
    },
    {
      question: "Como entro em contato com o suporte?",
      answer: "Você pode preencher o formulário abaixo ou enviar um e-mail para suporte@sosmecanicos.com. Estamos disponíveis 24/7!",
    },
  ];

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
            Suporte
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600">
            Estamos aqui para ajudar! Tire suas dúvidas ou entre em contato com nossa equipe.
          </p>
        </motion.div>

        {/* FAQ Section */}
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
            Perguntas Frequentes
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="border-b border-gray-200"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full text-left py-3 flex justify-between items-center"
                >
                  <h4 className="font-semibold text-blue-900 text-base md:text-lg">{faq.question}</h4>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${expandedFAQ === index ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFAQ === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="pb-3"
                  >
                    <p className="text-gray-600 text-sm md:text-base">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="bg-white p-4 md:p-8 rounded-lg shadow-lg">
          <h3 className="text-xl md:text-2xl font-semibold text-blue-900 mb-6 md:mb-8 text-center">
            Entre em Contato
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
              placeholder="Mensagem"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="border border-gray-300 p-3 w-full rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
            />
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-3 w-full rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all text-base md:text-lg"
            >
              Enviar Mensagem
            </button>
            {status === "success" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-600 text-center mt-4"
              >
                Mensagem enviada com sucesso!
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