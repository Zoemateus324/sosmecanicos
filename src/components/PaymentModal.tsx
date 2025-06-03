"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentForm } from "./PaymentForm";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  serviceType: 'mechanic' | 'tow' | 'insurance';
  serviceId: string;
  providerId: string;
  onSuccess?: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  amount,
  serviceType,
  serviceId,
  providerId,
  onSuccess
}: PaymentModalProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pagamento</DialogTitle>
          <DialogDescription>
            Complete o pagamento para prosseguir com o serviço.
          </DialogDescription>
        </DialogHeader>
        <PaymentForm
          amount={amount}
          serviceType={serviceType}
          serviceId={serviceId}
          providerId={providerId}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
} 