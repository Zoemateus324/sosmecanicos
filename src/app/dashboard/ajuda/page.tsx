
import { Sidebar } from '@/components/sidebar/Sidebar';




import React, { useState } from 'react';

export default function AjudaDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="flex flex-col">
       <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className='flex-1  container mx-auto p-4 flex justify-center items-start w-full'>
        <h2>Sua página de suporte e ajuda!</h2>
      </main>
    </div>
  );
}
