import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, CheckCircle, XCircle, ArrowRightCircle, Car, Truck, DollarSign, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ServiceRequest {
  id: string;
  status: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  vehicle: {
    model: string;
    plate: string;
  };
  location: {
    lat: number;
    lng: number;
  };
}

interface Review {
  rating: number;
  comment: string;
}

interface ServiceRequestDetailsProps {
  request: ServiceRequest;
  onClose: () => void;
  onSubmitReview: (requestId: string, review: Review) => Promise<void>;
}

export default function ServiceRequestDetails({ request, onClose, onSubmitReview }: ServiceRequestDetailsProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) return;

    setSubmitting(true);
    try {
      await onSubmitReview(request.id, { rating, comment });
      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Solicitação</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <div className="col-span-3">
              <p>{request.user.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <div className="col-span-3">
              <p>{request.user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vehicle" className="text-right">
              Veículo
            </Label>
            <div className="col-span-3">
              <p>{request.vehicle.model} - {request.vehicle.plate}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <div className="col-span-3">
              <p>{request.status}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Data
            </Label>
            <div className="col-span-3">
              <p>{new Date(request.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rating" className="text-right">
              Avaliação
            </Label>
            <div className="col-span-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comment" className="text-right">
              Comentário
            </Label>
            <div className="col-span-3">
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Deixe seu comentário..."
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmitReview}
            disabled={submitting || rating === 0}
          >
            {submitting ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 