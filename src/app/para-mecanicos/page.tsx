"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ParaMecanicos() {
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
            Para Mecânicos
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Amplie sua clientela e aumente sua renda com o SOS Mecânicos.
          </p>
        </motion.div>

        {/* Benefits Section */}
        <section className="bg-white p-8 rounded-xl shadow-lg relative">
          {/* Floating Elements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute top-4 left-4"
          >
            <Image src="/assets/wrench.svg" alt="Chave de Boca" width={40} height={40} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="absolute bottom-4 right-4"
          >
            <Image src="/assets/gear.svg" alt="Engrenagem" width={40} height={40} />
          </motion.div>

          <h3 className="text-2xl font-semibold text-blue-900 mb-8 text-center">
            Por que ser um Mecânico SOS?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Aumente Sua Visibilidade",
                description: "Seja encontrado por clientes da sua região com nossa plataforma.",
                icon: "/assets/visibility.svg",
              },
              {
                title: "Receba Solicitações",
                description: "Tenha acesso a solicitações de clientes próximos a você.",
                icon: "/assets/request.svg",
              },
              {
                title: "Pagamentos Rápidos",
                description: "Receba seus pagamentos de forma segura e rápida.",
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
              Junte-se à Nossa Rede de Profissionais
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Torne-se um parceiro e comece a receber solicitações hoje mesmo.
            </p>
            <Link
              href="/seja-parceiro"
              className="inline-block bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all"
            >
              Torne-se um Parceiro
            </Link>
          </motion.div>
        </section>

        {/* Banner Section */}
        <section className="mt-16 bg-gradient-to-r from-blue-900 to-orange-500 text-white py-12 rounded-xl shadow-lg">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold mb-4">Trabalhe no Seu Ritmo</h3>
            <p className="text-lg md:text-xl mb-6 opacity-90">
              Escolha as solicitações que deseja atender e aumente sua renda.
            </p>
            <Link
              href="/seja-parceiro"
              className="inline-block bg-white text-orange-500 py-3 px-8 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all"
            >
              Inscreva-se Agora
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}