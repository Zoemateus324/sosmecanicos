'use client';
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, FilterX, Hammer, MapPin, Phone, Star } from "lucide-react";

import { useState } from "react";

// Define the Mechanic type
type Mechanic = {
    id: string;
    company_name: string;
    rating?: number;
    services_completed?: number;
    address?: string;
    phone?: string;
    specialties?: string[];
};
const mechanics: Mechanic[] = [
    {
        id: "1",
        company_name: "Oficina do João - Teste",
        rating: 4.5,
        services_completed: 120,
        address: "Rua das Flores, 123",
        phone: "(11) 99999-9999",
        specialties: ["motor", "freios", "elétrica"]
    },
    {
        id: "2",
        company_name: "Auto Center Maria",
        rating: 5,
        services_completed: 200,
        address: "Av. Brasil, 456",
        phone: "(11) 98888-8888",
        specialties: ["suspensão", "funilaria", "geral"]
    }
    // Adicione mais mecânicos conforme necessário
];

export default function MecanicosDashboard() {
    const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
    const [ratingFilter, setRatingFilter] = useState<number>(0);

    // Check if any filter is active
    const isFilterActive = specialtyFilter !== "all" || ratingFilter !== 0;

    // Reset filters to default values
    const handleClearFilters = () => {
        setSpecialtyFilter("all");
        setRatingFilter(0);
    };

    // Filter mechanics based on selected filters
    const filteredMechanics = mechanics.filter((mechanic) => {
        const specialtyMatch =
            specialtyFilter === "all" ||
            mechanic.specialties?.includes(specialtyFilter);
        const ratingMatch =
            ratingFilter === 0 ||
            (mechanic.rating && mechanic.rating >= ratingFilter);
        return specialtyMatch && ratingMatch;
    });

    // Function to handle viewing mechanic details
    const handleViewMechanic = (id: string) => {
        // You can implement navigation or modal opening here
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
            
          </div>
          
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por especialidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {/* Add more SelectItem components for each specialty as needed */}
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
        {filteredMechanics.length > 0 ? (
          filteredMechanics.map((mechanic: Mechanic) => (
            <Card key={mechanic.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-start">
                  <span>{mechanic.company_name}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.round(mechanic.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                      />
                    ))}
                  </div>
                </CardTitle>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500">
                    {mechanic.services_completed || 0} {mechanic.services_completed === 1 ? "serviço realizado" : "serviços realizados"}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-700 truncate">
                    {mechanic.address || "Endereço não disponível"}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-700">
                    {mechanic.phone || "Telefone não disponível"}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {mechanic.specialties?.map((specialty, index) => (
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
                  onClick={() => handleViewMechanic(mechanic.id)}
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