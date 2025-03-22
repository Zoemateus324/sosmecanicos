import React, { useState } from 'react';
import { X } from 'lucide-react';

type AddVehicleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleInput) => void;
};

type VehicleInput = {
  vehicle_type: 'carro' | 'moto' | 'caminhao' | 'van';
  model: string;
  year: string;
  plate: string;
  mileage: string;
};

const initialFormData: VehicleInput = {
  vehicle_type: 'carro',
  model: '',
  year: '',
  plate: '',
  mileage: ''
};

const vehicleTypes = [
  { value: 'carro', label: 'Carro' },
  { value: 'moto', label: 'Moto' },
  { value: 'caminhao', label: 'Caminhão' },
  { value: 'van', label: 'Van' }
];

export function AddVehicleModal({ isOpen, onClose, onSubmit }: AddVehicleModalProps) {
  const [formData, setFormData] = useState<VehicleInput>(initialFormData);
  const [errors, setErrors] = useState<Partial<VehicleInput>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Partial<VehicleInput> = {};
    
    if (!formData.vehicle_type) {
      newErrors.vehicle_type = 'Tipo de veículo é obrigatório';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Modelo é obrigatório';
    }

    if (!formData.year) {
      newErrors.year = 'Ano é obrigatório';
    } else {
      const year = parseInt(formData.year);
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
        newErrors.year = 'Ano inválido';
      }
    }

    if (!formData.plate.trim()) {
      newErrors.plate = 'Placa é obrigatória';
    }

    if (!formData.mileage) {
      newErrors.mileage = 'Quilometragem é obrigatória';
    } else {
      const mileage = parseInt(formData.mileage);
      if (isNaN(mileage) || mileage < 0) {
        newErrors.mileage = 'Quilometragem inválida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      setFormData(initialFormData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name as keyof VehicleInput]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={() => {
            setFormData(initialFormData);
            setErrors({});
            onClose();
          }}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-6">Adicionar Novo Veículo</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Veículo
            </label>
            <select
              id="vehicle_type"
              name="vehicle_type"
              value={formData.vehicle_type}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                errors.vehicle_type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {vehicleTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.vehicle_type && (
              <p className="mt-1 text-sm text-red-600">{errors.vehicle_type}</p>
            )}
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Modelo
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                errors.model ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Fiat Prêmio"
            />
            {errors.model && (
              <p className="mt-1 text-sm text-red-600">{errors.model}</p>
            )}
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Ano
            </label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear() + 1}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                errors.year ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: 1990"
            />
            {errors.year && (
              <p className="mt-1 text-sm text-red-600">{errors.year}</p>
            )}
          </div>

          <div>
            <label htmlFor="plate" className="block text-sm font-medium text-gray-700 mb-1">
              Placa
            </label>
            <input
              type="text"
              id="plate"
              name="plate"
              value={formData.plate}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                errors.plate ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: ABC1234"
            />
            {errors.plate && (
              <p className="mt-1 text-sm text-red-600">{errors.plate}</p>
            )}
          </div>

          <div>
            <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">
              Quilometragem
            </label>
            <input
              type="number"
              id="mileage"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                errors.mileage ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: 25000"
            />
            {errors.mileage && (
              <p className="mt-1 text-sm text-red-600">{errors.mileage}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setFormData(initialFormData);
                setErrors({});
                onClose();
              }}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Adicionar Veículo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 