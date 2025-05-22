'use client';
import { Sidebar } from "@/components/sidebar/Sidebar";
export default function MecanicosDashboard() {
    return (
        <div className="flex flex-col gap-[2%] flex-wrap content-start">
            <Sidebar />
            <div className="flex-1  container  p-4 flex justify-center items-start w-full">
                <h1>Mecânicos</h1>
            </div>
        </div>
    );
}