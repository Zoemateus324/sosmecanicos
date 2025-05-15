import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, CheckCircle, XCircle, ArrowRightCircle, Car, Truck, DollarSign, Star } from "lucide-react";

interface ServiceRequestDetailsProps {
  request: any;
  vehicle: any;
  onCancel: () => void;
  canCancel: boolean;
  onClose: () => void;
  onReview: (reviewData: any) => void;
  hasReviewed: boolean;
  currentUser: any;
}

export default function ServiceRequestDetails({ request, vehicle, onCancel, canCancel, onClose, onReview, hasReviewed, currentUser }: ServiceRequestDetailsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Mapeia o status para texto e ícone
  const getStatusInfo = (status: string) => {
    const statusMap: any = {
      "pendente": { text: "Pendente", icon: Clock, color: "text-yellow-500 bg-yellow-100" },
      "aceito": { text: "Aceito", icon: ArrowRightCircle, color: "text-blue-500 bg-blue-100" },
      "orçamento_enviado": { text: "Orçamento Enviado", icon: ArrowRightCircle, color: "text-blue-500 bg-blue-100" },
      "em_andamento": { text: "Em Andamento", icon: ArrowRightCircle, color: "text-blue-500 bg-blue-100" },
      "concluído": { text: "Concluído", icon: CheckCircle, color: "text-green-500 bg-green-100" },
      "cancelado": { text: "Cancelado", icon: XCircle, color: "text-red-500 bg-red-100" }
    };
    return statusMap[status] || { text: "Desconhecido", icon: Clock, color: "text-gray-500 bg-gray-100" };
  };

  const { icon: StatusIcon, text: statusText, color: statusColor } = getStatusInfo(request.status);
  const createdDate = new Date(request.created_date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Verifica se o serviço pode ser avaliado (concluído e pelo usuário atual)
  const canReview = request.status === "concluído" && request.mechanic_id && !hasReviewed;

  const handleSubmitReview = (reviewData: any) => {
    onReview({
      ...reviewData,
      mechanic_id: request.mechanic_id,
      service_request_id: request.id,
      customer_id: currentUser.id
    });
    setShowReviewForm(false);
  };

  return (
    <div className="py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="flex items-center gap-3 mb-3 sm:mb-0">
          <div className="p-3 rounded-full bg-blue-100">
            <Car className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{vehicle.model}</h3>
            <p className="text-gray-500">Placa: {vehicle.plate}</p>
          </div>
        </div>
        <Badge className={`${statusColor} py-1.5 px-3 text-sm`}>
          <StatusIcon className="h-4 w-4 mr-1.5" />
          {statusText}
        </Badge>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Descrição do Problema</h4>
          <p className="text-gray-800 whitespace-pre-wrap">{request.problem_description}</p>
        </div>

        {request.location && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Localização</h4>
            <p className="text-gray-800">{request.location}</p>
          </div>
        )}

        {request.needs_tow && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center gap-2">
            <Truck className="h-5 w-5 text-amber-500" />
            <p className="text-amber-700">Solicitação com serviço de guincho</p>
          </div>
        )}

        {/* Imagens anexadas */}
        {request.images && request.images.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Imagens Anexadas</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {request.images.map((url: string, index: number) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={url}
                    alt={`Imagem ${index + 1}`}
                    className="rounded-md border object-cover h-32 w-full"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Vídeos anexados */}
        {request.videos && request.videos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Vídeos Anexados</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {request.videos.map((url: string, index: number) => (
                <div key={index} className="relative rounded-md overflow-hidden aspect-video">
                  <video
                    src={url}
                    controls
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detalhes do orçamento (se disponível) */}
        {request.budget_value && (
          <div className="border rounded-md p-4">
            <h4 className="text-md font-semibold mb-3 flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-green-600" />
              Detalhes do Orçamento
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Valor do serviço:</span>
                <span>R$ {request.budget_value.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxa:</span>
                <span>R$ {(request.final_value - request.budget_value).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Valor total:</span>
                <span>R$ {request.final_value.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Formulário de avaliação */}
        {canReview && !showReviewForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
            <h4 className="font-medium mb-2 flex items-center text-blue-800">
              <Star className="h-4 w-4 mr-2 text-blue-600" />
              Avalie o serviço realizado
            </h4>
            <p className="text-sm text-blue-700 mb-3">
              Sua avaliação ajuda outros usuários e incentiva serviços de qualidade.
            </p>
            <Button
              onClick={() => setShowReviewForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Star className="h-4 w-4 mr-2" />
              Avaliar Serviço
            </Button>
          </div>
        )}

        {showReviewForm && (
          <div className="border rounded-md p-4 bg-gray-50">
            <h4 className="font-medium mb-4">Avaliar Serviço</h4>
            <div className="text-center py-4">
              <p>Sistema de avaliações em implementação</p>
              <Button
                onClick={() => setShowReviewForm(false)}
                className="mt-4"
                variant="outline"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}

        {hasReviewed && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="font-medium">Você já avaliou este serviço</p>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Obrigado pelo feedback! Sua avaliação ajuda outros usuários.
            </p>
          </div>
        )}

        <div className="text-sm text-gray-500">
          Solicitação criada em {createdDate}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        {canCancel && (
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
            onClick={onCancel}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancelar Solicitação
          </Button>
        )}
        <Button onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
} 