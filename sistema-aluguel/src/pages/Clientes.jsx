import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom' // Importar useNavigate
import Sidebar from '../components/Sidebar'
import { supabase } from '../supabase'
import { Plus, Search, Trash2, Edit, User, Menu, Phone } from 'lucide-react'
import ModalConfirmacao from '../components/ModalConfirmacao' // Importar ModalConfirmacao


export default function Clientes() {
  const navigate = useNavigate() // Inicializar useNavigate
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)

  const [termoBusca, setTermoBusca] = useState('')
  const [menuAberto, setMenuAberto] = useState(false)

  // Estados para o Modal de Confirmação
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clienteToDeleteId, setClienteToDeleteId] = useState(null)

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

  // Função para abrir o modal de confirmação
  const handleOpenModalConfirmacao = (id) => {
    setClienteToDeleteId(id)
    setIsModalOpen(true)
  }

  // Função para fechar o modal de confirmação e resetar o ID
  const handleCloseModalConfirmacao = () => {
    setIsModalOpen(false)
    setClienteToDeleteId(null)
  }

  // Função que executa a exclusão após a confirmação no modal
  async function executarExclusao() {
    if (!clienteToDeleteId) return // Garante que há um ID para excluir

    try {
      // 1. Verificar se o cliente possui aluguéis ativos
      const { data: alugueisAtivos, error: aluguelError } = await supabase
        .from('alugueis')
        .select('id')
        .eq('cliente_id', clienteToDeleteId)
        .limit(1) // Busca apenas um para verificar a existência

      if (aluguelError) {
        throw new Error('Erro ao verificar aluguéis: ' + aluguelError.message)
      }

      if (alugueisAtivos && alugueisAtivos.length > 0) {
        alert('Não é possível excluir este cliente, pois ele possui aluguéis ativos.')
        handleCloseModalConfirmacao()
        return
      }

      // 2. Se não há aluguéis ativos, prosseguir com a exclusão do cliente
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteToDeleteId)

      if (error) throw error
      
      // Atualiza o estado para remover o cliente da lista e forçar o re-render
      setClientes(prevClientes => prevClientes.filter(cliente => cliente.id !== clienteToDeleteId))
      alert('Cliente excluído com sucesso!') 
      handleCloseModalConfirmacao() // Fechar o modal após a exclusão bem-sucedida

    } catch (error) {
      console.error('Erro ao excluir cliente:', error.message)
      alert('Erro ao excluir cliente: ' + error.message)
      handleCloseModalConfirmacao() // Fechar o modal mesmo em caso de erro
    }
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
                      onClick={() => navigate('/clientes/novo')}
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
                            {loading ? (
                                <tr className="text-center">
                                    <td colSpan="4" className="p-8 text-gray-500 animate-pulse">Carregando contatos...</td>
                                </tr>
                            ) : clientesFiltrados.length === 0 ? (
                                <tr className="text-center">
                                    <td colSpan="4" className="p-12 text-gray-400">
                                        <User size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>Nenhum cliente encontrado.</p>
                                    </td>
                                </tr>
                            ) : (
                                clientesFiltrados.map((cliente) => (
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
                                            <button
                                                onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                                                className="text-gray-400 hover:text-blue-600 mx-2"
                                            >
                                                <Edit size={18}/>
                                            </button>
                                            <button
                                                onClick={() => handleOpenModalConfirmacao(cliente.id)} // Chamando a função para abrir o modal
                                                className="text-gray-400 hover:text-red-600 mx-2"
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                          </tbody>
                      </table>
                    </div>
                  </div>



                </main>

                {/* Modal de Confirmação de Exclusão */}
                <ModalConfirmacao
                  isOpen={isModalOpen}
                  onClose={handleCloseModalConfirmacao}
                  onConfirm={executarExclusao}
                  titulo="Confirmar Exclusão"
                  mensagem="Você realmente deseja excluir este cliente? Esta ação não pode ser desfeita."
                />
            </div>
          )
}