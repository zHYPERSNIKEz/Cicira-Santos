import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import Sidebar from '../components/Sidebar'
import { Plus, Search, Edit, Trash2, Menu, AlertCircle } from 'lucide-react'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [termo, setTermo] = useState('')
  const [menuAberto, setMenuAberto] = useState(false)

  // Busca inicial
  useEffect(() => {
    buscarClientes()
  }, [])

  async function buscarClientes() {
    setLoading(true)
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome')
    
    if (error) {
      console.error('Erro ao buscar:', error)
    } else {
      setClientes(data || [])
    }
    setLoading(false)
  }

  // --- FUNÇÃO DE EXCLUIR ---
  async function excluirCliente(id, nome) {
    const confirmacao = window.confirm(`Tem certeza que deseja apagar "${nome}"?`)
    if (!confirmacao) return

    try {
        const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('id', id)

        if (error) {
            // Se for erro de permissão (RLS) ou chave estrangeira
            alert("Erro ao excluir: " + error.message)
            console.error(error)
        } else {
            alert("Cliente apagado com sucesso!")
            buscarClientes() // Atualiza a tela
        }

    } catch (error) {
        console.error("Erro crítico:", error)
        alert("Ocorreu um erro inesperado.")
    }
  }

  // Filtro de busca
  const clientesFiltrados = clientes.filter(c => 
    (c.nome && c.nome.toLowerCase().includes(termo.toLowerCase())) || 
    (c.cpf && c.cpf.includes(termo))
  )

  // --- SOLUÇÃO DO ERRO DE WHITESPACE ---
  // Preparamos o conteúdo da tabela AQUI FORA, antes de renderizar.
  // Isso impede que espaços vazios quebrem a tabela.
  let conteudoTabela

  if (loading) {
    conteudoTabela = (
      <tr>
        <td colSpan="5" className="p-8 text-center text-gray-500">
          Carregando...
        </td>
      </tr>
    )
  } else if (clientesFiltrados.length === 0) {
    conteudoTabela = (
      <tr>
        <td colSpan="5" className="p-8 text-center text-gray-500">
           <div className="flex flex-col items-center gap-2">
             <AlertCircle size={30} className="text-gray-300"/>
             <span>Nenhum cliente encontrado.</span>
           </div>
        </td>
      </tr>
    )
  } else {
    conteudoTabela = clientesFiltrados.map(cliente => (
      <tr key={cliente.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
        <td className="p-4 font-medium text-gray-800">{cliente.nome}</td>
        <td className="p-4 text-gray-600 font-mono text-sm">{cliente.cpf || '-'}</td>
        <td className="p-4 text-gray-600 text-sm">{cliente.telefone || '-'}</td>
        <td className="p-4 text-gray-600 text-sm">{cliente.cidade || '-'}</td>
        <td className="p-4 text-right">
          <div className="flex justify-end gap-2">
            <Link 
                to={`/clientes/editar/${cliente.id}`} 
                className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                title="Editar"
            >
                <Edit size={18}/>
            </Link>
            <button 
                onClick={() => excluirCliente(cliente.id, cliente.nome)} 
                className="p-2 text-red-500 hover:bg-red-100 rounded transition-colors"
                title="Excluir"
            >
                <Trash2 size={18}/>
            </button>
          </div>
        </td>
      </tr>
    ))
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-0">
      <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />

      <main className="p-4 md:p-8 md:ml-64 transition-all">
        {/* Header Mobile */}
        <div className="md:hidden flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50 py-2">
            <button onClick={() => setMenuAberto(true)} className="p-2 bg-white rounded shadow text-gray-700"><Menu size={24}/></button>
            <span className="font-bold text-gray-700">Clientes</span><div className="w-8"></div>
        </div>

        <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
            <p className="text-gray-500">{clientesFiltrados.length} cadastrados</p>
          </div>
          
          <Link 
            to="/clientes/novo" 
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg text-center"
          >
            <Plus size={20} /> Novo Cliente
          </Link>
        </header>

        {/* Barra de Busca */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 relative">
            <Search className="absolute left-7 top-7 text-gray-400" size={20}/>
            <input 
                type="text" 
                placeholder="Buscar por nome ou CPF..." 
                className="w-full pl-10 p-3 border rounded-lg outline-none focus:border-blue-500"
                value={termo}
                onChange={e => setTermo(e.target.value)}
            />
        </div>

        {/* Tabela Limpa */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Nome</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">CPF</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Telefone</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Cidade</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {conteudoTabela}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  )
}