
import { Sidebar } from '@/components/sidebar/Sidebar';




export default function AjudaDashboard() {
  return (
    <div className="sm:ml-14 p-6 bg-gray-100 min-h-screen w-full">
      <Sidebar />
      <main className='flex flex-col'>
        <h2>Sua página de suporte e ajuda!</h2>
      </main>
    </div>


  );
}
