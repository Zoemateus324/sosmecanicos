// src/components/PaymentModal.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  serviceType: string;
  serviceId: string;
  providerId: string;
  onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, amount, serviceType, serviceId, providerId, onSuccess }: PaymentModalProps) {
  const handlePayment = () => {
    // Simular lógica de pagamento (substitua por integração real com API de pagamento)
    console.log(`Processando pagamento de R$${amount} para serviço ${serviceType} (ID: ${serviceId})`);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Processar Pagamento</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Valor: R$ {amount.toFixed(2)}</p>
          <p>Tipo de Serviço: {serviceType}</p>
          <p>ID do Serviço: {serviceId}</p>
          <p>ID do Provedor: {providerId}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handlePayment}>Confirmar Pagamento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}