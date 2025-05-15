"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/models/supabase";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface JobApplication {
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  resume: File | null;
}

export default function TrabalheConosco() {
  const [formData, setFormData] = useState<JobApplication>({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    resume: null
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // Simular envio do formulário
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        resume: null
      });
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        resume: e.target.files![0]
      }));
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
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
              disabled={loading}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
              disabled={status === "loading"}
            />
            <textarea
              placeholder="Mensagem (fale sobre você e suas experiências)"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="border border-gray-300 p-3 w-full rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
              disabled={status === "loading"}
            />
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setCurriculo(e.target.files?.[0] || null)}
              className="text-gray-600 text-sm md:text-base"
              disabled={status === "loading"}
            />
            <button
              onClick={handleSubmit}
              className={`bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-3 w-full rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all text-base md:text-lg ${
                status === "loading" ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Enviando..." : "Enviar Candidatura"}
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