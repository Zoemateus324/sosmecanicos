'use client';

import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";



export default function veiculosDashboard() {
    return (
        <div className="flex gap-[2%] flex-wrap content-start">
            <Sidebar/>
            
            <div className="flex-1 p-4 md:p-6 w-full container mx-auto sm:px-4">
            <Card>
                <CardContent>
                    <CardTitle>Veículos</CardTitle>
                </CardContent>
            </Card>
            </div>
        </div>
    );
}