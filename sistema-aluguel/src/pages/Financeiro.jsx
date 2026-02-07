import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Sidebar from '../components/Sidebar'
import { Search, DollarSign, PieChart, Menu, Calendar, TrendingUp, Wallet } from 'lucide-react'

export default function Financeiro() {
  const [menuAberto, setMenuAberto] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const hoje = new Date()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]

  const [filtros, setFiltros] = useState({ inicio: inicioMes, fim: fimMes })
  
  const [dados, setDados] = useState({
    faturadoReal: 0,        // Dinheiro TOTAL no bolso (De quem já pegou/devolveu)
    entradasReservas: 0,    // Dinheiro de SINAIS no bolso (Das reservas)
    potencialReservas: 0,   // Valor TOTAL dos contratos de reserva (Sinal + Falta Pagar)
    
    qtdRealizados: 0,
    qtdReservas: 0,
    
    graficoRealizado: [],   // Gráfico principal
    graficoSinais: []       // Novo Gráfico (Só entradas das reservas)
  })

  const BRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const handleDataInicioChange = (e) => {
    const novaDataInicio = e.target.value
    if (!novaDataInicio) return
    const [ano, mes] = novaDataInicio.split('-')
    const ultimoDiaDoMes = new Date(ano, mes, 0).toISOString().split('T')[0]
    setFiltros({ inicio: novaDataInicio, fim: ultimoDiaDoMes })
  }

  async function buscarRelatorio() {
    if (filtros.inicio > filtros.fim) {
        alert("⚠️ A Data Final não pode ser menor que a Data Inicial!")
        return
    }

    setLoading(true)
    
    const { data: alugueis, error } = await supabase
      .from('alugueis')
      .select('*')
      .gte('created_at', filtros.inicio)
      .lte('created_at', filtros.fim)
    
    if (error) {
        console.error(error)
        setLoading(false)
        return
    }

    // Variáveis
    let totalFaturado = 0
    let totalEntradasReserva = 0
    let totalPotencialReserva = 0
    let countRealizados = 0
    let countReservas = 0

    // Objetos para os gráficos
    let metodosReal = {} 
    let metodosSinais = {} // Novo objeto só para sinais

    alugueis.forEach(item => {
        const valorTotal = Number(item.valor_total) || 0
        const valorEntrada = Number(item.valor_entrada) || 0
        const valorRestante = valorTotal - valorEntrada

        // Método da ENTRADA (Usado tanto em reservas quanto em realizados)
        const metodoEntrada = item.forma_pagamento || 'Pix'
        
        // Método do RESTANTE (Só existe se já entregou)
        const metodoRestante = item.forma_pagamento_restante || 'Pix'

        // --- SITUAÇÃO 1: JÁ SAIU DA LOJA (Realizado) ---
        // Aqui somamos TUDO (Entrada + Restante) no gráfico da esquerda
        if (['ativo', 'devolvido', 'finalizado'].includes(item.status)) {
            totalFaturado += valorTotal
            countRealizados++

            // 1. Soma a Entrada no método dela
            if (!metodosReal[metodoEntrada]) metodosReal[metodoEntrada] = 0
            metodosReal[metodoEntrada] += valorEntrada

            // 2. Soma o Restante no método dele
            if (!metodosReal[metodoRestante]) metodosReal[metodoRestante] = 0
            metodosReal[metodoRestante] += valorRestante
        } 
        
        // --- SITUAÇÃO 2: AINDA É RESERVA (Pendente) ---
        // Aqui somamos SÓ A ENTRADA no gráfico da direita
        else if (item.status === 'pendente') {
            totalEntradasReserva += valorEntrada
            totalPotencialReserva += valorTotal // Valor do contrato cheio para KPI
            countReservas++

            // Soma SÓ a entrada no gráfico de sinais
            if (!metodosSinais[metodoEntrada]) metodosSinais[metodoEntrada] = 0
            metodosSinais[metodoEntrada] += valorEntrada
        }
    })

    const gerarArrayGrafico = (objetoMetodos, valorTotalBase) => {
        return Object.keys(objetoMetodos).map(key => ({
            nome: key,
            valor: objetoMetodos[key],
            porcentagem: valorTotalBase > 0 ? (objetoMetodos[key] / valorTotalBase) * 100 : 0
        }))
    }

    setDados({
        faturadoReal: totalFaturado,
        entradasReservas: totalEntradasReserva,
        potencialReservas: totalPotencialReserva,
        qtdRealizados: countRealizados,
        qtdReservas: countReservas,
        
        // Gráfico 1: Todo o dinheiro de contratos fechados/ativos
        graficoRealizado: gerarArrayGrafico(metodosReal, totalFaturado),
        
        // Gráfico 2: Só o dinheiro da entrada das reservas
        graficoSinais: gerarArrayGrafico(metodosSinais, totalEntradasReserva)
    })

    setLoading(false)
  }

  useEffect(() => {
    buscarRelatorio()
  }, [])

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-0">
      <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />

      <main className="p-4 md:p-8 md:ml-64 transition-all">
        {/* Header Mobile */}
        <div className="md:hidden flex items-center justify-between mb-6">
            <button onClick={() => setMenuAberto(true)} className="p-2 bg-white rounded shadow text-gray-700"><Menu size={24}/></button>
            <span className="font-bold text-gray-700">Financeiro</span><div className="w-8"></div>
        </div>

        <header className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <DollarSign className="text-emerald-600"/> Financeiro
            </h2>
            <p className="text-gray-500">Fluxo de caixa detalhado.</p>
        </header>

        {/* FILTROS */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-auto">
                <label className="text-xs font-bold text-gray-500 mb-1 block">DATA INICIAL</label>
                <input type="date" className="p-2 border rounded-lg w-full md:w-40" value={filtros.inicio} onChange={handleDataInicioChange} />
            </div>
            <div className="w-full md:w-auto">
                <label className="text-xs font-bold text-gray-500 mb-1 block">DATA FINAL</label>
                <input type="date" className="p-2 border rounded-lg w-full md:w-40" value={filtros.fim} min={filtros.inicio} onChange={e => setFiltros({...filtros, fim: e.target.value})} />
            </div>
            <button onClick={buscarRelatorio} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 w-full md:w-auto justify-center">
                <Search size={18} /> Atualizar
            </button>
        </div>

        {loading ? (
            <div className="text-center py-10 text-gray-500">Calculando...</div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* --- COLUNA 1: REALIZADO (Tudo que já é garantido) --- */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-emerald-600 uppercase border-b border-emerald-100 pb-2">
                        ✅ Caixa Confirmado (Entregues)
                    </h3>
                    
                    {/* Card Total */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-200 border-l-4 border-l-emerald-500 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase">Faturamento Total</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-2">{BRL(dados.faturadoReal)}</h3>
                            <p className="text-xs text-emerald-600 mt-1">{dados.qtdRealizados} contratos ativos/finalizados</p>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={28}/></div>
                    </div>

                    {/* Gráfico Realizado */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <PieChart size={18} className="text-emerald-500"/>
                            <p className="text-sm font-bold text-gray-600 uppercase">Métodos (Entrada + Restante)</p>
                        </div>
                        {dados.graficoRealizado.length === 0 ? (
                            <p className="text-xs text-gray-400">Sem dados realizados.</p>
                        ) : (
                            <div className="space-y-3">
                                {dados.graficoRealizado.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 text-sm">
                                        <span className="w-24 font-medium text-gray-600">{item.nome}</span>
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: `${item.porcentagem}%` }}></div>
                                        </div>
                                        <span className="font-bold text-gray-800">{BRL(item.valor)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>


                {/* --- COLUNA 2: RESERVAS (Foco na Entrada) --- */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-blue-600 uppercase border-b border-blue-100 pb-2">
                        📅 Entrada
                    </h3>

                    {/* GRÁFICO NOVO: SINAIS RECEBIDOS */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Wallet size={18} className="text-blue-500"/>
                            <p className="text-sm font-bold text-gray-600 uppercase">Valor Total da Entrada</p>
                        </div>
                        
                        <div className="mb-4">
                            <h3 className="text-2xl font-bold text-blue-700">{BRL(dados.entradasReservas)}</h3>
                            <p className="text-xs text-gray-400">Dinheiro já em caixa referente a reservas</p>
                        </div>

                        {dados.graficoSinais.length === 0 ? (
                            <p className="text-xs text-gray-400">Sem reservas pendentes.</p>
                        ) : (
                            <div className="space-y-3 border-t pt-4">
                                {dados.graficoSinais.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 text-sm">
                                        <span className="w-24 font-medium text-gray-600">{item.nome}</span>
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${item.porcentagem}%` }}></div>
                                        </div>
                                        <span className="font-bold text-gray-800">{BRL(item.valor)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Card Potencial (Sem gráfico, só informativo) */}
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 border-l-4 border-l-orange-500 flex justify-between items-center opacity-80">
                        <div>
                            <p className="text-sm font-bold text-orange-600 uppercase">Valor Total dos Contratos</p>
                            <h3 className="text-xl font-bold text-gray-800 mt-1">{BRL(dados.potencialReservas)}</h3>
                            <p className="text-xs text-orange-600 mt-1">Soma total das {dados.qtdReservas} reservas (Sinal + Restante)</p>
                        </div>
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><Calendar size={24}/></div>
                    </div>
                </div>

            </div>
        )}
      </main>
    </div>
  )
}