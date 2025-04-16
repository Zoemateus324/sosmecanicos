import Image from "next/image";

export default function ComoFazemos(){
    return(
        <div className="container mx-auto p-4 min-h-screen">
            <h2 className="text-3x1 font-bold text-primary mb-4">
                Como Fazemos
            </h2>

            <section className="bg-neutral-light p-6 rounded-1g shadow-md">
            <h3 className="text-xl font-semibold text-neutral mb-4">Nosso Processo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Image src="/assets/step1.svg" alt="Passo 1" width={100} height={100} className="mx-auto mb-4" />
            <h4 className="text-lg font-semibold">Solicite o Serviço</h4>
            <p>Escolha o tipo de serviço e descreva o problema.</p>
          </div>
          <div className="text-center">
            <Image src="/assets/step2.svg" alt="Passo 2" width={100} height={100} className="mx-auto mb-4" />
            <h4 className="text-lg font-semibold">Receba Propostas</h4>
            <p>Profissionais próximos enviam orçamentos.</p>
          </div>
          <div className="text-center">
            <Image src="/assets/step3.svg" alt="Passo 3" width={100} height={100} className="mx-auto mb-4" />
            <h4 className="text-lg font-semibold">Serviço Concluído</h4>
            <p>Pague de forma segura e avalie o serviço.</p>
          </div>
        </div>
            </section>
        </div>
    );
}