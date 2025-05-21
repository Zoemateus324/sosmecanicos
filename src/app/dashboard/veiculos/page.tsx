'use client';

import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";



export default function veiculosDashboard() {
    return (
        <div className="flex flex-col">
            <Sidebar/>
            
            <div className="flex-1  container  p-4 flex justify-center items-start w-full">
            <Card className="w-full">
                <CardContent>
                    <CardTitle>Veículos</CardTitle>
                </CardContent>
            </Card>
            </div>
        </div>
    );
}