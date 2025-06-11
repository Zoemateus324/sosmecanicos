"use client";

import Footer from "@/app/(public)/_components/Footer";
import Navbar from "@/app/(public)/_components/Navbar";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ComoFunciona() {
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
          <h2 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4">
            Como Funciona o SOS Mecânicos
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Veja como é fácil resolver seus problemas automotivos em poucos passos.
          </p>
        </motion.div>

        {/* Process Section */}
        <section className="bg-white p-8 rounded-xl shadow-lg relative">
          <h3 className="text-2xl font-semibold text-blue-900 mb-8 text-center">
            Nosso Processo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="absolute top-1/3 left-0 right-0 h-1 bg-gradient-to-r from-blue-900 to-orange-500 hidden md:block"></div>

            {[
              {
                step: "1",
                title: "Solicite o Serviço",
                description: "Escolha o tipo de serviço e descreva o problema.",
                icon: "/assets/service.svg",
              },
              {
                step: "2",
                title: "Receba Propostas",
                description: "Profissionais próximos enviam orçamentos.",
                icon: "/assets/quote.svg",
              },
              {
                step: "3",
                title: "Serviço Concluído",
                description: "Pague de forma segura e avalie o serviço.",
                icon: "/assets/service-check.svg",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.3 }}
                className="text-center p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-xl transition-shadow relative z-10"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  {step.step}
                </div>
                <Image
                  src={step.icon}
                  alt={`Passo ${step.step}`}
                  width={100}
                  height={100}
                  className="mx-auto mb-4"
                />
                <h4 className="text-lg font-semibold text-blue-900 mb-2">{step.title}</h4>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              Pronto para Resolver Seu Problema?
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Solicite um serviço agora e conecte-se com os melhores profissionais.
            </p>
            <Link
              href="/solicitar"
              className="inline-block bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all"
            >
              Solicitar Serviço Agora
            </Link>
          </motion.div>
        </section>
      </div>

      <Footer />
    </div>
  );
}