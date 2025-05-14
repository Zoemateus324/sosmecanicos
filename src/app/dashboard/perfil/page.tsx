'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabase } from '@/components/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SupabaseClient } from '@supabase/supabase-js';

// Define interface for profile data
interface Profile {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  endereco: string | null;
  data_nascimento: string | null;
  bio: string | null;
  tipo_usuario: string;
}

// Fallback UI component for critical errors
const ErrorFallback = ({ message }: { message: string }) => (
  <div className="flex min-h-screen items-center justify-center bg-gray-100">
    <Card className="border-none shadow-md max-w-md w-full">
      <CardHeader>
        <CardTitle className="text-red-600">Erro</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{message}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
        >
          Tentar Novamente
        </Button>
      </CardContent>
    </Card>
  </div>
);

// Type guard for Supabase client
function isSupabaseInitialized(
  supabase: SupabaseClient | null
): supabase is SupabaseClient {
  return supabase !== null;
}

export default function PerfilPage() {
  const { user, userNome, userType } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editProfile, setEditProfile] = useState<Partial<Profile>>({});

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Handle logout
  const handleLogout = async () => {
    if (!isSupabaseInitialized(supabase)) {
      toast.error('Não é possível fazer logout: conexão com o banco de dados não está disponível', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Erro ao sair: ' + error.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
    } else {
      router.push('/login');
    }
  };

  // Fetch profile data
  const fetchProfile = async () => {
    if (!isSupabaseInitialized(supabase)) {
      toast.warning('Não foi possível carregar perfil: conexão com o banco de dados não está disponível', {
        style: { backgroundColor: '#FBBF24', color: '#ffffff' },
      });
      return;
    }
    if (!user?.id) {
      toast.warning('Usuário não autenticado', {
        style: { backgroundColor: '#FBBF24', color: '#ffffff' },
      });
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, nome, email, telefone, endereco, data_nascimento, bio, tipo_usuario')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Erro ao obter perfil:', error.message);
      toast.error('Erro ao obter perfil: ' + error.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      setCriticalError('Não foi possível carregar os dados do perfil.');
    } else {
      setProfile(data);
      setEditProfile(data);
    }
  };

  // Check user authentication
  const checkUser = async () => {
    if (!isSupabaseInitialized(supabase)) {
      throw new Error('Supabase client is not initialized');
    }
    const { data: sessionData, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking session:', error.message);
      throw new Error('Erro ao verificar sessão: ' + error.message);
    }
    if (!sessionData.session) {
      router.push('/login');
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!isSupabaseInitialized(supabase) || !user?.id) {
      toast.error('Não é possível atualizar perfil: conexão ou usuário inválido', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }

    // Basic validation
    if (!editProfile.nome || !editProfile.email) {
      toast.error('Nome e email são obrigatórios', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        nome: editProfile.nome,
        email: editProfile.email,
        telefone: editProfile.telefone,
        endereco: editProfile.endereco,
        data_nascimento: editProfile.data_nascimento,
        bio: editProfile.bio,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Erro ao atualizar perfil:', error.message);
      toast.error('Erro ao atualizar perfil: ' + error.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
    } else {
      toast.success('Perfil atualizado com sucesso!', {
        style: { backgroundColor: '#10B981', color: '#ffffff' },
      });
      setProfile({ ...profile, ...editProfile } as Profile);
      setIsEditDialogOpen(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!isSupabaseInitialized(supabase) || !user?.id) {
      toast.error('Não é possível excluir conta: conexão ou usuário inválido', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }

    // Delete profile first
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      console.error('Erro ao excluir perfil:', profileError.message);
      toast.error('Erro ao excluir perfil: ' + profileError.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }

    // Sign out and delete user
    const { error: authError } = await supabase.auth.signOut();
    if (authError) {
      console.error('Erro ao sair:', authError.message);
      toast.error('Erro ao sair: ' + authError.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }

    toast.success('Conta excluída com sucesso.', {
      style: { backgroundColor: '#10B981', color: '#ffffff' },
    });
    router.push('/login');
  };

  // Combined useEffect for data fetching
  useEffect(() => {
    if (!isSupabaseInitialized(supabase)) {
      toast.error('Conexão com o banco de dados não está disponível', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      setCriticalError('Não foi possível conectar ao banco de dados.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        await checkUser();
        if (user) {
          await fetchProfile();
        }
      } catch (err: any) {
        console.error('Critical error:', err.message);
        setCriticalError('Ocorreu um erro ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, user, router]);

  // Render fallback UI if critical error
  if (criticalError) {
    return <ErrorFallback message={criticalError} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col md:flex-row relative overflow-hidden">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -256 }}
        animate={{ x: isSidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
        className="md:w-64 bg-white shadow-lg h-full z-50 fixed md:static md:flex md:flex-col"
      >
        <div className="p-4 flex items-center space-x-2 border-b border-gray-200">
          <h2 className="text-xl md:text-2xl font-bold text-purple-600">SOS Mecânicos</h2>
        </div>
        <nav className="mt-6 flex-1">
          <Link
            href={userType === 'mecanico' ? '/dashboard/mecanico' : '/dashboard/cliente'}
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold hover:text-purple-700"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/solicitacoes"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold hover:text-purple-700"
          >
            Solicitações
          </Link>
          <Link
            href="/dashboard/historico"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold hover:text-purple-700"
          >
            Histórico
          </Link>
          <Link
            href="/dashboard/perfil"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold text-purple-700 bg-purple-50"
          >
            Perfil
          </Link>
          <Link
            href="/ajuda"
            className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 rounded font-semibold hover:text-purple-700"
          >
            Ajuda
          </Link>
        </nav>
        <div className="p-4 bg-white border-t md:hidden">
          <Button
            variant="outline"
            className="w-full text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
          >
            Sair
          </Button>
          <p className="text-center text-sm text-gray-500 mt-2">© 2025 SOS Mecânicos</p>
        </div>
      </motion.div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 w-full max-w-[1280px] mx-auto">
        {/* Header */}
        <header className="bg-white shadow-md p-4 mb-6 rounded-lg flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button className="md:hidden text-gray-600" onClick={toggleSidebar}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isSidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
                />
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-purple-700">Perfil</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
              <AvatarFallback>
                {userNome ? userNome.charAt(0).toUpperCase() : 'US'}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-700 hidden md:block">{userNome || 'Carregando...'}</span>
            <Button
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              Sair
            </Button>
          </div>
        </header>

        {/* Profile Content */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <Card className="border-none shadow-md">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="h-4 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : !profile ? (
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-purple-700">Erro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Não foi possível carregar os dados do perfil.</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-purple-700">Informações do Perfil</CardTitle>
                <CardDescription>Visualize e edite suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700">Nome</Label>
                    <p className="text-gray-800">{profile.nome}</p>
                  </div>
                  <div>
                    <Label className="text-gray-700">Email</Label>
                    <p className="text-gray-800">{profile.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-700">Telefone</Label>
                    <p className="text-gray-800">{profile.telefone || 'Não informado'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-700">Endereço</Label>
                    <p className="text-gray-800">{profile.endereco || 'Não informado'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-700">Data de Nascimento</Label>
                    <p className="text-gray-800">
                      {profile.data_nascimento
                        ? new Date(profile.data_nascimento).toLocaleDateString('pt-BR')
                        : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-700">Tipo de Usuário</Label>
                    <p className="text-gray-800">{profile.tipo_usuario}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-700">Bio</Label>
                  <p className="text-gray-800">{profile.bio || 'Não informado'}</p>
                </div>
                <div className="flex space-x-4">
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        Editar Perfil
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Perfil</DialogTitle>
                        <DialogDescription>Atualize suas informações pessoais</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nome">Nome</Label>
                          <Input
                            id="nome"
                            value={editProfile.nome || ''}
                            onChange={(e) =>
                              setEditProfile({ ...editProfile, nome: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editProfile.email || ''}
                            onChange={(e) =>
                              setEditProfile({ ...editProfile, email: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="telefone">Telefone</Label>
                          <Input
                            id="telefone"
                            value={editProfile.telefone || ''}
                            onChange={(e) =>
                              setEditProfile({ ...editProfile, telefone: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="endereco">Endereço</Label>
                          <Input
                            id="endereco"
                            value={editProfile.endereco || ''}
                            onChange={(e) =>
                              setEditProfile({ ...editProfile, endereco: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                          <Input
                            id="data_nascimento"
                            type="date"
                            value={editProfile.data_nascimento || ''}
                            onChange={(e) =>
                              setEditProfile({ ...editProfile, data_nascimento: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={editProfile.bio || ''}
                            onChange={(e) =>
                              setEditProfile({ ...editProfile, bio: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={handleUpdateProfile}
                        >
                          Salvar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        Excluir Conta
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmar Exclusão da Conta</DialogTitle>
                        <DialogDescription>
                          Esta ação é irreversível. Tem certeza de que deseja excluir sua conta?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsDeleteDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={handleDeleteAccount}
                        >
                          Excluir
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}