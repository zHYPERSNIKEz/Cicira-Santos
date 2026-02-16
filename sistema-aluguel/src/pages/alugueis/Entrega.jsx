import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import Sidebar from '../../components/Sidebar'
import ModalConfirmacao from '../../components/ModalConfirmacao'
import { ArrowLeft, DollarSign, CheckCircle, Calculator, AlertCircle } from 'lucide-react'

export default function EntregaAluguel() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  
  // --- ESTADO DO MODAL (IMPORTANTE) ---
  const [modalAberto, setModalAberto] = useState(false)
  
  const [aluguel, setAluguel] = useState(null)
  const [totalFalta, setTotalFalta] = useState(0)
  
  // Pagamento 1
  const [valor1, setValor1] = useState('')
  const [metodo1, setMetodo1] = useState('Pix')
  
  // Pagamento 2 (Divisão)
  const [valor2, setValor2] = useState(0)
  const [metodo2, setMetodo2] = useState('Dinheiro')

  useEffect(() => {
    async function carregarAluguel() {
      const { data, error } = await supabase
        .from('alugueis')
        .select(`*, cliente:clientes(nome)`)
        .eq('id', id)
        .single()
        
      if (error) {
        navigate('/alugueis')
      } else {
        setAluguel(data)
        const falta = (data.valor_total || 0) - (data.valor_entrada || 0)
        setTotalFalta(falta)
        setValor1(falta) 
      }
      setLoading(false)
    }
    carregarAluguel()
  }, [id, navigate])

  // Calcula automático o valor 2 quando muda o valor 1
  useEffect(() => {
    const v1 = parseFloat(valor1) || 0
    const diferenca = totalFalta - v1
    if (diferenca > 0.01) setValor2(diferenca)
    else setValor2(0)
  }, [valor1, totalFalta])

  async function confirmarEntrega() {
    setLoading(true)
    
    // Fecha o modal antes de começar o processo
    setModalAberto(false)

    const payload = { 
        status: 'ativo', 
        data_entrega_real: new Date().toISOString(),
        forma_pagamento_restante: metodo1,
        valor_pagamento_restante_2: valor2 > 0 ? valor2 : 0,
        forma_pagamento_restante_2: valor2 > 0 ? metodo2 : null
    }

    const { error } = await supabase.from('alugueis').update(payload).eq('id', id)

    if (error) {
      alert('Erro: ' + error.message)
    } else {
      navigate('/alugueis')
    }
    setLoading(false)
  }

  if (loading || !aluguel) return <div className="p-8 text-center">Carregando...</div>

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-0">
      <Sidebar />
      
      {/* --- O MODAL É CHAMADO AQUI --- */}
      <ModalConfirmacao 
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onConfirm={confirmarEntrega}
        titulo="Confirmar Recebimento"
        mensagem={`O status mudará para "Com o Cliente" e o valor de R$ ${totalFalta.toFixed(2)} entrará no caixa.`}
        textoBotao="Confirmar Recebimento"
        corBotao="bg-blue-600 hover:bg-blue-700"
        tipo="sucesso"
      />

      <main className="p-4 md:p-8 md:ml-64">
        <div className="max-w-xl mx-auto">
            <button onClick={() => navigate('/alugueis')} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-blue-600">
                <ArrowLeft size={20}/> Voltar
            </button>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <CheckCircle className="text-blue-600"/> Realizar Entrega
                </h2>

                <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
                    <p className="text-xs font-bold text-blue-600 uppercase">Cliente</p>
                    <p className="text-lg font-bold text-blue-900">{aluguel.cliente?.nome}</p>
                </div>

                <div className="space-y-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Valor Total</span>
                        <span className="font-bold text-gray-800">R$ {aluguel.valor_total}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2 text-green-600">
                        <span>Pago na Reserva</span>
                        <span>- R$ {aluguel.valor_entrada}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-xl font-bold text-blue-600">
                        <span>A Receber:</span>
                        <span>R$ {totalFalta.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mb-8 space-y-4">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <DollarSign size={18} className="text-emerald-500"/> Pagamento
                    </label>

                    <div className="flex gap-3">
                        <div className="w-1/2">
                            <label className="text-xs font-bold text-gray-400 mb-1 block">VALOR 1</label>
                            <input type="number" className="w-full p-3 border rounded-lg bg-white font-bold text-gray-800 outline-none focus:border-blue-500" value={valor1} onChange={e => setValor1(e.target.value)} />
                        </div>
                        <div className="w-1/2">
                            <label className="text-xs font-bold text-gray-400 mb-1 block">MÉTODO 1</label>
                            <select className="w-full p-3 border rounded-lg bg-white" value={metodo1} onChange={e => setMetodo1(e.target.value)}>
                                <option value="Pix">Pix</option>
                                <option value="Dinheiro">Dinheiro</option>
                                <option value="Cartão Crédito">Cartão Crédito</option>
                                <option value="Cartão Débito">Cartão Débito</option>
                            </select>
                        </div>
                    </div>

                    {valor2 > 0 && (
                        <div className="flex gap-3 bg-orange-50 p-3 rounded-lg border border-orange-100">
                            <div className="w-1/2">
                                <label className="text-xs font-bold text-orange-600 mb-1 flex items-center gap-1"><Calculator size={10}/> RESTANTE</label>
                                <input value={valor2.toFixed(2)} disabled className="w-full p-3 border border-orange-200 rounded-lg bg-white text-orange-600 font-bold" />
                            </div>
                            <div className="w-1/2">
                                <label className="text-xs font-bold text-orange-600 mb-1 block">MÉTODO 2</label>
                                <select className="w-full p-3 border border-orange-200 rounded-lg bg-white outline-none focus:border-orange-500" value={metodo2} onChange={e => setMetodo2(e.target.value)}>
                                    <option value="Dinheiro">Dinheiro</option>
                                    <option value="Pix">Pix</option>
                                    <option value="Cartão Crédito">Cartão Crédito</option>
                                    <option value="Cartão Débito">Cartão Débito</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- BOTÃO QUE ABRE O MODAL --- */}
                <button 
                    onClick={() => setModalAberto(true)}
                    disabled={parseFloat(valor1) < 0}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-all flex justify-center items-center gap-2"
                >
                    <CheckCircle size={20}/> Confirmar Recebimento e Entregar
                </button>

            </div>
        </div>
      </main>
    </div>
  )
}