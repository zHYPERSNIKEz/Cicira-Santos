import Sidebar from '../components/Sidebar'
import { TrendingUp, AlertCircle, Clock } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
          <p className="text-gray-500">Bem-vindo de volta ao seu painel.</p>
        </header>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Aluguéis Ativos</h3>
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">12</p>
            <span className="text-green-500 text-sm font-medium">+2 hoje</span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Devoluções Hoje</h3>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">4</p>
            <span className="text-gray-400 text-sm">Aguardando cliente</span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Em Atraso</h3>
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">1</p>
            <span className="text-red-500 text-sm font-medium">Cobrar multa</span>
          </div>
        </div>

        {/* Área para próxima funcionalidade */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[300px]">
          <h3 className="font-bold text-gray-800 mb-4">Últimas Movimentações</h3>
          <div className="text-center text-gray-400 py-10">
            <p>Nenhum dado registrado ainda.</p>
          </div>
        </div>
      </main>
    </div>
  )
}