"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Import other components or icons as needed (e.g., for vehicle info, location)

// Define a more generic type for service requests
export interface ServiceRequest {
  id: number;
  status: string;
  description?: string | null;
  location?: string | null;
  origin?: string | null;
  destination?: string | null;
  estimated_price?: number | null;
  // Add fields for different request types (mechanic, tow, insurance)
  vehicle?: {
    id: number;
    modelo: string;
    marca: string;
    ano: string;
  } | null;
  // Add fields specific to tow (e.g., tow truck info) or insurance (e.g., policy info)
  service_type?: 'mechanic' | 'tow' | 'insurance' | string; // Add service type field
  client_name?: string | null; // Add client name
  created_at?: string | null; // Add created at
}

interface ServiceRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  // Add handlers for actions (edit, cancel, accept)
  onEdit?: (request: ServiceRequest) => void;
  onCancel?: (requestId: number) => void;
  onAcceptAndPay?: (request: ServiceRequest) => void;
}

export function ServiceRequestDetailsModal({ isOpen, onClose, request, onEdit, onCancel, onAcceptAndPay }: ServiceRequestDetailsModalProps) {
  if (!request) return null; // Don't render if no request is selected

  // Helper to determine service type display
  const getServiceTypeDisplay = (type?: string | null) => {
    switch (type) {
      case 'mechanic': return 'Mecânico';
      case 'tow': return 'Guincho';
      case 'insurance': return 'Seguro';
      default: return 'Desconhecido';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Solicitação</DialogTitle>
          <DialogDescription>
            Informações completas sobre a solicitação de serviço.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium col-span-1">Tipo:</span>
            <span className="text-sm col-span-2">{getServiceTypeDisplay(request.service_type)}</span>
          </div>
          {request.client_name && (
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium col-span-1">Cliente:</span>
              <span className="text-sm col-span-2">{request.client_name}</span>
            </div>
          )}
          {request.created_at && (
             <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium col-span-1">Data:</span>
              <span className="text-sm col-span-2">{new Date(request.created_at).toLocaleDateString()}</span>
            </div>
          )}
          {request.vehicle && (
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium col-span-1">Veículo:</span>
              <span className="text-sm col-span-2">{request.vehicle.marca} {request.vehicle.modelo} ({request.vehicle.ano})</span>
            </div>
          )}
          {request.description && (
             <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium col-span-1">Descrição:</span>
              <span className="text-sm col-span-2">{request.description}</span>
            </div>
          )}
          {request.location && (
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium col-span-1">Localização:</span>
              <span className="text-sm col-span-2">{request.location}</span>
            </div>
          )}
           {(request.origin || request.destination) && (
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium col-span-1">Origem/Destino:</span>
              <span className="text-sm col-span-2">{request.origin} {request.origin && request.destination ? 'para' : ''} {request.destination}</span>
            </div>
          )}
          {request.estimated_price !== null && request.estimated_price !== undefined && (
             <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium col-span-1">Valor Estimado:</span>
              <span className="text-sm col-span-2">R$ {request.estimated_price.toFixed(2)}</span>
            </div>
          )}
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium col-span-1">Status:</span>
             <Badge variant={
                 request.status === 'pending' ? 'secondary' :
                 request.status === 'in_progress' ? 'default' :
                 request.status === 'completed' ? 'default' :
                 request.status === 'cancelled' ? 'destructive' :
                 'outline'
             }>
                 {request.status}
             </Badge>
          </div>
          {/* Add more details specific to each request type here */}
          
        </div>
        <div className="flex justify-end gap-2 mt-4">
          {/* Action Buttons (conditional based on status and user role) */}
          {/* Example: Edit button for pending requests by the client */}
          {request.status === 'pending' && onEdit && (
             <Button variant="outline" size="sm" onClick={() => onEdit(request)}>Editar</Button>
          )}
          {/* Example: Cancel button for pending/in_progress requests by the client */}
          {(request.status === 'pending' || request.status === 'in_progress') && onCancel && (
             <Button variant="destructive" size="sm" onClick={() => onCancel(request.id)}>Cancelar</Button>
          )}
           {/* Example: Accept and Pay button for pending requests by the client */}
           {request.status === 'pending' && onAcceptAndPay && (
             <Button variant="default" size="sm" onClick={() => onAcceptAndPay(request)}>Aceitar e Pagar</Button>
           )}
          {/* Add other buttons as needed (e.g., Finalizar for provider, Review for client after completion) */}
        </div>
      </DialogContent>
    </Dialog>
  );
} 