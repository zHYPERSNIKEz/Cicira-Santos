import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../supabase'
import { X, CheckCircle, AlertTriangle, CornerDownLeft } from 'lucide-react'
import Sidebar from '../../components/Sidebar'

export default function Devolucao() {
  const [loading, setLoading] = useState(true)
  const [aluguel, setAluguel] = useState(null)
  const [pagamentoMulta, setPagamentoMulta] = useState('Pix')
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    async function carregarAluguel() {
      const { data, error } = await supabase.from('alugueis').select('*, clientes(*)').eq('id', id).single()
      if (error || !data) {
        console.error("Aluguel não encontrado", error)
        navigate('/alugueis')
      } else {
        setAluguel(data)
      }
      setLoading(false)
    }
    carregarAluguel()
  }, [id, navigate])

  // --- CÁLCULO DE MULTA ---
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const dataDevolucaoPrevista = aluguel ? new Date(aluguel.data_devolucao + 'T12:00:00') : null
  if (dataDevolucaoPrevista) dataDevolucaoPrevista.setHours(0, 0, 0, 0)

  const diffTime = dataDevolucaoPrevista ? hoje - dataDevolucaoPrevista : 0
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const diasAtraso = diffDays > 0 ? diffDays : 0
  const valorMulta = diasAtraso * 10 // R$ 10 por dia

  const handleConfirmarDevolucao = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('alugueis')
      .update({
        status: 'finalizado', 
        data_finalizacao: new Date(),
        valor_multa: valorMulta,
        metodo_pagamento_multa: valorMulta > 0 ? pagamentoMulta : null
      })
      .eq('id', aluguel.id)

    setLoading(false)
    if (error) alert('Erro: ' + error.message)
    else navigate('/alugueis')
  }

  if (loading || !aluguel) {
    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="p-8 text-center text-gray-500 animate-pulse">Carregando...</div>
        </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
       <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />
       <main className="p-4 md:p-8 md:ml-64 transition-all">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
            <div className={`px-6 py-4 flex justify-between items-center text-white ${diasAtraso > 0 ? 'bg-orange-600' : 'bg-green-600'}`}>
                <h3 className="font-bold text-lg flex items-center gap-2"><CornerDownLeft size={24}/> Confirmar Devolução</h3>
                <Link to="/alugueis" className="hover:text-white/80"><X size={24}/></Link>
            </div>

            <div className="p-6 space-y-6">
                <div className="text-center">
                    <p className="text-gray-500 mb-1">Cliente</p>
                    <h2 className="text-xl font-bold text-gray-800">{aluguel.clientes?.nome}</h2>
                </div>

                {diasAtraso > 0 ? (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700 font-bold text-lg mb-2"><AlertTriangle/> ATENÇÃO: Atraso Detectado!</div>
                        <div className="text-gray-700 text-sm mb-4">
                            A devolução estava prevista para <b>{new Date(aluguel.data_devolucao).toLocaleDateString('pt-BR')}</b>.<br/>
                            São <b>{diasAtraso} dias</b> de atraso.
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded border border-red-100 mb-3">
                            <span className="font-bold text-red-600">Multa a Cobrar:</span>
                            <span className="font-black text-2xl text-red-600">R$ {valorMulta.toFixed(2)}</span>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Receber Multa via:</label>
                            <select className="w-full p-2 border rounded mt-1" value={pagamentoMulta} onChange={e=>setPagamentoMulta(e.target.value)}>
                                <option>Pix</option><option>Dinheiro</option><option>Cartão</option>
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
                        <CheckCircle size={48} className="text-green-500 mx-auto mb-3"/>
                        <h3 className="text-green-800 font-bold text-lg">Tudo certo!</h3>
                        <p className="text-green-700">Devolução dentro do prazo.</p>
                        <p className="text-sm text-gray-500 mt-2">Nenhuma pendência financeira.</p>
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                <Link to="/alugueis" className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded font-medium">Cancelar</Link>
                <button 
                    onClick={handleConfirmarDevolucao}
                    className={`px-6 py-2 text-white rounded font-bold shadow-lg flex items-center gap-2 ${diasAtraso > 0 ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {loading ? '...' : diasAtraso > 0 ? 'Receber Multa e Finalizar' : 'Finalizar Devolução'}
                </button>
            </div>
        </div>
       </main>
    </div>
  )
}
