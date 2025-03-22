import React from 'react';

function TowTruckDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Painel do Guincho</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Chamados Próximos</h2>
          <p className="text-gray-600">Nenhum chamado encontrado</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Atendimentos</h2>
          <p className="text-gray-600">Nenhum atendimento registrado</p>
        </div>
      </div>
    </div>
  );
}

export default TowTruckDashboard;