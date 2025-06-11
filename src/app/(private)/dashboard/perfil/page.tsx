'use client';


import { Sidebar } from '@/components/sidebar/Sidebar';
import ContentPerfil from './components/ContentPerfil';



export default function PerfilPage() {
 

  return (
    <div className="flex gap-[2%] flex-col mx-auto">
      <Sidebar />
      <ContentPerfil/>
    </div>
  );
}
