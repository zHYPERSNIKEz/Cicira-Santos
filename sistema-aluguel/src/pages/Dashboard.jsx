import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { TrendingUp, AlertCircle, Clock, Menu } from 'lucide-react'

export default function Dashboard() {
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <div className="bg-gray-50 min-h-screen">
      
      <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />
      
      <main className="p-4 md:p-8 md:ml-64 transition-all">
        
        {/* --- CORREÇÃO APLICADA AQUI --- */}
        {/* Adicionado: sticky, top-0, z-30, bg-gray-50/90 (para transparência bonita) */}
        <div className="md:hidden flex items-center justify-between mb-6 sticky top-0 z-30 bg-gray-50/90 backdrop-blur-sm py-2">
            <button 
                type="button" // Essencial para o Safari não confundir
                onClick={() => setMenuAberto(true)} 
                className="text-gray-700 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
            >
                <Menu size={24} />
            </button>
            <span className="font-bold text-gray-700">Aluguel Sys</span>
            <div className="w-8"></div> {/* Espaço vazio para alinhar */}
        </div>
        {/* ------------------------------- */}

        <header className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
          <p className="text-gray-500">Bem-vindo de volta ao seu painel.</p>
        </header>

        {/* Grid de Cards */}
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