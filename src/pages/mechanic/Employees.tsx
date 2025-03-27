import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Search, X, UserPlus, AlertCircle } from 'lucide-react';

interface Employee {
  id: string;
  mechanic_id: string;
  full_name: string;
  role: string;
  specialty: string;
  phone: string;
  email: string;
  document_id: string;
  hire_date: string;
  status: string;
  created_at: string;
}

interface EmployeeFormData {
  full_name: string;
  role: string;
  specialty: string;
  phone: string;
  email: string;
  document_id: string;
  hire_date: string;
  status: string;
}

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  employee?: Employee;
  title: string;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSubmit, employee, title }) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    full_name: '',
    role: '',
    specialty: '',
    phone: '',
    email: '',
    document_id: '',
    hire_date: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employee) {
      setFormData({
        full_name: employee.full_name || '',
        role: employee.role || '',
        specialty: employee.specialty || '',
        phone: employee.phone || '',
        email: employee.email || '',
        document_id: employee.document_id || '',
        hire_date: employee.hire_date || '',
        status: employee.status || 'active'
      });
    } else {
      setFormData({
        full_name: '',
        role: '',
        specialty: '',
        phone: '',
        email: '',
        document_id: '',
        hire_date: '',
        status: 'active'
      });
    }
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao salvar o funcionário');
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
              Nome Completo *
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cargo/Função *
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especialidade
            </label>
            <input
              type="text"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documento (CPF)
              </label>
              <input
                type="text"
                name="document_id"
                value={formData.document_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Contratação
              </label>
              <input
                type="date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="vacation">Férias</option>
              <option value="leave">Licença</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-gray-900 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Funcionário'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function EmployeesPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, isAuthenticated } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalTitle, setModalTitle] = useState('Adicionar Funcionário');

  // Efeito para verificar autenticação
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Carregar funcionários
  const loadEmployees = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('mechanic_employees')
        .select('*')
        .eq('mechanic_id', user.id)
        .order('full_name', { ascending: true });

      if (fetchError) throw fetchError;

      setEmployees(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar funcionários:', err);
      setError('Não foi possível carregar a lista de funcionários');
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar dados
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      loadEmployees();
    }
  }, [authLoading, isAuthenticated, user]);

  // Adicionar/Editar funcionário
  const handleSubmitEmployee = async (data: EmployeeFormData) => {
    if (!user?.id) return;

    try {
      if (currentEmployee) {
        // Atualizar funcionário existente
        const { error: updateError } = await supabase
          .from('mechanic_employees')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentEmployee.id);

        if (updateError) throw updateError;
      } else {
        // Adicionar novo funcionário
        const { error: insertError } = await supabase
          .from('mechanic_employees')
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

      // Recarregar lista de funcionários
      await loadEmployees();
    } catch (err: any) {
      console.error('Erro ao salvar funcionário:', err);
      throw err;
    }
  };

  // Excluir funcionário
  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este funcionário?')) return;

    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('mechanic_employees')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Recarregar lista de funcionários
      await loadEmployees();
    } catch (err: any) {
      console.error('Erro ao excluir funcionário:', err);
      setError('Não foi possível excluir o funcionário');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para adicionar funcionário
  const handleAddEmployee = () => {
    setCurrentEmployee(undefined);
    setModalTitle('Adicionar Funcionário');
    setIsModalOpen(true);
  };

  // Abrir modal para editar funcionário
  const handleEditEmployee = (employee: Employee) => {
    setCurrentEmployee(employee);
    setModalTitle('Editar Funcionário');
    setIsModalOpen(true);
  };

  // Filtrar funcionários por termo de busca
  const filteredEmployees = employees.filter(employee =>
    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.specialty && employee.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
          <button
            onClick={handleAddEmployee}
            className="flex items-center space-x-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span>Adicionar Funcionário</span>
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
              placeholder="Buscar funcionários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <span className="ml-2">Carregando funcionários...</span>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchTerm
                  ? 'Nenhum funcionário encontrado com este termo de busca'
                  : 'Nenhum funcionário cadastrado. Adicione seu primeiro funcionário!'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Especialidade
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.full_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{employee.role}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{employee.specialty || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {employee.phone && <div>{employee.phone}</div>}
                          {employee.email && <div>{employee.email}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.status === 'active' ? 'bg-green-100 text-green-800' :
                          employee.status === 'inactive' ? 'bg-red-100 text-red-800' :
                          employee.status === 'vacation' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {employee.status === 'active' ? 'Ativo' :
                           employee.status === 'inactive' ? 'Inativo' :
                           employee.status === 'vacation' ? 'Férias' :
                           employee.status === 'leave' ? 'Licença' : employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <EmployeeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitEmployee}
          employee={currentEmployee}
          title={modalTitle}
        />
      )}
    </Layout>
  );
}