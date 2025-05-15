import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, ArrowRightCircle } from "lucide-react";

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

interface ServiceRequestListProps {
  requests: ServiceRequest[];
  onViewDetails: (request: ServiceRequest) => void;
  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
  onComplete: (requestId: string) => Promise<void>;
}

export default function ServiceRequestList({
  requests,
  onViewDetails,
  onAccept,
  onReject,
  onComplete,
}: ServiceRequestListProps) {
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const handleAction = async (
    requestId: string,
    action: (id: string) => Promise<void>
  ) => {
    setLoadingStates((prev) => ({ ...prev, [requestId]: true }));
    try {
      await action(requestId);
    } catch (err) {
      console.error('Error performing action:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Aceito</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{request.user.name}</CardTitle>
                <CardDescription>{request.user.email}</CardDescription>
              </div>
              {getStatusBadge(request.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <span>{new Date(request.created_at).toLocaleDateString()}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Veículo:</span> {request.vehicle.model} - {request.vehicle.plate}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => onViewDetails(request)}
            >
              Ver Detalhes
            </Button>
            <div className="flex gap-2">
              {request.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleAction(request.id, onReject)}
                    disabled={loadingStates[request.id]}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Rejeitar
                  </Button>
                  <Button
                    onClick={() => handleAction(request.id, onAccept)}
                    disabled={loadingStates[request.id]}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Aceitar
                  </Button>
                </>
              )}
              {request.status === 'accepted' && (
                <Button
                  onClick={() => handleAction(request.id, onComplete)}
                  disabled={loadingStates[request.id]}
                >
                  <ArrowRightCircle className="mr-2 h-4 w-4" />
                  Concluir
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 