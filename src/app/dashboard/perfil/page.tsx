'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabase } from '@/components/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea'; 

interface Profile {
  id: string;
  full_name: string;
  user_type: string;
  email: string;
  telefone: string;
  endereco: string;
  data_nascimento: string;
  bio: string;
}

export default function PerfilPage() {
  const { user } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!user?.id || !supabase) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      setError('Erro ao carregar o perfil: ' + error.message);
      toast.error('Erro ao carregar o perfil', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
    } else {
      setProfile(data);
    }
    setLoading(false);
  }, [user?.id, supabase]);

  useEffect(() => {
    fetchProfile();
  }, [user?.id, supabase, fetchProfile]);

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !supabase || !profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        email: profile.email,
        telefone: profile.telefone,
        endereco: profile.endereco,
        data_nascimento: profile.data_nascimento,
        bio: profile.bio,
      })
      .eq('id', user.id);

    if (error) {
      toast.error('Erro ao atualizar o perfil: ' + error.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
    } else {
      toast.success('Perfil atualizado com sucesso!', {
        style: { backgroundColor: '#4ADE80', color: '#ffffff' },
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-purple-700">Meu Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={profile?.full_name || ''}
                onChange={(e) => setProfile({ ...profile!, full_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                onChange={(e) => setProfile({ ...profile!, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={profile?.telefone || ''}
                onChange={(e) => setProfile({ ...profile!, telefone: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={profile?.endereco || ''}
                onChange={(e) => setProfile({ ...profile!, endereco: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={profile?.data_nascimento || ''}
                onChange={(e) => setProfile({ ...profile!, data_nascimento: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile?.bio || ''}
                onChange={(e) => setProfile({ ...profile!, bio: e.target.value })}
                className="mt-1"
              />
            </div>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
              Salvar Alterações
            </Button>
          </form>
          <Button
            onClick={() => router.push('/dashboard/cliente')}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
          >
            Voltar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}