'use client';
// src/app/perfil/page.tsx
import React from 'react';

const PerfilPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Perfil</h1>
            <p className="text-lg">Esta é a página de perfil.</p>
            <div className="mt-4 p-4 bg-white shadow-md rounded-lg w-1/2">
                <h2 className="text-2xl font-semibold mb-2">Informações do Usuário</h2>
                <p className="text-lg">Nome: João Silva</p>
                <p className="text-lg">Email:</p>
                
                </div>
                <p className="text-lg">Telefone: (11) 98765-4321</p>
                <p className="text-lg">Endereço: Rua Exemplo, 123</p>
                <p className="text-lg">Data de Nascimento: 01/01/1990</p>
                <p className="text-lg">Bio: Desenvolvedor Frontend apaixonado por tecnologia.</p>
                <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Editar Perfil</button>
                <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Excluir Conta</button>


        </div>

    );
};

export default PerfilPage;