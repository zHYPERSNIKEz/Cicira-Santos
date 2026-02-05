import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../supabase'
import { X, CheckCircle, DollarSign, Calculator, PackageCheck, MapPin, ArrowLeft } from 'lucide-react'
import Sidebar from '../../components/Sidebar'

export default function Entrega() {
  const [loading, setLoading] = useState(true)
  const [aluguel, setAluguel] = useState(null)
  const navigate = useNavigate()
  const { id } = useParams()

  // Cálculos Derivados
  const total = aluguel?.valor_total || 0
  const pagoInicialmente = aluguel?.valor_entrada || 0
  const restanteParaPagar = total - pagoInicialmente

  // Estado do Pagamento
  const [pagamento1, setPagamento1] = useState({ valor: 0, metodo: 'Pix' })
  const [pagamento2, setPagamento2] = useState({ valor: 0, metodo: 'Dinheiro' })
  
  const precisaSegundoPagamento = parseFloat(pagamento1.valor || 0) < restanteParaPagar
  const faltaParaSegundo = restanteParaPagar - parseFloat(pagamento1.valor || 0)
  
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    async function carregarAluguel() {
      const { data, error } = await supabase.from('alugueis').select('*, clientes(*)').eq('id', id).single()
      if (error || !data) {
        console.error("Aluguel não encontrado", error)
        navigate('/alugueis')
      } else {
        setAluguel(data)
        setPagamento1({ valor: data.valor_total - data.valor_entrada, metodo: 'Pix' })
      }
      setLoading(false)
    }
    carregarAluguel()
  }, [id, navigate])

  const handleConfirmarEntrega = async () => {
    setLoading(true)
    const { error } = await supabase.from('alugueis').update({
        status: 'ativo', 
        valor_pago_final: parseFloat(pagamento1.valor),
        metodo_pagamento_final: pagamento1.metodo,
        valor_pago_final_2: precisaSegundoPagamento ? parseFloat(faltaParaSegundo) : 0,
        metodo_pagamento_final_2: precisaSegundoPagamento ? pagamento2.metodo : null
      }).eq('id', aluguel.id)

    setLoading(false)
    if (error) alert('Erro: ' + error.message)
    else navigate('/alugueis')
  }
  
  const enderecoCliente = aluguel?.clientes ? 
    `${aluguel.clientes.rua || ''}, ${aluguel.clientes.numero || ''} - ${aluguel.clientes.bairro || ''}` 
    : 'Endereço não cadastrado'

  if (loading) {
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
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg flex items-center gap-2"><PackageCheck size={24}/> Realizar Entrega</h3>
                <Link to="/alugueis" className="hover:text-blue-200"><X size={24}/></Link>
            </div>

            <div className="p-6 space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2 border border-gray-200">
                    <div>
                        <span className="text-gray-500 block text-xs font-bold uppercase">Cliente</span>
                        <span className="font-bold text-gray-800 text-lg">{aluguel?.clientes?.nome}</span>
                        <div className="flex items-start gap-1 text-gray-500 mt-1">
                            <MapPin size={14} className="mt-0.5 shrink-0"/> 
                            <span className="text-xs">{enderecoCliente}</span>
                        </div>
                    </div>
                    <hr className="border-gray-200 my-2"/>
                    <div className="flex justify-between text-gray-600"><span>Total:</span> <span className="font-bold">R$ {total.toFixed(2)}</span></div>
                    <div className="flex justify-between text-green-600"><span>Pago na Reserva:</span> <span className="font-bold">- R$ {pagoInicialmente.toFixed(2)}</span></div>
                    <div className="border-t border-gray-300 my-2 pt-2 flex justify-between text-lg font-black text-blue-700"><span>A Receber:</span><span>R$ {restanteParaPagar.toFixed(2)}</span></div>
                </div>

                <div>
                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><DollarSign size={18}/> Pagamento</h4>
                    <div className="flex gap-3 mb-3">
                        <div className="flex-1"><label className="text-xs font-bold text-gray-500">Valor</label><input type="number" className="w-full p-2 border rounded font-bold text-gray-800" value={pagamento1.valor} onChange={e => setPagamento1({...pagamento1, valor: e.target.value})}/></div>
                        <div className="flex-1"><label className="text-xs font-bold text-gray-500">Forma</label><select className="w-full p-2 border rounded bg-white" value={pagamento1.metodo} onChange={e => setPagamento1({...pagamento1, metodo: e.target.value})}><option>Pix</option><option>Dinheiro</option><option>Cartão Crédito</option><option>Cartão Débito</option></select></div>
                    </div>
                    {precisaSegundoPagamento && (<div className="bg-orange-50 p-3 rounded border border-orange-200 animate-fade-in"><div className="text-xs text-orange-700 font-bold mb-1 flex items-center gap-1"><Calculator size={12}/> Falta R$ {faltaParaSegundo.toFixed(2)} - Pagar com:</div><div className="flex gap-3"><div className="flex-1"><input type="text" disabled value={`R$ ${faltaParaSegundo.toFixed(2)}`} className="w-full p-2 border rounded bg-gray-100 text-gray-500"/></div><div className="flex-1"><select className="w-full p-2 border rounded bg-white" value={pagamento2.metodo} onChange={e => setPagamento2({...pagamento2, metodo: e.target.value})}><option>Dinheiro</option><option>Pix</option><option>Cartão Crédito</option></select></div></div></div>)}
                </div>
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                <Link to="/alugueis" className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded font-medium">Cancelar</Link>
                <button onClick={handleConfirmarEntrega} className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2">{loading ? '...' : 'Receber e Entregar'}</button>
            </div>
        </div>
      </main>
    </div>
  )
}
