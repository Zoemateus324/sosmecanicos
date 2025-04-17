"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ParaClientes() {
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
            Para Clientes
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Resolva seus problemas automotivos de forma rápida, segura e prática.
          </p>
        </motion.div>

        {/* Benefits Section */}
        <section className="bg-white p-8 rounded-xl shadow-lg relative">
          {/* Floating Elements */}
         

          <h3 className="text-2xl font-semibold text-blue-900 mb-8 text-center">
            Benefícios para Você
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Solicite com Facilidade",
                description: "Peça serviços com poucos cliques e descreva seu problema.",
                icon: "/assets/request.svg",
              },
              {
                title: "Escolha a Melhor Proposta",
                description: "Receba e compare orçamentos de profissionais próximos.",
                icon: "/assets/proposal.svg",
              },
              {
                title: "Pagamento Seguro",
                description: "Pague com PIX, boleto ou cartão, com total segurança.",
                icon: "/assets/secure.svg",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.3 }}
                className="text-center p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                <Image
                  src={benefit.icon}
                  alt={benefit.title}
                  width={50}
                  height={50}
                  className="mx-auto mb-4"
                />
                <h4 className="text-lg font-semibold text-blue-900 mb-2">{benefit.title}</h4>
                <p className="text-gray-600">{benefit.description}</p>
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
              Pronto para Começar?
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Cadastre-se agora e encontre os melhores profissionais para o seu veículo.
            </p>
            <Link
              href="/cadastro"
              className="inline-block bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all"
            >
              Comece Agora
            </Link>
          </motion.div>
        </section>

        {/* Banner Section */}
        <section className="mt-16 bg-gradient-to-r from-blue-900 to-orange-500 text-white py-12 rounded-xl shadow-lg">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold mb-4">Atendimento 24/7</h3>
            <p className="text-lg md:text-xl mb-6 opacity-90">
              Estamos aqui para ajudar a qualquer hora, em qualquer lugar.
            </p>
            <Link
              href="/solicitar"
              className="inline-block bg-white text-orange-500 py-3 px-8 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all"
            >
              Solicitar Serviço Agora
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}