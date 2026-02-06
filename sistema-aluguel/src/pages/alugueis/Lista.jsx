import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import Sidebar from '../../components/Sidebar'
import ModalConfirmacao from '../../components/ModalConfirmacao' // <--- Importamos aqui
import { Plus, Search, Trash2, Calendar, Edit, Menu, PackageCheck, CornerDownLeft } from 'lucide-react'

export default function Lista() {
  const navigate = useNavigate()
  const [alugueis, setAlugueis] = useState([])
  const [loading, setLoading] = useState(true)
  const [termoBusca, setTermoBusca] = useState('')
  const [menuAberto, setMenuAberto] = useState(false)
  
  // Estado para controlar o Modal de Exclusão
  const [idParaExcluir, setIdParaExcluir] = useState(null)

  async function buscarAlugueis() {
    setLoading(true)
    const { data, error } = await supabase.from('alugueis').select(`*, clientes (*)`).order('created_at', { ascending: false })
    if (error) console.error(error)
    else setAlugueis(data)
    setLoading(false)
  }

  useEffect(() => { buscarAlugueis() }, [])

  // Função que realmente vai no banco apagar (chamada pelo Modal)
  async function confirmarExclusao() {
    if (!idParaExcluir) return
    const { error } = await supabase.from('alugueis').delete().eq('id', idParaExcluir)
    if (error) alert('Erro: ' + error.message)
    else buscarAlugueis()
    setIdParaExcluir(null) // Limpa o estado
  }

  const formatarDinheiro = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  const formatarData = (d) => new Date(d).toLocaleDateString('pt-BR')
  const alugueisFiltrados = alugueis.filter(item => item.clientes?.nome?.toLowerCase().includes(termoBusca.toLowerCase()))

  const renderStatus = (status) => {
    switch(status) {
        case 'pendente': return <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-yellow-100 text-yellow-700 border border-yellow-200">Reservado</span>
        case 'ativo': return <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-blue-100 text-blue-700 border border-blue-200">Com o Cliente</span>
        case 'finalizado': return <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-green-100 text-green-700 border border-green-200">Devolvido</span>
        default: return null
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />
      
      {/* O MODAL FICA AQUI, INVISÍVEL ATÉ SER CHAMADO */}
      <ModalConfirmacao 
        isOpen={!!idParaExcluir} 
        onClose={() => setIdParaExcluir(null)}
        onConfirm={confirmarExclusao}
        titulo="Excluir Aluguel"
        mensagem="Tem certeza que deseja apagar este registro? O histórico financeiro será perdido."
      />

      <main className="p-4 md:p-8 md:ml-64 transition-all">
        <div className="md:hidden flex justify-between mb-6 sticky top-0 z-30 bg-gray-50/90 backdrop-blur-sm py-2 rounded-b-lg px-2">
            <button onClick={() => setMenuAberto(true)}><Menu size={24} className="text-gray-700"/></button>
            <span className="font-bold text-gray-700">Aluguel Sys</span><div className="w-8"></div>
        </div>

        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div><h2 className="text-2xl font-bold text-gray-800">Aluguéis</h2><p className="text-gray-500">Gestão de Reservas</p></div>
          <button onClick={() => navigate('/alugueis/novo')} className="w-full md:w-auto bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg font-bold transition-transform active:scale-95"><Plus size={20} /> Novo Aluguel</button>
        </header>

        <div className="mb-6 relative"><Search className="absolute left-3 top-3.5 text-gray-400" size={20} /><input type="text" placeholder="Buscar cliente..." value={termoBusca} onChange={e => setTermoBusca(e.target.value)} className="w-full pl-10 p-3 rounded-lg border border-gray-200 outline-none shadow-sm focus:border-blue-500 transition-colors"/></div>

        {loading ? <div className="text-center p-8 text-gray-500 animate-pulse">Carregando lista...</div> : (
            <div className="space-y-4">
                {alugueisFiltrados.map((item) => (
                    <div key={item.id} className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4 hover:border-blue-300 transition-colors">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">{renderStatus(item.status)} <span className="text-xs text-gray-400 font-mono">#{item.id.slice(0,6)}</span></div>
                            <h3 className="font-bold text-gray-800 text-lg">{item.clientes?.nome}</h3>
                            <div className="text-sm text-gray-500 mt-1 flex gap-4 items-center">
                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Calendar size={14}/> {formatarData(item.data_retirada)} <span className="text-gray-300">➜</span> {formatarData(item.data_devolucao)}</span>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-3 justify-center">
                            <div>
                                <div className="text-xl font-bold text-gray-800">{formatarDinheiro(item.valor_total)}</div>
                                {item.status === 'pendente' && (item.valor_total - item.valor_entrada > 0) && <div className="text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full inline-block">Falta: {formatarDinheiro(item.valor_total - item.valor_entrada)}</div>}
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button onClick={() => navigate(`/alugueis/editar/${item.id}`)} className="flex-1 md:flex-none p-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-colors flex justify-center"><Edit size={18}/></button>
                                
                                {/* BOTÃO DE EXCLUIR AGORA ABRE O MODAL */}
                                <button onClick={() => setIdParaExcluir(item.id)} className="flex-1 md:flex-none p-2 bg-white text-red-500 rounded-lg hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors flex justify-center"><Trash2 size={18}/></button>
                                
                                {item.status === 'pendente' && (
                                    <button onClick={() => navigate(`/alugueis/entregar/${item.id}`)} className="flex-1 md:flex-none px-3 py-2 bg-blue-600 text-white rounded-lg font-bold flex gap-2 items-center justify-center hover:bg-blue-700 shadow-sm text-sm"><PackageCheck size={18}/> Entregar</button>
                                )}
                                {item.status === 'ativo' && (
                                    <button onClick={() => navigate(`/alugueis/devolver/${item.id}`)} className="flex-1 md:flex-none px-3 py-2 bg-green-600 text-white rounded-lg font-bold flex gap-2 items-center justify-center hover:bg-green-700 shadow-sm text-sm"><CornerDownLeft size={18}/> Devolver</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>
    </div>
  )
}