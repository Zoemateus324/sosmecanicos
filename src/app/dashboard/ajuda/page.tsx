
import { Sidebar } from '@/components/sidebar/Sidebar';


export default function AjudaDashboard() {
 



  return (
    <div className="flex flex-col">
       <Sidebar/>
      <main className='flex-1  container mx-auto p-4 flex justify-center items-start w-full'>
        <h2>Sua página de suporte e ajuda!</h2>
      </main>
    </div>
  );
}
