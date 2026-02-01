import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { supabase } from '../supabase'
import { Plus, Search, Trash2, Edit, Tag, Menu } from 'lucide-react'
import ModalNovoProduto from '../components/ModalNovoProduto'

export default function Estoque() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [termoBusca, setTermoBusca] = useState('')
  const [menuAberto, setMenuAberto] = useState(false)

  async function buscarProdutos() {
    setLoading(true)
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('codigo', { ascending: true }) // Ordenar por código fica melhor

    if (error) console.error(error)
    else setProdutos(data)
    
    setLoading(false)
  }

  useEffect(() => {
    buscarProdutos()
  }, [])

  const produtosFiltrados = produtos.filter(p => {
    const busca = termoBusca.toLowerCase()
    const nome = p.nome ? p.nome.toLowerCase() : ''
    const codigo = p.codigo ? p.codigo.toString() : ''
    return nome.includes(busca) || codigo.includes(busca)
  })

  return (
    // 1. IMPORTANTE: Removemos 'flex' daqui para o menu não quebrar o layout
    <div className="bg-gray-50 min-h-screen">
      
      <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />
      
      {/* 2. IMPORTANTE: Adicionamos 'md:ml-64' para empurrar o conteúdo para a direita */}
      <main className="p-4 md:p-8 md:ml-64 transition-all">
        
        {/* Cabeçalho Mobile */}
        <div className="md:hidden flex items-center justify-between mb-6">
            <button onClick={() => setMenuAberto(true)} className="text-gray-700 p-2 bg-white rounded-lg shadow-sm">
                <Menu size={24} />
            </button>
            <span className="font-bold text-gray-700">Aluguel Sys</span>
            <div className="w-8"></div>
        </div>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Estoque</h2>
            <p className="text-gray-500">Gerencie suas roupas e etiquetas</p>
          </div>
          <button 
            onClick={() => setModalAberto(true)}
            className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
          >
            <Plus size={20} />
            Novo Item
          </button>
        </header>

        {/* Barra de Pesquisa */}
        <div className="mb-6 relative">
           <Search className="absolute left-3 top-3 text-gray-400" size={20} />
           <input 
             type="text" 
             placeholder="Busque por nome, cor ou código..." 
             value={termoBusca}
             onChange={e => setTermoBusca(e.target.value)}
             className="w-full pl-10 p-3 rounded-lg border border-gray-200 focus:border-blue-500 outline-none shadow-sm"
           />
        </div>

        {/* Tabela com Scroll Horizontal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
                <div className="p-8 text-center text-gray-500 animate-pulse">Carregando estoque...</div>
            ) : produtosFiltrados.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                <Tag size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nenhuma roupa encontrada.</p>
                </div>
            ) : (
                <table className="w-full text-left min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                    <th className="p-4 font-bold text-gray-700 w-24 text-center">Etiqueta</th>
                    <th className="p-4 font-semibold text-gray-600">Descrição</th>
                    <th className="p-4 font-semibold text-gray-600">Tamanho</th>
                    <th className="p-4 font-semibold text-gray-600">Cor</th>
                    <th className="p-4 font-semibold text-gray-600">Preço</th>
                    <th className="p-4 font-semibold text-gray-600 text-center">Status</th>
                    <th className="p-4 font-semibold text-gray-600 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {produtosFiltrados.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-center">
                        <span className="bg-slate-800 text-white px-2 py-1 rounded font-mono font-bold text-sm">
                            #{item.codigo ? item.codigo.toString().padStart(3, '0') : '---'}
                        </span>
                        </td>
                        <td className="p-4 font-medium text-gray-800">{item.nome || 'Sem descrição'}</td>
                        <td className="p-4 text-gray-600">
                            <span className="bg-gray-100 px-2 py-1 rounded text-sm font-medium">{item.tamanho}</span>
                        </td>
                        <td className="p-4 text-gray-600">
                        <div className="flex items-center gap-2">
                            {item.cor && <div className="w-3 h-3 rounded-full border border-gray-200" style={{backgroundColor: item.cor}}></div>}
                            {item.cor}
                        </div>
                        </td>
                        <td className="p-4 font-medium text-gray-700">R$ {item.preco_aluguel}</td>
                        <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${item.status === 'disponivel' ? 'bg-green-100 text-green-700' : 
                            item.status === 'alugado' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {item.status.toUpperCase()}
                        </span>
                        </td>
                        <td className="p-4 text-right">
                        <button className="text-gray-400 hover:text-blue-600 mx-2"><Edit size={18}/></button>
                        <button className="text-gray-400 hover:text-red-600 mx-2"><Trash2 size={18}/></button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            )}
          </div>
        </div>

        {modalAberto && (
          <ModalNovoProduto 
            onClose={() => setModalAberto(false)} 
            onSave={buscarProdutos} 
          />
        )}

      </main>
    </div>
  )
}