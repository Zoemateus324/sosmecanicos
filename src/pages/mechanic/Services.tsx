import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Search, X, Wrench, AlertCircle, Clock, DollarSign } from 'lucide-react';

interface Service {
  id: string;
  mechanic_id: string;
  name: string;
  description: string;
  price: number;
  estimated_time: number;
  category: string;
  created_at: string;
}

interface ServiceFormData {
  name: string;
  description: string;
  price: number;
  estimated_time: number;
  category: string;
}

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  service?: Service;
  title: string;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, onSubmit, service, title }) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    price: 0,
    estimated_time: 0,
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        price: service.price || 0,
        estimated_time: service.estimated_time || 0,
        category: service.category || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        estimated_time: 0,
        category: ''
      });
    }
  }, [service]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'estimated_time' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao salvar o serviço');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Serviço *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço (R$) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempo Estimado (min)
              </label>
              <input
                type="number"
                name="estimated_time"
                value={formData.estimated_time}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="">Selecione uma categoria</option>
              <option value="manutencao">Manutenção</option>
              <option value="reparo">Reparo</option>
              <option value="revisao">Revisão</option>
              <option value="eletrica">Elétrica</option>
              <option value="mecanica">Mecânica</option>
              <option value="funilaria">Funilaria</option>
              <option value="pintura">Pintura</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-gray-900 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Serviço'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function ServicesPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, isAuthenticated } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalTitle, setModalTitle] = useState('Adicionar Serviço');

  // Efeito para verificar autenticação
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Carregar serviços
  const loadServices = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('mechanic_services')
        .select('*')
        .eq('mechanic_id', user.id)
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      setServices(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar serviços:', err);
      setError('Não foi possível carregar a lista de serviços');
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar dados
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      loadServices();
    }
  }, [authLoading, isAuthenticated, user]);

  // Adicionar/Editar serviço
  const handleSubmitService = async (data: ServiceFormData) => {
    if (!user?.id) return;

    try {
      if (currentService) {
        // Atualizar serviço existente
        const { error: updateError } = await supabase
          .from('mechanic_services')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentService.id);

        if (updateError) throw updateError;
      } else {
        // Adicionar novo serviço
        const { error: insertError } = await supabase
          .from('mechanic_services')
          .insert([
            {
              mechanic_id: user.id,
              ...data,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

        if (insertError) throw insertError;
      }

      // Recarregar lista de serviços
      await loadServices();
    } catch (err: any) {
      console.error('Erro ao salvar serviço:', err);
      throw err;
    }
  };

  // Excluir serviço
  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) return;

    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('mechanic_services')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Recarregar lista de serviços
      await loadServices();
    } catch (err: any) {
      console.error('Erro ao excluir serviço:', err);
      setError('Não foi possível excluir o serviço');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para adicionar serviço
  const handleAddService = () => {
    setCurrentService(undefined);
    setModalTitle('Adicionar Serviço');
    setIsModalOpen(true);
  };

  // Abrir modal para editar serviço
  const handleEditService = (service: Service) => {
    setCurrentService(service);
    setModalTitle('Editar Serviço');
    setIsModalOpen(true);
  };

  // Filtrar serviços por termo de busca
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (service.category && service.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Função para formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Função para obter nome da categoria
  const getCategoryName = (category: string) => {
    const categories: {[key: string]: string} = {
      'manutencao': 'Manutenção',
      'reparo': 'Reparo',
      'revisao': 'Revisão',
      'eletrica': 'Elétrica',
      'mecanica': 'Mecânica',
      'funilaria': 'Funilaria',
      'pintura': 'Pintura',
      'outros': 'Outros'
    };
    return categories[category] || category;
  };

  // Renderização com tratamento de erros
  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          <span className="ml-2">Verificando autenticação...</span>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Serviços Prestados</h1>
          <button
            onClick={handleAddService}
            className="flex items-center space-x-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Adicionar Serviço</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-700 hover:text-red-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center mb-6 relative">
            <Search className="absolute left-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <span className="ml-2">Carregando serviços...</span>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchTerm
                  ? 'Nenhum serviço encontrado com este termo de busca'
                  : 'Nenhum serviço cadastrado. Adicione seu primeiro serviço!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditService(service)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {service.description && (
                    <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-yellow-600">
                      <DollarSign className="w-5 h-5 mr-1" />
                      <span className="font-semibold">{formatPrice(service.price)}</span>
                    </div>
                    
                    {service.estimated_time > 0 && (
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{service.estimated_time} min</span>
                      </div>
                    )}
                  </div>
                  
                  {service.category && (
                    <div className="mt-3">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        {getCategoryName(service.category)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ServiceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitService}
          service={currentService}
          title={modalTitle}
        />
      )}
    </Layout>
  );
}