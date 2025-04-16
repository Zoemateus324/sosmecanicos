"use client"
import Link from "next/link";
import {motion} from "framer-motion";
import Image from "next/image";
export default function Home(){
  return(
    <div className="min-h-screen bg-neutral-light">
      {/* Hero Section */}
      <section className="bg-primary text-neutral-light py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              SOS Mecânicos: Sua Solução Automotiva
            </h1>
            <p className="text-lg mb-6">
              Conectamos você a mecânicos, guinchos e seguradoras de forma rápida e segura.
            </p>
            <Link
              href="/cadastro"
              className="bg-secondary text-neutral py-3 px-6 rounded-lg text-lg hover:bg-yellow-600"
            >
              Cadastre-se Agora
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 mt-8 md:mt-0"
          >
            <Image
              src="/assets/hero-car.png"
              alt="Carro"
              width={600}
              height={400}
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-neutral-light">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">
            Por que escolher o SOS Mecânicos?
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
                description: "Pague com PIX, boleto ou cartão.",
                icon: "/assets/secure.svg",
              },
              {
                title: "Suporte 24/7",
                description: "Estamos sempre aqui para ajudar.",
                icon: "/assets/support.svg",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="p-6 bg-white rounded-lg shadow-md text-center"
              >
                <Image src={feature.icon} alt={feature.title} width={50} height={50} className="mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral mb-2">{feature.title}</h3>
                <p className="text-neutral">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-accent text-neutral-light py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-lg mb-6">
            Junte-se a milhares de usuários e tenha assistência veicular na palma da mão.
          </p>
          <Link
            href="/cadastro"
            className="bg-secondary text-neutral py-3 px-6 rounded-lg text-lg hover:bg-yellow-600"
          >
            Comece Agora
          </Link>
        </div>
      </section>
    </div>
  );
}