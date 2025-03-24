import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { MapPin, Phone, Mail, Star, Wrench, Clock } from 'lucide-react';

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
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<MechanicStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        if (!user?.id) return;

        // Buscar perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Se for mecânico, buscar estatísticas
        if (profileData.user_type === 'mechanic') {
          const { data: statsData, error: statsError } = await supabase
            .from('mechanic_stats')
            .select('*')
            .eq('mechanic_id', user.id)
            .single();

          if (statsError) throw statsError;
          setStats(statsData);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, authLoading, navigate, user?.id]);

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
                  Membro desde {new Date(profile?.created_at || '').toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Informações de Contato</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>{profile?.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>{profile?.phone || 'Não informado'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{profile?.address || 'Não informado'}</span>
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