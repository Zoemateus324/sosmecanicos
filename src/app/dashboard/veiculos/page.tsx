'use client';

import { Sidebar } from "@/components/sidebar/Sidebar";



export default function veiculosDashboard() {
    return (
        <div className="flex gap-[2%] flex-wrap content-start">
            <div className="w-full h-3/4">
            <Sidebar/>
            </div>
            <div className="grow h-3/4">Content</div>
        </div>
    );
}