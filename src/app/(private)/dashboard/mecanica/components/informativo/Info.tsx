



import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


import Image from "next/image";


export function Info(){
    return(
         <div className="flex-1 p-4 md:p-6 w-full container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <Card className="bg-red-900 text-white h-75 py-4 mb-5">
                  <CardHeader>
                    <CardTitle className="flex flex-col items-center font-bold text-2xl">
                      
                      Solicitações
                      
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-3">
                    <p>Aqui você encontra solicitações.</p>
                    <Image width={200} height={100} className="w-{95px} h-auto"
                    src="/assets/solicitacoes.svg"
        
                    alt="camaro"/>
                  </CardContent>
                </Card>
                <Card className="bg-blue-900 text-white h-75 py-4 mb-5">
                  <CardHeader>
                    <CardTitle className="flex flex-col items-center font-bold text-2xl">
                      Tarefas Pendentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-3">
                    <p>Gerencie suas tarefas pendentes.</p>
                    <Image width={200} height={100} className="w-{95px} h-auto"
                    src="/assets/metricas.svg"
        
                    alt="camaro"/>
                  </CardContent>
                </Card>
                <Card className="bg-green-900 text-white h-75 py-4 mb-5">
                  <CardHeader>
                    <CardTitle className="flex flex-col items-center font-bold text-2xl">
                      Relatórios
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-3">
                    <p>Visualize seus relatórios de serviço.</p>
                    <Image width={200} height={100} className="w-{95px} h-auto"
                    src="/assets/grafico-chart.svg"
        
                    alt="grafico"/>
                  </CardContent>
                </Card>
        
                {/* More cards can be added similarly */}
              </div>
            </div>
    )
}