import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral text-neutral-light py-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">SOS Mecânicos</h3>
          <p>Conectando motoristas a soluções automotivas confiáveis.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Navegação</h3>
          <ul className="space-y-2">
            <li><Link href="/quem-somos" className="hover:underline">Quem Somos</Link></li>
            <li><Link href="/como-fazemos" className="hover:underline">Como Fazemos</Link></li>
            <li><Link href="/suporte" className="hover:underline">Suporte</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Seja Parte</h3>
          <ul className="space-y-2">
            <li><Link href="/trabalhe-conosco" className="hover:underline">Trabalhe Conosco</Link></li>
            <li><Link href="/cadastro" className="hover:underline">Seja Nosso Parceiro</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Redes Sociais</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Facebook</a></li>
            <li><a href="https://instagram.com/sosmecanico_of" className="hover:underline">Instagram</a></li>
            <li><a href="#" className="hover:underline">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-8">
        <p>&copy; 2025 SOS Mecânicos. Todos os direitos reservados.</p>
        <p className="text-sm font-bold">Desenvolvido por <a href="https://github.com/Zoemateus324" className="text-blue-500 hover:underline">Zoé Mateus</a></p>
      </div>
    </footer>
  );
}