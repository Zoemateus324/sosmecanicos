import Link from "next/link";


export default function NotFound() {
  return (
  <div className=" flex flex-col gap-4 h-screen items-center justify-center">
    <h1 className=" text-4xl font-bold">404 - Página não encontrada</h1>
    <p className=" text-lg">Sentimos muito, a página que você está procurando não foi encontrada.</p>
    <Link href="/" className=" text-blue-500 hover:text-blue-600">Voltar para a página inicial</Link>
    </div>
);
}


