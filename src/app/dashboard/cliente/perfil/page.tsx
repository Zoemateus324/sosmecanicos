'user client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


//recupera os dados do perfil do cliete

export default function PerfilCliente() {
    const router = useRouter();
    const [cliente, setCliente] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    
    useEffect(() => {
        const fetchData = async () => {
        try {
            const clienteData = await fetchClienteData(); // Replace with your actual data fetching function
            const userData = await getUser();

            async function getUser() {
                // Replace this with the actual logic to fetch user data
                return { /* mock data or API call */ };
            }
    
            if (clienteData) {
            setCliente(clienteData);
            } else {
            console.error('Erro ao recuperar os dados do cliente');
            }
    
            if (userData) {
            setUser(userData);
            } else {
            console.error('Erro ao recuperar os dados do usuário');
            }
        } catch (error) {
            console.error('Erro ao buscar os dados:', error);
        }
        };
    
        fetchData();

        async function fetchClienteData() {
            // Replace this with the actual logic to fetch cliente data
            return { /* mock data or API call */ };
        }
        }, []);
    
        return (
            <div>
                {/* Add your component's JSX here */}
            </div>
        );
    }
