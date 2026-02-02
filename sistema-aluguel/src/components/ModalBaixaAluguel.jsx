import { useState } from 'react'
import { supabase } from '../supabase'
import { X, CheckCircle, DollarSign, Calculator } from 'lucide-react'

export default function ModalBaixaAluguel({ aluguel, onClose, onSave }) {
  const [loading, setLoading] = useState(false)
  
  // Cálculos iniciais
  const total = aluguel.valor_total
  const pagoInicialmente = aluguel.valor_entrada
  const restanteOriginal = total - pagoInicialmente

  // Estado do Pagamento da Baixa
  const [pagamento1, setPagamento1] = useState({ valor: restanteOriginal, metodo: 'Pix' })
  const [pagamento2, setPagamento2] = useState({ valor: 0, metodo: 'Dinheiro' })
  
  // Lógica para ativar o segundo pagamento se o primeiro for menor que o restante
  const precisaSegundoPagamento = parseFloat(pagamento1.valor) < restanteOriginal
  const restanteParaSegundo = restanteOriginal - parseFloat(pagamento1.valor || 0)

  const handleConfirmarBaixa = async () => {
    setLoading(true)

    const { error } = await supabase
      .from('alugueis')
      .update({
        status: 'finalizado', // ou 'entregue' conforme sua preferencia
        data_finalizacao: new Date(),
        valor_pago_final: parseFloat(pagamento1.valor),
        metodo_pagamento_final: pagamento1.metodo,
        valor_pago_final_2: precisaSegundoPagamento ? parseFloat(restanteParaSegundo) : 0,
        metodo_pagamento_final_2: precisaSegundoPagamento ? pagamento2.metodo : null
      })
      .eq('id', aluguel.id)

    setLoading(false)
    if (error) {
        alert('Erro ao dar baixa: ' + error.message)
    } else {
        onSave() // Atualiza a lista
        onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        
        <div className="bg-green-600 px-6 py-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <CheckCircle size={24}/> Finalizar / Entregar
          </h3>
          <button onClick={onClose} className="hover:text-green-200"><X size={24}/></button>
        </div>

        <div className="p-6 space-y-6">
            {/* Resumo */}
            <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2 border border-gray-200">
                <div className="flex justify-between text-gray-600"><span>Cliente:</span> <span className="font-bold text-gray-800">{aluguel.clientes?.nome}</span></div>
                <div className="flex justify-between text-gray-600"><span>Total do Aluguel:</span> <span className="font-bold">R$ {total.toFixed(2)}</span></div>
                <div className="flex justify-between text-blue-600"><span>Já pago (Entrada):</span> <span className="font-bold">- R$ {pagoInicialmente.toFixed(2)}</span></div>
                <div className="border-t border-gray-300 my-2 pt-2 flex justify-between text-lg font-black text-red-600">
                    <span>A Receber:</span>
                    <span>R$ {restanteOriginal.toFixed(2)}</span>
                </div>
            </div>

            {/* Pagamento Restante */}
            <div>
                <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><DollarSign size={18}/> Pagamento Restante</h4>
                
                {/* Pagamento 1 */}
                <div className="flex gap-3 mb-3">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-gray-500">Valor</label>
                        <input 
                            type="number" 
                            className="w-full p-2 border rounded font-bold text-gray-800"
                            value={pagamento1.valor}
                            onChange={e => setPagamento1({...pagamento1, valor: e.target.value})}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-bold text-gray-500">Forma</label>
                        <select 
                            className="w-full p-2 border rounded bg-white"
                            value={pagamento1.metodo}
                            onChange={e => setPagamento1({...pagamento1, metodo: e.target.value})}
                        >
                            <option>Pix</option>
                            <option>Dinheiro</option>
                            <option>Cartão Crédito</option>
                            <option>Cartão Débito</option>
                        </select>
                    </div>
                </div>

                {/* Pagamento 2 (Aparece se faltar dinheiro) */}
                {precisaSegundoPagamento && (
                    <div className="bg-orange-50 p-3 rounded border border-orange-200 animate-fade-in">
                        <div className="text-xs text-orange-700 font-bold mb-1 flex items-center gap-1">
                            <Calculator size={12}/> Falta R$ {restanteParaSegundo.toFixed(2)} - Pagar com:
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <input 
                                    type="text" disabled 
                                    value={`R$ ${restanteParaSegundo.toFixed(2)}`}
                                    className="w-full p-2 border rounded bg-gray-100 text-gray-500"
                                />
                            </div>
                            <div className="flex-1">
                                <select 
                                    className="w-full p-2 border rounded bg-white"
                                    value={pagamento2.metodo}
                                    onChange={e => setPagamento2({...pagamento2, metodo: e.target.value})}
                                >
                                    <option>Dinheiro</option>
                                    <option>Pix</option>
                                    <option>Cartão Crédito</option>
                                    <option>Cartão Débito</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded font-medium">Cancelar</button>
            <button 
                onClick={handleConfirmarBaixa}
                className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 shadow-lg flex items-center gap-2"
            >
                {loading ? 'Processando...' : 'Confirmar e Entregar'}
            </button>
        </div>
      </div>
    </div>
  )
}