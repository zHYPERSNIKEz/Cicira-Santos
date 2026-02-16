import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Sidebar from '../components/Sidebar'
import HeaderMobile from '../components/HeaderMobile'
import { Users, ShoppingBag, AlertTriangle, Calendar, Activity, Menu } from 'lucide-react'

export default function Dashboard() {
  const [menuAberto, setMenuAberto] = useState(false)
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState({
    totalAlugueisAtivos: 0,
    totalClientes: 0,
    totalEstoque: 0,
    totalManutencao: 0
  })

  useEffect(() => {
    buscarDadosOperacionais()
  }, [])

  async function buscarDadosOperacionais() {
    setLoading(true)
    const { count: clientes } = await supabase.from('clientes').select('*', { count: 'exact', head: true })
    const { count: estoque } = await supabase.from('produtos').select('*', { count: 'exact', head: true })
    const { count: manutencao } = await supabase.from('produtos').select('*', { count: 'exact', head: true }).eq('status', 'manutencao')
    const { count: alugueis } = await supabase.from('alugueis').select('*', { count: 'exact', head: true }).in('status', ['ativo', 'pendente'])

    setKpis({
      totalClientes: clientes || 0,
      totalEstoque: estoque || 0,
      totalManutencao: manutencao || 0,
      totalAlugueisAtivos: alugueis || 0
    })
    setLoading(false)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />
      
      <main className="p-4 md:p-8 md:ml-64 transition-all">
        
        {/* --- CABEÇALHO MOBILE (CORRIGIDO: LIMPO IGUAL AOS OUTROS) --- */}
        <HeaderMobile titulo="Visão Geral" aoAbrir={() => setMenuAberto(true)} />
        {/* ----------------------------------------------------------- */}

        {/* Header Desktop */}
        <div className="mb-8 hidden md:block">
            <h2 className="text-2xl font-bold text-gray-800">Painel de Controle 🚀</h2>
            <p className="text-gray-500">Visão geral operacional da loja.</p>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* CARD 1: ALUGUÉIS ATIVOS */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-200 transition-colors">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase">Aluguéis Ativos</p>
                        <h3 className="text-3xl font-bold text-blue-600 mt-1">{kpis.totalAlugueisAtivos}</h3>
                        <p className="text-xs text-gray-400 mt-1">Roupas fora da loja</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={28} /></div>
                </div>

                {/* CARD 2: ESTOQUE TOTAL */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-indigo-200 transition-colors">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase">Total de Peças</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-1">{kpis.totalEstoque}</h3>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><ShoppingBag size={28} /></div>
                </div>

                {/* CARD 3: CLIENTES */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-purple-200 transition-colors">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase">Clientes</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-1">{kpis.totalClientes}</h3>
                    </div>
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Users size={28} /></div>
                </div>

                {/* CARD 4: MANUTENÇÃO */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-red-200 transition-colors">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase">Em Manutenção</p>
                        <h3 className="text-3xl font-bold text-red-600 mt-1">{kpis.totalManutencao}</h3>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={28} /></div>
                </div>
            </div>
        )}
        
        {/* Aviso de Privacidade */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-lg flex gap-3 items-start">
            <Activity className="text-yellow-600 shrink-0 mt-1" />
            <div>
                <h4 className="font-bold text-yellow-700">Onde estão os valores?</h4>
                <p className="text-sm text-yellow-800">
                    Para ver o faturamento, caixa e relatórios financeiros completos, acesse o novo menu <strong>Financeiro</strong> na barra lateral.
                </p>
            </div>
        </div>

      </main>
    </div>
  )
}