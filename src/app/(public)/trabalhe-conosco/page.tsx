"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSupabase } from "@/components/SupabaseProvider";
import { toast } from "sonner";
import Navbar from "@/app/(public)/_components/Navbar";
import Footer from "@/app/(public)/_components/Footer";

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
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    resume: null,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = useSupabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    // Validação básica
    if (!formData.name || !formData.email || !formData.phone || !formData.position || !formData.experience) {
      toast.error("Por favor, preencha todos os campos obrigatórios.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      setLoading(false);
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Por favor, insira um email válido.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
      setLoading(false);
      return;
    }

    try {
      if (!supabase) {
        throw new Error("Conexão com o banco de dados não está disponível.");
      }

      // Upload do currículo para Supabase Storage (se existir)
      let resumeUrl: string | null = null;
      if (formData.resume) {
        const fileExt = formData.resume.name.split(".").pop();
        const fileName = `${Date.now()}_${formData.email}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(fileName, formData.resume);

        if (uploadError) {
          throw new Error("Erro ao fazer upload do currículo: " + uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from("resumes")
          .getPublicUrl(fileName);

        resumeUrl = publicUrlData.publicUrl;
      }

      // Enviar dados do formulário para a tabela 'job_applications'
      const { error: insertError } = await supabase.from("job_applications").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        experience: formData.experience,
        resume_url: resumeUrl,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        throw new Error("Erro ao enviar candidatura: " + insertError.message);
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        position: "",
        experience: "",
        resume: null,
      });
      toast.success("Candidatura enviada com sucesso! Entraremos em contato em breve.", {
        style: { backgroundColor: "#10B981", color: "#ffffff" },
      });
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error(err instanceof Error ? err.message : "Erro ao enviar candidatura.", {
        style: { backgroundColor: "#EF4444", color: "#ffffff" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validação do tipo de arquivo
      if (file.type !== "application/pdf") {
        toast.error("Por favor, envie um arquivo PDF.", {
          style: { backgroundColor: "#EF4444", color: "#ffffff" },
        });
        return;
      }
      // Validação do tamanho do arquivo (ex.: máx. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("O arquivo deve ter no máximo 5MB.", {
          style: { backgroundColor: "#EF4444", color: "#ffffff" },
        });
        return;
      }
      setFormData((prev) => ({
        ...prev,
        resume: file,
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
        <section className="bg-white p-4 md:p-8 rounded-lg shadow-lg mb-12">
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome *
              </label>
              <input
                id="name"
                type="text"
                placeholder="Nome"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                disabled={loading}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                disabled={loading}
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefone *
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Telefone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                disabled={loading}
                required
              />
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Cargo Desejado *
              </label>
              <input
                id="position"
                type="text"
                placeholder="Cargo Desejado"
                value={formData.position}
                onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                disabled={loading}
                required
              />
            </div>
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                Experiência *
              </label>
              <textarea
                id="experience"
                placeholder="Fale sobre você e suas experiências"
                value={formData.experience}
                onChange={(e) => setFormData((prev) => ({ ...prev, experience: e.target.value }))}
                className="border border-gray-300 p-3 w-full rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                disabled={loading}
                required
              />
            </div>
            <div>
              <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                Currículo (PDF, máx. 5MB)
              </label>
              <input
                id="resume"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="text-gray-600 text-sm md:text-base"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className={`bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-3 w-full rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all text-base md:text-lg ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar Candidatura"}
            </button>
            {success && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-600 text-center mt-4"
              >
                Candidatura enviada com sucesso! Entraremos em contato em breve.
              </motion.p>
            )}
          </form>
        </section>
      </div>

      <Footer />
    </div>
  );
}