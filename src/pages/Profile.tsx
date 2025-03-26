import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { MapPin, Phone, Mail, Star, Wrench, Clock, Save, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Profile {
  id: string;
  user_type: 'client' | 'mechanic' | 'insurance' | 'tow';
  full_name: string;
  phone: string;
  address: string;
  email: string;
  created_at: string;
}

interface MechanicStats {
  completed_services: number;
  average_rating: number;
  total_earnings: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, isAuthenticated } = useAuth();

  const [stats, setStats] = useState<MechanicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<{
    phone: string;
    address: string;
  }>({
    phone: '',
    address: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
      return;
    }

    if (profile) {
      setEditedProfile({
        phone: profile.phone || '',
        address: profile.address || ''
      });

      // Se for mecânico, buscar estatísticas
      if (profile.user_type === 'mechanic') {
        const fetchMechanicStats = async () => {
          try {
            const { data: statsData, error: statsError } = await supabase
              .from('mechanic_stats')
              .select('*')
              .eq('mechanic_id', profile.id)
              .single();

            if (statsError) throw statsError;
            setStats(statsData);
          } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
          }
        };
        fetchMechanicStats();
      }
    }
    setLoading(false);
  }, [isAuthenticated, authLoading, navigate, profile]);

  const handleSave = async () => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          phone: editedProfile.phone,
          address: editedProfile.address
        })
        .eq('id', profile.id);

      if (error) throw error;

      // Atualizar o perfil no contexto de autenticação
      window.location.reload();
      
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Cabeçalho do Perfil */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center text-2xl font-bold text-yellow-600">
                {profile?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h1>
                <p className="text-gray-500 capitalize">{profile?.user_type}</p>
                <p className="text-sm text-gray-500">
                  Membro desde {profile?.created_at ? format(new Date(profile.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Informações de Contato</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 text-yellow-600 hover:text-yellow-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Salvando...' : 'Salvar'}</span>
                </button>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">{profile?.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Seu telefone"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                ) : (
                  <span>{profile?.phone || 'Não informado'}</span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.address}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Seu endereço"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                ) : (
                  <span>{profile?.address || 'Não informado'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Estatísticas do Mecânico */}
          {profile?.user_type === 'mechanic' && stats && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Estatísticas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <Wrench className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-500">Serviços Concluídos</p>
                    <p className="text-2xl font-bold">{stats.completed_services}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-500">Avaliação Média</p>
                    <p className="text-2xl font-bold">{stats.average_rating.toFixed(1)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-500">Ganhos Totais</p>
                    <p className="text-2xl font-bold">R$ {stats.total_earnings.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}