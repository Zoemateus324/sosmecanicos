import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceRequestFormData } from "@/types/service-request";

interface ServiceRequestFormProps {
  onSubmit: (data: ServiceRequestFormData) => Promise<void>;
  onCancel: () => void;
}

export default function ServiceRequestForm({ onSubmit, onCancel }: ServiceRequestFormProps) {
  const [formData, setFormData] = useState<ServiceRequestFormData>({
    service_type: '',
    description: '',
    location: {
      lat: 0,
      lng: 0,
      address: ''
    },
    vehicle_info: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      license_plate: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Erro ao enviar formulário');
    } finally {
      setLoading(false);
    }
  };

  const updateVehicleInfo = (field: 'make' | 'model' | 'year' | 'license_plate', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      vehicle_info: {
        ...(prev.vehicle_info || {
          make: '',
          model: '',
          year: new Date().getFullYear(),
          license_plate: ''
        }),
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="serviceType">Tipo de Serviço</Label>
        <Select
          value={formData.service_type}
          onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de serviço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="guincho">Guincho</SelectItem>
            <SelectItem value="mecanica">Mecânica</SelectItem>
            <SelectItem value="pneu">Troca de Pneu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Descrição do Problema</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="location">Localização</Label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            value={formData.location.lat}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              location: { ...prev.location, lat: Number(e.target.value) }
            }))}
            placeholder="Latitude"
            required
          />
          <Input
            type="number"
            value={formData.location.lng}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              location: { ...prev.location, lng: Number(e.target.value) }
            }))}
            placeholder="Longitude"
            required
          />
          <Input
            type="text"
            value={formData.location.address}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              location: { ...prev.location, address: e.target.value }
            }))}
            placeholder="Endereço"
            required
            className="col-span-2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="vehicleInfo">Informações do Veículo</Label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="text"
            value={formData.vehicle_info?.make || ''}
            onChange={(e) => updateVehicleInfo('make', e.target.value)}
            placeholder="Marca"
            required
          />
          <Input
            type="text"
            value={formData.vehicle_info?.model || ''}
            onChange={(e) => updateVehicleInfo('model', e.target.value)}
            placeholder="Modelo"
            required
          />
          <Input
            type="number"
            value={formData.vehicle_info?.year || new Date().getFullYear()}
            onChange={(e) => updateVehicleInfo('year', Number(e.target.value))}
            placeholder="Ano"
            required
          />
          <Input
            type="text"
            value={formData.vehicle_info?.license_plate || ''}
            onChange={(e) => updateVehicleInfo('license_plate', e.target.value)}
            placeholder="Placa"
            required
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar Solicitação'}
        </Button>
      </div>
    </form>
  );
} 