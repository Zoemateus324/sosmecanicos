import React from 'react';

function InsuranceDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Painel da Seguradora</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cotações Pendentes</h2>
          <p className="text-gray-600">Nenhuma cotação pendente</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Parcerias</h2>
          <p className="text-gray-600">Nenhuma parceria cadastrada</p>
        </div>
      </div>
    </div>
  );
}

export default InsuranceDashboard;