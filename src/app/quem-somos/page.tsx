import Image from "next/image";

export default function QuemSomos() {
  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h2 className="text-3xl font-bold text-primary mb-4">Quem Somos</h2>
      <section className="bg-neutral-light p-6 rounded-lg shadow-md flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          <h3 className="text-xl font-semibold text-neutral mb-4">Nossa Missão</h3>
          <p className="text-neutral">
            No SOS Mecânicos, conectamos motoristas a profissionais confiáveis, oferecendo
            soluções rápidas e seguras para problemas veiculares.
          </p>
        </div>
        <div className="md:w-1/2">
          <Image
            src="/assets/team.jpg"
            alt="Nossa Equipe"
            width={500}
            height={300}
            className="rounded-lg object-cover"
          />
        </div>
      </section>
    </div>
  );
}