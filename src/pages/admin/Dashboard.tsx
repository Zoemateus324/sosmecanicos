import React from 'react';

function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Painel do Administrador</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Usuários</h2>
          <p className="text-gray-600">Gerenciar usuários do sistema</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Configurações</h2>
          <p className="text-gray-600">Configurações do sistema</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 