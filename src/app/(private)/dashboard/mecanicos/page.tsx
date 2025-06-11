'use client';
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, FilterX, Hammer, MapPin, Phone, Star } from "lucide-react";
import { Input } from "@/components/ui/input";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { toast } from "sonner";

// Define the Mechanic type
type Mecanicos = {
    id: string;
    company_name: string;
    rating: number | null;
    services_completed: number | null;
    endereco: string | null;
    cidade: string | null;
    estado: string | null;
    telefone: string | null;
    especialidade: string[] | null;
    zip_code: string | null;
    avatar_url: string | null;
};

export default function MecanicosDashboard() {
    const supabase = useSupabase();
    const [mecanicos, setMecanicos] = useState<Mecanicos[]>([]);
    const [loading, setLoading] = useState(true);
    const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
    const [ratingFilter, setRatingFilter] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const fetchMecanicos = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('profiles')
                .select(`
                    id,
                    full_name,
                    avatar_url,
                    endereco,
                    cidade,
                    estado,
                    zip_code,
                    telefone,                    
                    rating,
                    services_completed,
                    services
                `)
                .eq("user_type", "mecanico" );

            if (specialtyFilter !== "all") {
                query = query.ilike('services', `%${specialtyFilter}%`);
            }

            if (ratingFilter > 0) {
                query = query.gte('rating', ratingFilter);
            }

            if (searchTerm) {
                query = query.or(`
                    full_name.ilike.%${searchTerm}%,
                    endereco.ilike.%${searchTerm}%,
                    cidade.ilike.%${searchTerm}%,
                    zip_code.ilike.%${searchTerm}%,
                    services.ilike.%${searchTerm}%
                `);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Erro ao buscar mecânicos detalhado:", error);
                toast.error("Erro ao carregar mecânicos. Tente novamente mais tarde.");
                setMecanicos([]);
            } else {
                const mecanicosData: Mecanicos[] = data.map(item => ({
                    id: item.id,
                    company_name: item.full_name || 'N/A',
                    avatar_url: item.avatar_url || null,
                    endereco: item.endereco || null,
                    cidade: item.cidade || null,
                    estado: item.estado || null,
                    zip_code: item.zip_code || null,
                    telefone: item.telefone || null,
                    especialidade: Array.isArray(item.services) ? item.services as string[] : null,
                    rating: item.rating || null,
                    services_completed: item.services_completed || null,
                }));
                setMecanicos(mecanicosData);
            }
        } catch (error) {
            console.error("Erro inesperado ao buscar mecânicos:", error);
            toast.error("Ocorreu um erro inesperado ao carregar os mecânicos.");
            setMecanicos([]);
        } finally {
            setLoading(false);
        }
    }, [supabase, specialtyFilter, ratingFilter, searchTerm]);

    useEffect(() => {
        fetchMecanicos();
    }, [fetchMecanicos, specialtyFilter, ratingFilter, searchTerm, supabase]);

    const isFilterActive = specialtyFilter !== "all" || ratingFilter !== 0 || searchTerm !== "";

    const handleClearFilters = () => {
        setSpecialtyFilter("all");
        setRatingFilter(0);
        setSearchTerm("");
    };

    const handleViewMecanicos = (id: string) => {
        alert(`Ver detalhes do mecânico com ID: ${id}`);
    };

    return (
        <div className="flex gap-[2%] flex-wrap content-start">
            <Sidebar />
            <div className="flex-1 p-4 md:p-6 w-full container mx-auto">
                
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mecânicos</h1>
          <p className="text-gray-500">Encontre os melhores mecânicos para seu veículo</p>
         

      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
             <Input
                placeholder="Buscar por nome, endereço, CEP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
             />
          </div>
          
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por especialidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as especialidades</SelectItem>
              <SelectItem value="motor">Motor</SelectItem>
              <SelectItem value="freios">Freios</SelectItem>
              <SelectItem value="suspensão">Suspensão</SelectItem>
              <SelectItem value="elétrica">Elétrica</SelectItem>
              <SelectItem value="funilaria">Funilaria</SelectItem>
              <SelectItem value="geral">Serviços Gerais</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ratingFilter.toString()} onValueChange={(value) => setRatingFilter(Number(value))}>
            <SelectTrigger>
               <SelectValue placeholder="Filtrar por avaliação" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="0">Qualquer avaliação</SelectItem>
               <SelectItem value="4">4 estrelas ou mais</SelectItem>
               <SelectItem value="3">3 estrelas ou mais</SelectItem>
               <SelectItem value="2">2 estrelas ou mais</SelectItem>
               <SelectItem value="1">1 estrela ou mais</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="mt-2 md:mt-0"
            onClick={handleClearFilters}
            disabled={!isFilterActive}
          >
            <FilterX className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-center py-8"><p>Carregando mecânicos...</p></div>
        ) : mecanicos.length > 0 ? (
          mecanicos.map((mecanicos: Mecanicos) => (
            <Card key={mecanicos.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-start">
                  <span>{mecanicos.company_name}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.round(mecanicos.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                      />
                    ))}
                  </div>
                </CardTitle>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500">
                    {mecanicos.services_completed || 0} {mecanicos.services_completed === 1 ? "serviço realizado" : "serviços realizados"}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-700 truncate">
                    {mecanicos.endereco || "Endereço não disponível"}{mecanicos.cidade ? `, ${mecanicos.cidade}` : ''}{mecanicos.estado ? `, ${mecanicos.estado}` : ''}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-700">
                    {mecanicos.telefone || "Telefone não disponível"}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {mecanicos.especialidade?.map((specialty: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-gray-50">
                      {specialty === "motor" ? "Motor" : 
                       specialty === "freios" ? "Freios" : 
                       specialty === "suspensão" ? "Suspensão" : 
                       specialty === "elétrica" ? "Elétrica" : 
                       specialty === "funilaria" ? "Funilaria" : 
                       specialty === "geral" ? "Serviços Gerais" : 
                       specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="bg-gray-50 border-t pt-4 pb-4">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleViewMecanicos(mecanicos.id)}
                >
                  Ver Detalhes
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Hammer className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Nenhum mecânico encontrado</h3>
            <p className="mt-2 text-gray-500">
              Tente ajustar os filtros para encontrar mecânicos disponíveis.
            </p>
          </div>
        )}
      </div>
    </div>
        </div>
    );
}