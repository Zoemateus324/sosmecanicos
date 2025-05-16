"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-blue-900 to-orange-500 text-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative">
          {/* Floating Elements */}

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="absolute bottom-10 right-10"
          >

          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 z-10"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
              SOS Mecânicos: <br /> Sua Solução na Estrada
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Conectamos você a mecânicos, guinchos e seguradoras em minutos, 24/7.
            </p>
            <Link
              href="/cadastro"
              className="inline-block bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all"
            >
              Cadastre-se Agora
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 mt-8 md:mt-0 relative z-10"
          >
            <Image
              src="/assets/hero-car.png"
              width={500}
              height={300}
              style={{ width: "auto", height: "auto" }}
              alt="Carro em destaque"
            />


          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-blue-900 text-center mb-12">
            Por que Escolher o SOS Mecânicos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Atendimento Rápido",
                description: "Profissionais próximos a você em minutos.",
                icon: "/assets/speed.svg",
              },
              {
                title: "Pagamento Seguro",
                description: "Transações protegidas e garantidas pela nossa plataforma.",
                icon: "/assets/secure.svg",
              },
              {
                title: "Suporte 24/7",
                description: "Estamos sempre aqui para ajudar, a qualquer hora.",
                icon: "/assets/support.svg",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={50}
                  height={50}
                  className="mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-blue-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-900 to-orange-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ajuda Mecânica Quando Você Mais Precisa</h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Conectamos você aos melhores mecânicos da sua região, a qualquer momento.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/cadastro"
              className="inline-block bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all"
            >
              Solicitar Mecânico
            </Link>
            <Link
              href="/cadastro"
              className="inline-block bg-transparent border-2 border-white text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-white hover:text-orange-500 transition-all"
            >
              Sou Mecânico
            </Link>
          </div>
        </div>
      </section>

      {/* Depoiments Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">Depoimentos</h2>
          <p className="text-lg text-gray-600 mb-12">O que nossos clientes dizem</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "João Silva",
                text: "Fiquei parado na estrada e o SOS Mecânicos me salvou em menos de 20 minutos!",
                avatar: "/assets/avatar-joao.png",
              },
              {
                name: "Maria Oliveira",
                text: "Atendimento rápido e preço justo. Recomendo a todos!",
                avatar: "/assets/avatar-maria.png",
              },
              {
                name: "Pedro Santos",
                text: "A melhor plataforma para encontrar mecânicos confiáveis.",
                avatar: "/assets/avatar-pedro.png",
              },
            ].map((depoiment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="p-6 bg-white rounded-lg shadow-lg"
              >
                <Image
                  src={depoiment.avatar}
                  alt={depoiment.name}
                  width={70}
                  height={70}
                  className="rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 italic mb-4">&ldquo;{depoiment.text}&rdquo;</p>
                <h3 className="text-lg font-semibold text-blue-900">{depoiment.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}