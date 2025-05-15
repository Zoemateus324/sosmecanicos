import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, X, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

// Simulação de upload (substitua por sua integração real)
async function fakeUploadFile({ file }: { file: File }): Promise<{ file_url: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ file_url: URL.createObjectURL(file) });
    }, 1000);
  });
}

export default function ServiceRequestForm({ vehicles, onSubmit, onCancel, initialData }: ServiceRequestFormProps) {
  const [formData, setFormData] = useState({
    vehicle_id: "",
    problem_description: "",
    images: [] as string[],
    videos: [] as string[],
    location: "",
    needs_tow: false
  });

  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (initialData) setFormData({
      vehicle_id: initialData.vehicle_id || "",
      problem_description: initialData.problem_description || "",
      images: initialData.images || [],
      videos: initialData.videos || [],
      location: initialData.location || "",
      needs_tow: initialData.needs_tow || false
    });
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    const uploadPromises = files.map(async (file) => {
      try {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: Math.min(95, (prev[file.name] || 0) + 5)
          }));
        }, 100);
        // Substitua fakeUploadFile por sua função real de upload
        const { file_url } = await fakeUploadFile({ file });
        clearInterval(progressInterval);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        if (isImage) {
          setFormData((prev) => ({ ...prev, images: [...prev.images, file_url] }));
        } else if (isVideo) {
          setFormData((prev) => ({ ...prev, videos: [...prev.videos, file_url] }));
        }
        return file_url;
      } catch (error) {
        console.error(`Erro ao fazer upload do arquivo ${file.name}:`, error);
        return null;
      }
    });
    await Promise.all(uploadPromises);
    setUploading(false);
  };

  const removeFile = (url: string, type: "images" | "videos") => {
    setFormData((prev) => ({ ...prev, [type]: prev[type].filter((fileUrl: string) => fileUrl !== url) }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.vehicle_id) {
      newErrors.vehicle_id = "Selecione um veículo";
    }
    if (!formData.problem_description || formData.problem_description.trim().length < 10) {
      newErrors.problem_description = "Descrição do problema deve ter pelo menos 10 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="vehicle_id">
          Veículo <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.vehicle_id}
          onValueChange={(value) => handleSelectChange("vehicle_id", value)}
        >
          <SelectTrigger className={errors.vehicle_id ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecione um veículo" />
          </SelectTrigger>
          <SelectContent>
            {vehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.marca} • {vehicle.placa}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.vehicle_id && (
          <p className="text-sm text-red-500">{errors.vehicle_id}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="problem_description">
          Descrição do Problema <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="problem_description"
          name="problem_description"
          value={formData.problem_description}
          onChange={handleChange}
          placeholder="Descreva em detalhes o problema que está enfrentando..."
          rows={4}
          className={errors.problem_description ? "border-red-500" : ""}
        />
        {errors.problem_description ? (
          <p className="text-sm text-red-500">{errors.problem_description}</p>
        ) : (
          <p className="text-sm text-gray-500">
            Quanto mais detalhes você fornecer, mais fácil será para o mecânico entender o problema.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">
          Localização
        </Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Ex: Rua Exemplo, 123 - Bairro, Cidade"
        />
        <p className="text-sm text-gray-500">
          Forneça sua localização para atendimento local (opcional).
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file_upload">
          Upload de Imagens/Vídeos
        </Label>
        <div className="border-2 border-dashed rounded-md p-4 text-center">
          <Input
            id="file_upload"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <label htmlFor="file_upload" className="cursor-pointer flex flex-col items-center">
            {uploading ? (
              <span className="h-10 w-10 animate-spin inline-block border-4 border-current border-t-transparent text-blue-600 rounded-full mb-2"></span>
            ) : (
              <Upload className="h-10 w-10 text-blue-500 mb-2" />
            )}
            <span className="text-sm font-medium text-blue-600">Clique para selecionar</span>
            <span className="text-xs text-gray-500 mt-1">Ou arraste arquivos aqui</span>
          </label>
        </div>
        <p className="text-sm text-gray-500">
          Adicione fotos ou vídeos do problema para ajudar o mecânico a diagnosticar.
        </p>
      </div>

      {(formData.images.length > 0 || formData.videos.length > 0) && (
        <div className="border rounded-md p-3">
          <h4 className="font-medium mb-2">Arquivos carregados</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {formData.images.map((url, index) => (
              <div key={`img-${index}`} className="relative group">
                <img
                  src={url}
                  alt={`Imagem ${index + 1}`}
                  className="h-20 w-full object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeFile(url, 'images')}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {formData.videos.map((url, index) => (
              <div key={`vid-${index}`} className="relative group">
                <div className="h-20 w-full border rounded flex items-center justify-center bg-gray-100">
                  <video
                    src={url}
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(url, 'videos')}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploading && Object.keys(uploadProgress).map((fileName) => (
        <div key={fileName} className="flex items-center gap-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress[fileName]}%` }}
            ></div>
          </div>
          <span className="text-xs whitespace-nowrap">
            {uploadProgress[fileName] < 100 ? (
              `${uploadProgress[fileName]}%`
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </span>
        </div>
      ))}

      <div className="flex items-start space-x-2 pt-2">
        <Checkbox
          id="needs_tow"
          name="needs_tow"
          checked={formData.needs_tow}
          onCheckedChange={(checked: boolean) => {
            setFormData((prev) => ({
              ...prev,
              needs_tow: checked
            }));
          }}
        />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor="needs_tow"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Necessito de serviço de guincho
          </label>
          <p className="text-sm text-gray-500">
            Marque esta opção se o veículo não pode se locomover.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin inline-block border-2 border-current border-t-transparent text-white rounded-full"></span>
              Carregando...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Enviar Solicitação
            </>
          )}
        </Button>
      </div>
    </form>
  );
} 