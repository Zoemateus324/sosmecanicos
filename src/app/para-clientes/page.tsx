import Link from "next/link";

export default function ParaClientes() {
  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h2 className="text-3xl font-bold text-primary mb-4">Para Clientes</h2>
      <section className="bg-neutral-light p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-neutral mb-4">Benefícios para Você</h3>
        <ul className="list-disc pl-6 text-neutral">
          <li>Solicite serviços com poucos cliques.</li>
          <li>Escolha entre várias propostas.</li>
          <li>Pague de forma segura com PIX, boleto ou cartão.</li>
        </ul>
        <Link
          href="/cadastro"
          className="bg-secondary text-neutral py-3 px-6 rounded-lg mt-6 inline-block hover:bg-yellow-600"
        >
          Comece Agora
        </Link>
      </section>
    </div>
  );
}