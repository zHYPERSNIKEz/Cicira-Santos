import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { supabase } from '../supabase'
import { Plus, Search, Trash2, Edit, User, Menu, Phone } from 'lucide-react'
import ModalNovoCliente from '../components/ModalNovoCliente'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [termoBusca, setTermoBusca] = useState('')
  const [menuAberto, setMenuAberto] = useState(false)

  async function buscarClientes() {
    setLoading(true)
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome', { ascending: true })

    if (error) console.error(error)
    else setClientes(data)
    
    setLoading(false)
  }

  useEffect(() => {
    buscarClientes()
  }, [])

  const clientesFiltrados = clientes.filter(c => {
    const busca = termoBusca.toLowerCase()
    return c.nome.toLowerCase().includes(busca) || 
           (c.cpf && c.cpf.includes(busca)) ||
           (c.telefone && c.telefone.includes(busca))
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />
      
      <main className="p-4 md:p-8 md:ml-64 transition-all">
        
        {/* Cabeçalho Mobile */}
        <div className="md:hidden flex items-center justify-between mb-6 sticky top-0 z-30 bg-gray-50/90 backdrop-blur-sm py-2">
            <button 
                type="button"
                onClick={() => setMenuAberto(true)} 
                className="text-gray-700 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
            >
                <Menu size={24} />
            </button>
            <span className="font-bold text-gray-700">Aluguel Sys</span>
            <div className="w-8"></div>
        </div>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
            <p className="text-gray-500">Gerencie sua base de contatos</p>
          </div>
          <button 
            onClick={() => setModalAberto(true)}
            className="w-full md:w-auto bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20"
          >
            <Plus size={20} />
            Novo Cliente
          </button>
        </header>

        {/* Barra de Pesquisa */}
        <div className="mb-6 relative">
           <Search className="absolute left-3 top-3 text-gray-400" size={20} />
           <input 
             type="text" 
             placeholder="Busque por nome, CPF ou telefone..." 
             value={termoBusca}
             onChange={e => setTermoBusca(e.target.value)}
             className="w-full pl-10 p-3 rounded-lg border border-gray-200 focus:border-green-500 outline-none shadow-sm"
           />
        </div>

        {/* Tabela de Clientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
                <div className="p-8 text-center text-gray-500 animate-pulse">Carregando contatos...</div>
            ) : clientesFiltrados.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                <User size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nenhum cliente encontrado.</p>
                </div>
            ) : (
                <table className="w-full text-left min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                    <th className="p-4 font-semibold text-gray-600">Nome</th>
                    <th className="p-4 font-semibold text-gray-600">Telefone</th>
                    <th className="p-4 font-semibold text-gray-600">CPF</th>
                    <th className="p-4 font-semibold text-gray-600 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {clientesFiltrados.map((cliente) => (
                    <tr key={cliente.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                                {cliente.nome.substring(0,2).toUpperCase()}
                            </div>
                            {cliente.nome}
                        </td>
                        <td className="p-4 text-gray-600">
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-gray-400"/>
                                {cliente.telefone}
                            </div>
                        </td>
                        <td className="p-4 text-gray-500 font-mono text-sm">
                            {cliente.cpf || '---'}
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
          <ModalNovoCliente
            onClose={() => setModalAberto(false)} 
            onSave={buscarClientes} 
          />
        )}

      </main>
    </div>
  )
}