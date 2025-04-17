"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function QuemSomos() {
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
            Quem Somos
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600">
            Conheça a história por trás do SOS Mecânicos e nossa missão de transformar a assistência automotiva.
          </p>
        </motion.div>

        {/* Mission Section */}
        <section className="bg-white p-4 md:p-8 rounded-xl shadow-lg flex flex-col md:flex-row gap-6 relative">
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

          <div className="md:w-1/2">
            <h3 className="text-xl md:text-2xl font-semibold text-blue-900 mb-4">Nossa Missão</h3>
            <p className="text-gray-600 text-sm md:text-base">
              No SOS Mecânicos, conectamos motoristas a profissionais confiáveis, oferecendo soluções rápidas e seguras para problemas veiculares. Nosso objetivo é garantir que você nunca fique na mão, com atendimento 24/7 e uma plataforma intuitiva para facilitar sua vida.
            </p>
          </div>
          <div className="md:w-1/2 relative">
            <Image
              src="/assets/team.jpg"
              alt="Nossa Equipe"
              width={500}
              height={300}
              className="rounded-lg object-cover w-full h-auto"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="absolute -top-4 -left-4 bg-white text-blue-900 px-3 py-1 md:px-4 md:py-2 rounded-lg shadow-md text-sm md:text-base"
            >
           
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mt-12 md:mt-16">
          <h3 className="text-xl md:text-2xl font-semibold text-blue-900 mb-6 md:mb-8 text-center">
            Nossos Valores
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "Confiabilidade",
                description: "Trabalhamos apenas com profissionais verificados e confiáveis.",
                icon: "/assets/trust.svg",
              },
              {
                title: "Rapidez",
                description: "Atendimento rápido para que você volte à estrada o quanto antes.",
                icon: "/assets/speed.svg",
              },
              {
                title: "Transparência",
                description: "Orçamentos claros e sem surpresas, com pagamento seguro.",
                icon: "/assets/transparency.svg",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.3 }}
                className="text-center p-4 md:p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                <Image
                  src={value.icon}
                  alt={value.title}
                  width={50}
                  height={50}
                  className="mx-auto mb-4"
                />
                <h4 className="text-base md:text-lg font-semibold text-blue-900 mb-2">{value.title}</h4>
                <p className="text-gray-600 text-sm md:text-base">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-12 md:mt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-xl md:text-2xl font-bold text-blue-900 mb-4">
              Faça Parte da Nossa Jornada
            </h3>
            <p className="text-base md:text-lg text-gray-600 mb-6">
              Junte-se ao SOS Mecânicos e experimente uma nova forma de assistência automotiva.
            </p>
            <Link
              href="/cadastro"
              className="inline-block bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-2 md:py-3 px-6 md:px-8 rounded-lg text-base md:text-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all"
            >
              Cadastre-se Agora
            </Link>
          </motion.div>
        </section>
      </div>

      <Footer />
    </div>
  );
}