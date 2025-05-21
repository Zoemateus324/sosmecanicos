'use client';

import { Sidebar } from "@/components/sidebar/Sidebar";


export default function solicitacoesDashboard() {

  return (

    <div className="flex flex-col">
        <Sidebar />
      <div className="sm:ml-14 p-6 bg-gray-100 min-h-screen w-full">
      </div>
      

      <main className="flex-1  container mx-auto p-4 flex justify-center items-start w-full">
        <h2>Suas solicitações iram aparecer aqui</h2>
      </main>
      
    </div>
  );
}
