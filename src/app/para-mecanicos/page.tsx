import Link from "next/link";

export default function ParaMecanicos() {
  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h2 className="text-3xl font-bold text-primary mb-4">Para Mecânicos</h2>
      <section className="bg-neutral-light p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-neutral mb-4">Por que ser um Mecânico SOS?</h3>
        <ul className="list-disc pl-6 text-neutral">
          <li>Aumente sua visibilidade com nossa plataforma.</li>
          <li>Receba solicitações de clientes próximos.</li>
          <li>Pagamentos rápidos e seguros.</li>
        </ul>
        <Link
          href="/seja-parceiro"
          className="bg-secondary text-neutral py-3 px-6 rounded-lg mt-6 inline-block hover:bg-yellow-600"
        >
          Torne-se um Parceiro
        </Link>
      </section>
    </div>
  );
}