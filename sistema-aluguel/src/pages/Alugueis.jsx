import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { supabase } from '../supabase'
import { Plus, Search, Trash2, Calendar, CheckCircle, Edit, Menu, FileText } from 'lucide-react'
import ModalNovoAluguel from '../components/ModalNovoAluguel'
import ModalBaixaAluguel from '../components/ModalBaixaAluguel' // Importe o novo modal

export default function Alugueis() {
  const [alugueis, setAlugueis] = useState([])
  const [loading, setLoading] = useState(true)
  const [termoBusca, setTermoBusca] = useState('')
  const [menuAberto, setMenuAberto] = useState(false)

  // Estados dos Modais
  const [modalNovoAberto, setModalNovoAberto] = useState(false)
  const [aluguelParaEditar, setAluguelParaEditar] = useState(null) // Guardar quem vamos editar
  const [aluguelParaBaixar, setAluguelParaBaixar] = useState(null) // Guardar quem vamos baixar

  async function buscarAlugueis() {
    setLoading(true)
    const { data, error } = await supabase
      .from('alugueis')
      .select(`*, clientes (nome, telefone)`)
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    else setAlugueis(data)
    setLoading(false)
  }

  useEffect(() => { buscarAlugueis() }, [])

  // FUNÇÃO DE EXCLUIR
  async function excluirAluguel(id) {
    if (!confirm('ATENÇÃO: Isso excluirá o aluguel permanentemente.\nDeseja continuar?')) return
    const { error } = await supabase.from('alugueis').delete().eq('id', id)
    if (error) alert('Erro ao excluir: ' + error.message)
    else buscarAlugueis()
  }

  // FUNÇÃO DE ABRIR EDIÇÃO
  function abrirEdicao(aluguel) {
    setAluguelParaEditar(aluguel)
    setModalNovoAberto(true)
  }

  const formatarData = (data) => new Date(data).toLocaleDateString('pt-BR')
  const formatarDinheiro = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)

  const alugueisFiltrados = alugueis.filter(item => {
    const busca = termoBusca.toLowerCase()
    const nomeCliente = item.clientes?.nome?.toLowerCase() || ''
    return nomeCliente.includes(busca)
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />
      
      <main className="p-4 md:p-8 md:ml-64 transition-all">
        {/* Header Mobile */}
        <div className="md:hidden flex items-center justify-between mb-6 sticky top-0 z-30 bg-gray-50/90 backdrop-blur-sm py-2">
            <button type="button" onClick={() => setMenuAberto(true)} className="text-gray-700 p-2 bg-white rounded-lg shadow-sm"><Menu size={24} /></button>
            <span className="font-bold text-gray-700">Aluguel Sys</span><div className="w-8"></div>
        </div>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div><h2 className="text-2xl font-bold text-gray-800">Aluguéis</h2><p className="text-gray-500">Controle de saídas e devoluções</p></div>
          <button onClick={() => { setAluguelParaEditar(null); setModalNovoAberto(true); }} className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg">
            <Plus size={20} /> Novo Aluguel
          </button>
        </header>

        <div className="mb-6 relative">
           <Search className="absolute left-3 top-3 text-gray-400" size={20} />
           <input type="text" placeholder="Busque pelo nome do cliente..." value={termoBusca} onChange={e => setTermoBusca(e.target.value)} className="w-full pl-10 p-3 rounded-lg border border-gray-200 focus:border-blue-500 outline-none shadow-sm"/>
        </div>

        {loading ? <div className="p-8 text-center text-gray-500 animate-pulse">Carregando...</div> : alugueisFiltrados.length === 0 ? <div className="bg-white p-12 text-center text-gray-400 rounded-xl border border-gray-100"><Calendar size={48} className="mx-auto mb-4 opacity-20" /><p>Nenhum aluguel encontrado.</p></div> : (
            <div className="space-y-4">
                {alugueisFiltrados.map((item) => (
                    <div key={item.id} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-blue-200 transition-colors relative group">
                        
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${item.status === 'ativo' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{item.status === 'ativo' ? 'Em Aberto' : 'Entregue'}</span>
                                <span className="text-gray-500 text-xs font-medium">#{item.id.slice(0,8)}</span>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">{item.clientes?.nome || 'Cliente Desconhecido'}</h3>
                            <div className="text-gray-500 text-sm flex flex-col mt-1">
                                <span className="flex items-center gap-2"><Calendar size={14}/> {formatarData(item.data_retirada)} até {formatarData(item.data_devolucao)}</span>
                                {item.anotacoes && <span className="flex items-center gap-2 text-orange-600 mt-1"><FileText size={14}/> {item.anotacoes}</span>}
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                            <div className="text-right">
                                <div className="text-xs text-gray-400 font-medium uppercase">Valor Total</div>
                                <div className="font-bold text-gray-800 text-xl">{formatarDinheiro(item.valor_total)}</div>
                                {item.status === 'ativo' && <div className="text-xs text-red-500 font-bold">Falta: {formatarDinheiro(item.valor_total - item.valor_entrada)}</div>}
                            </div>
                            
                            <div className="flex gap-2 mt-2">
                                {/* BOTÃO EDITAR */}
                                <button onClick={() => abrirEdicao(item)} className="p-2 bg-gray-50 text-blue-600 rounded-lg hover:bg-blue-50 border border-gray-200" title="Editar / Ver Detalhes">
                                    <Edit size={18}/>
                                </button>
                                
                                {/* BOTÃO EXCLUIR */}
                                <button onClick={() => excluirAluguel(item.id)} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 border border-gray-200" title="Excluir">
                                    <Trash2 size={18}/>
                                </button>

                                {/* BOTÃO BAIXAR / ENTREGUE */}
                                {item.status === 'ativo' && (
                                    <button 
                                        onClick={() => setAluguelParaBaixar(item)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center gap-2 shadow-sm"
                                    >
                                        <CheckCircle size={18}/> Entregue
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Modal de Novo/Edição */}
        {modalNovoAberto && (
          <ModalNovoAluguel
            aluguelParaEditar={aluguelParaEditar}
            onClose={() => { setModalNovoAberto(false); setAluguelParaEditar(null); }} 
            onSave={buscarAlugueis} 
          />
        )}

        {/* Modal de Baixa (Pagamento Final) */}
        {aluguelParaBaixar && (
            <ModalBaixaAluguel
                aluguel={aluguelParaBaixar}
                onClose={() => setAluguelParaBaixar(null)}
                onSave={buscarAlugueis}
            />
        )}

      </main>
    </div>
  )
}