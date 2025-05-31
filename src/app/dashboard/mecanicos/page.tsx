'use client';
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card, CardContent } from "@/components/ui/card";

export default function MecanicosDashboard() {
    return (
        <div className="flex gap-[2%] flex-wrap content-start">
            <Sidebar />
            <div className="flex-1 p-4 md:p-6 w-full container mx-auto">
                <Card>
                    <CardContent>
                        <h1 className="text-2xl font-bold mb-4">Mecânicos</h1>
                        <p>Página destinada há mecânicos próximos da sua localização.</p>
                        {/* Adicione mais conteúdo ou componentes conforme necessário */}
                    </CardContent>
                    <CardContent>
                        <p>Em breve, você poderá encontrar mecânicos disponíveis para atender às suas necessidades.</p>
                       
                    </CardContent>
                    
                </Card>


            </div>
        </div>
    );
}