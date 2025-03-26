import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export function Profile() {
  const { profile, setProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (data) {
        setProfile(data);
      }
      
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Perfil do Cliente</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Editar
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Endereço
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Nome Completo</h3>
              <p className="mt-1 text-sm text-gray-900">{profile.full_name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Telefone</h3>
              <p className="mt-1 text-sm text-gray-900">{profile.phone || 'Não informado'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Endereço</h3>
              <p className="mt-1 text-sm text-gray-900">{profile.address || 'Não informado'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Membro desde</h3>
              <p className="mt-1 text-sm text-gray-900">
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString('pt-BR')
                  : 'Não disponível'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 