'use client';

import { Sidebar } from "@/components/sidebar/Sidebar";
import CardVeiculos from "./components/CardVeiculos";



export default function VeiculosDashboard() {
  
    return (
        <>
            <div className="flex gap-[2%] flex-col">
                <Sidebar/>
                

                <CardVeiculos/>
           </div>
        </>
    );
}