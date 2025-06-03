"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Vehicle {
    id: number;
    placa: string;
    modelo: string;
    ano: number;
    cor: string;
    quilometragem: number;
    status: string;
    // Add any other vehicle properties you fetch or want to display
}

interface VehicleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

export function VehicleDetailsModal({ isOpen, onClose, vehicle }: VehicleDetailsModalProps) {
  if (!vehicle) return null; // Don't render if no vehicle is selected

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Veículo</DialogTitle>
          <DialogDescription>
            Informações completas sobre o veículo selecionado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium col-span-1">ID:</span>
            <span className="text-sm col-span-3">{vehicle.id}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium col-span-1">Modelo:</span>
            <span className="text-sm col-span-3">{vehicle.modelo} ({vehicle.ano})</span>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium col-span-1">Placa:</span>
            <span className="text-sm col-span-3">{vehicle.placa}</span>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium col-span-1">Cor:</span>
            <span className="text-sm col-span-3">{vehicle.cor}</span>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium col-span-1">Quilometragem:</span>
            <span className="text-sm col-span-3">{vehicle.quilometragem} km</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium col-span-1">Status:</span>
             <Badge variant={
                 vehicle.status === 'ativo' ? 'default' :
                 vehicle.status === 'inativo' ? 'destructive' :
                 'secondary'
             }>
                 {vehicle.status}
             </Badge>
          </div>
          {/* Add more details here as needed, fetched from your Supabase query */}
        </div>
        {/* Optional: Add buttons for editing/deleting from the modal if needed */}
      </DialogContent>
    </Dialog>
  );
} 