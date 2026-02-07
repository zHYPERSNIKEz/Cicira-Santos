import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import Sidebar from '../../components/Sidebar'
import { ArrowLeft, DollarSign, CheckCircle } from 'lucide-react'

export default function EntregaAluguel() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  
  // ESTADO DO ALUGUEL
  const [aluguel, setAluguel] = useState(null)
  
  // ESTADO DO PAGAMENTO (Aqui forçamos o padrão 'Pix' para o sistema reconhecer)
  const [formaPagamentoRestante, setFormaPagamentoRestante] = useState('Pix')

  useEffect(() => {
    async function carregarAluguel() {
      const { data, error } = await supabase
        .from('alugueis')
        .select(`*, cliente:clientes(nome)`) // Busca nome do cliente
        .eq('id', id)
        .single()
        
      if (error) {
        alert('Erro ao carregar')
        navigate('/alugueis')
      } else {
        setAluguel(data)
      }
      setLoading(false)
    }
    carregarAluguel()
  }, [id])

  async function confirmarEntrega() {
    const confirmacao = window.confirm("Confirmar a entrega da peça e o recebimento do valor restante?")
    if (!confirmacao) return

    setLoading(true)

    // Atualiza status E a forma de pagamento do restante
    const { error } = await supabase
      .from('alugueis')
      .update({ 
        status: 'ativo', // Muda para Ativo (está com o cliente)
        data_entrega_real: new Date().toISOString(),
        forma_pagamento_restante: formaPagamentoRestante // <--- SALVA O MÉTODO CORRETO
      })
      .eq('id', id)

    if (error) {
      alert('Erro: ' + error.message)
    } else {
      alert('Entrega realizada com sucesso!')
      navigate('/alugueis')
    }
    setLoading(false)
  }

  if (loading || !aluguel) return <div className="p-8">Carregando...</div>

  const valorFalta = (aluguel.valor_total || 0) - (aluguel.valor_entrada || 0)

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-0">
      <Sidebar />
      <main className="p-4 md:p-8 md:ml-64">
        <div className="max-w-xl mx-auto">
            <button onClick={() => navigate('/alugueis')} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-blue-600">
                <ArrowLeft size={20}/> Voltar
            </button>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <CheckCircle className="text-blue-600"/> Realizar Entrega
                </h2>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-xs font-bold text-blue-600 uppercase">Cliente</p>
                    <p className="text-lg font-bold text-blue-900">{aluguel.cliente?.nome}</p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Valor Total do Aluguel</span>
                        <span className="font-bold text-gray-800">R$ {aluguel.valor_total}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2 text-green-600">
                        <span>Pago na Reserva (Entrada)</span>
                        <span>- R$ {aluguel.valor_entrada}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-xl font-bold text-blue-600">
                        <span>A Receber Agora:</span>
                        <span>R$ {valorFalta}</span>
                    </div>
                </div>

                {/* --- CORREÇÃO DO DROPDOWN --- */}
                <div className="mb-8">
                    <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Como o cliente pagou o restante?</label>
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <input 
                                value={`R$ ${valorFalta}`} 
                                disabled 
                                className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500 font-bold"
                            />
                        </div>
                        <div className="w-1/2">
                            <select 
                                className="w-full p-3 border rounded-lg bg-white font-medium text-gray-800 focus:border-blue-500 outline-none"
                                value={formaPagamentoRestante} 
                                onChange={e => setFormaPagamentoRestante(e.target.value)}
                            >
                                <option value="Pix">💠 Pix</option>
                                <option value="Dinheiro">💵 Dinheiro</option>
                                <option value="Cartão Crédito">💳 Cartão Crédito</option>
                                <option value="Cartão Débito">💳 Cartão Débito</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={confirmarEntrega}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-all flex justify-center items-center gap-2"
                >
                    <DollarSign size={20}/> Confirmar Recebimento e Entregar
                </button>

            </div>
        </div>
      </main>
    </div>
  )
}