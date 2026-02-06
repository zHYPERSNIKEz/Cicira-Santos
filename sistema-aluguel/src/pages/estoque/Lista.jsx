import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import Sidebar from '../../components/Sidebar'
import { Plus, Search, Filter, Edit, Menu, Trash2 } from 'lucide-react'

export default function ListaEstoque() {
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [termo, setTermo] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos') 
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    buscarProdutos()
  }, [])

  async function buscarProdutos() {
    setLoading(true)
    const { data, error } = await supabase.from('produtos').select('*').order('nome')
    if (error) console.error(error)
    else setProdutos(data)
    setLoading(false)
  }

  const produtosFiltrados = produtos.filter(p => {
    const batemNome = p.nome.toLowerCase().includes(termo.toLowerCase()) || p.codigo?.toString().includes(termo)
    const bateStatus = filtroStatus === 'todos' ? true : p.status === filtroStatus
    return batemNome && bateStatus
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />
      
      <main className="p-4 md:p-8 md:ml-64 transition-all">
        {/* Header Mobile */}
        <div className="md:hidden flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50 py-2">
            <button onClick={() => setMenuAberto(true)} className="p-2 bg-white rounded shadow text-gray-700"><Menu size={24}/></button>
            <span className="font-bold text-gray-700">Estoque</span>
            <div className="w-8"></div>
        </div>

        <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Estoque</h2>
            <p className="text-gray-500">{produtosFiltrados.length} peças cadastradas</p>
          </div>
          <button 
            onClick={() => navigate('/estoque/novo')}
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg"
          >
            <Plus size={20} /> Nova Peça
          </button>
        </header>

        {/* Barra de Pesquisa */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20}/>
                <input 
                    type="text" 
                    placeholder="Buscar por nome, código..." 
                    className="w-full pl-10 p-2.5 border rounded-lg outline-none focus:border-blue-500"
                    value={termo}
                    onChange={e => setTermo(e.target.value)}
                />
            </div>
            <select 
                className="p-2.5 border rounded-lg bg-gray-50 font-medium text-gray-600"
                value={filtroStatus}
                onChange={e => setFiltroStatus(e.target.value)}
            >
                <option value="todos">Todos</option>
                <option value="disponivel">Disponíveis</option>
                <option value="alugado">Alugados</option>
                <option value="manutencao">Manutenção</option>
            </select>
        </div>

        {/* TABELA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th className="p-4">Código</th>
                            <th className="p-4">Peça</th>
                            <th className="p-4">Tam / Cor</th>
                            <th className="p-4">Preço</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading && <tr><td colSpan="6" className="p-8 text-center text-gray-500">Carregando...</td></tr>}
                        
                        {!loading && produtosFiltrados.length === 0 && (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500">Nenhuma peça encontrada.</td></tr>
                        )}

                        {produtosFiltrados.map(produto => (
                            <tr key={produto.id} className="hover:bg-blue-50/50 transition-colors">
                                <td className="p-4 font-mono text-sm text-gray-600">#{produto.codigo || '---'}</td>
                                <td className="p-4 font-bold text-gray-800">{produto.nome}</td>
                                <td className="p-4 text-sm text-gray-600">
                                    <span className="font-bold">{produto.tamanho || 'U'}</span> 
                                    {produto.cor && <span className="mx-1 text-gray-300">|</span>} 
                                    {produto.cor}
                                </td>
                                <td className="p-4 font-bold text-blue-600">R$ {produto.preco_aluguel?.toFixed(2)}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full border ${
                                        produto.status === 'disponivel' ? 'bg-green-100 text-green-700 border-green-200' :
                                        produto.status === 'alugado' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                                        'bg-red-100 text-red-700 border-red-200'
                                    }`}>
                                        {produto.status?.toUpperCase() || 'DISPONÍVEL'}
                                    </span>
                                </td>
                                <td className="p-4 flex justify-end gap-2">
                                    <button 
                                        onClick={() => navigate(`/estoque/editar/${produto.id}`)}
                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                                        title="Editar"
                                    >
                                        <Edit size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  )
}