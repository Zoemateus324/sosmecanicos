import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from 'next/image';

// Tipos auxiliares
interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  ano: number;
}

interface ServiceRequestFormData {
  serviceType: string;
  vehicleType: string;
  problemDescription: string;
  location: {
    lat: number;
    lng: number;
  };
  images: File[];
}

interface ServiceRequestFormProps {
  vehicles: Vehicle[];
  onSubmit: (data: ServiceRequestFormData) => Promise<void>;
  onCancel: () => void;
}

// Simulação de upload (substitua por sua integração real)
async function fakeUploadFile({ file }: { file: File }): Promise<{ file_url: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ file_url: URL.createObjectURL(file) });
    }, 1000);
  });
}

export default function ServiceRequestForm({ onSubmit, onCancel }: ServiceRequestFormProps) {
  const [formData, setFormData] = useState<ServiceRequestFormData>({
    serviceType: '',
    vehicleType: '',
    problemDescription: '',
    location: {
      lat: 0,
      lng: 0
    },
    images: []
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        images: Array.from(e.target.files!)
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="serviceType">Tipo de Serviço</Label>
        <Select
          value={formData.serviceType}
          onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}
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
        <Label htmlFor="vehicleType">Tipo de Veículo</Label>
        <Input
          id="vehicleType"
          type="text"
          value={formData.vehicleType}
          onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="problemDescription">Descrição do Problema</Label>
        <Textarea
          id="problemDescription"
          value={formData.problemDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, problemDescription: e.target.value }))}
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
        </div>
      </div>

      <div>
        <Label htmlFor="images">Imagens</Label>
        <Input
          type="file"
          id="images"
          multiple
          accept="image/*"
          onChange={handleImageChange}
        />
        {formData.images.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-4">
            {formData.images.map((file, index) => (
              <div key={index} className="relative aspect-square">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-4">
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