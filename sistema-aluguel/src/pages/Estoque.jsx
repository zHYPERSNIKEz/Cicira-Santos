import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { supabase } from '../supabase'
import { Plus, Search, Trash2, Edit, Tag } from 'lucide-react'
import ModalNovoProduto from '../components/ModalNovoProduto'

export default function Estoque() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [termoBusca, setTermoBusca] = useState('')

  async function buscarProdutos() {
    setLoading(true)
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false }) // Mostra os mais novos primeiro

    if (error) console.error(error)
    else setProdutos(data)
    
    setLoading(false)
  }

  useEffect(() => {
    buscarProdutos()
  }, [])

  // Filtro de busca (Funciona para Nome ou Código)
  const produtosFiltrados = produtos.filter(p => {
    const busca = termoBusca.toLowerCase()
    const nome = p.nome ? p.nome.toLowerCase() : ''
    const codigo = p.codigo ? p.codigo.toString() : ''
    
    return nome.includes(busca) || codigo.includes(busca)
  })

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Estoque</h2>
            <p className="text-gray-500">Gerencie suas roupas e etiquetas</p>
          </div>
          <button 
            onClick={() => setModalAberto(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
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
             placeholder="Busque por nome, cor ou código da etiqueta..." 
             value={termoBusca}
             onChange={e => setTermoBusca(e.target.value)}
             className="w-full pl-10 p-3 rounded-lg border border-gray-200 focus:border-blue-500 outline-none shadow-sm"
           />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 animate-pulse">Carregando estoque...</div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Tag size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nenhuma roupa encontrada.</p>
              <p className="text-sm mt-1">Clique em "Novo Item" para cadastrar.</p>
            </div>
          ) : (
            <table className="w-full text-left">
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
                      {item.codigo ? (
                        <span className="bg-slate-800 text-white px-2 py-1 rounded font-mono font-bold text-sm">
                          #{item.codigo}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs italic">S/N</span>
                      )}
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
                      <button className="text-gray-400 hover:text-blue-600 mx-2 transition-colors"><Edit size={18}/></button>
                      <button className="text-gray-400 hover:text-red-600 mx-2 transition-colors"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Aqui é onde a mágica acontece: O Modal só aparece se modalAberto for true */}
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