import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { X, Save, Search, Trash2, ShoppingBag, UserPlus, MapPin, Phone, AlertCircle, PackagePlus, Calculator, CalendarCheck, FileText } from 'lucide-react'

export default function ModalNovoAluguel({ onClose, onSave, aluguelParaEditar = null }) {
  const [loading, setLoading] = useState(false)
  
  // --- ESTADOS ---
  const [dadosCliente, setDadosCliente] = useState({ id: null, nome: '', cpf: '', telefone: '', endereco: '' })
  const [termoBusca, setTermoBusca] = useState('') 
  const [clienteEncontradoNaBusca, setClienteEncontradoNaBusca] = useState(null) 
  const [modoEdicaoCliente, setModoEdicaoCliente] = useState(false)
  const [cpfInvalido, setCpfInvalido] = useState(false)

  const [termoProduto, setTermoProduto] = useState('')
  const [produtosEncontrados, setProdutosEncontrados] = useState([])
  const [carrinho, setCarrinho] = useState([])
  const [modoProdutoManual, setModoProdutoManual] = useState(false)
  const [produtoManual, setProdutoManual] = useState({ nome: '', preco: '' })

  const [datas, setDatas] = useState({ retirada: new Date().toISOString().split('T')[0], devolucao: '' })
  const [pagamento, setPagamento] = useState({ entrada: '', metodo: 'Pix' })
  
  // NOVO: Anotações
  const [anotacoes, setAnotacoes] = useState('')

  // --- MODO EDIÇÃO: CARREGAR DADOS ---
  useEffect(() => {
    if (aluguelParaEditar) {
        // Carregar Cliente
        if (aluguelParaEditar.clientes) {
            setDadosCliente(aluguelParaEditar.clientes)
            setModoEdicaoCliente(false)
        }
        
        // Carregar Datas, Pagamento e Anotações
        setDatas({
            retirada: aluguelParaEditar.data_retirada,
            devolucao: aluguelParaEditar.data_devolucao
        })
        setPagamento({
            entrada: aluguelParaEditar.valor_entrada,
            metodo: aluguelParaEditar.metodo_pagamento
        })
        setAnotacoes(aluguelParaEditar.anotacoes || '')

        // Carregar Itens (Busca na tabela itens_aluguel)
        const carregarItens = async () => {
            const { data } = await supabase
                .from('itens_aluguel')
                .select('*, produtos(*)')
                .eq('aluguel_id', aluguelParaEditar.id)
            
            if (data) {
                const itensFormatados = data.map(item => ({
                    id: item.produtos?.id, // ID real do produto
                    nome: item.produtos?.nome,
                    codigo: item.produtos?.codigo,
                    preco_aluguel: item.preco_na_epoca
                }))
                setCarrinho(itensFormatados)
            }
        }
        carregarItens()
    } else {
        // Se for novo, calcula data sugerida
        const hoje = new Date().toISOString().split('T')[0]
        setDatas(prev => ({ ...prev, devolucao: calcularSugestaoDevolucao(hoje) }))
    }
  }, [aluguelParaEditar])

  // --- LÓGICAS (Iguais ao anterior) ---
  function calcularSugestaoDevolucao(dataRetiradaString) {
    if (!dataRetiradaString) return ''
    const data = new Date(dataRetiradaString + 'T12:00:00')
    const diaSemana = data.getDay()
    let diasParaAdicionar = 1
    if (diaSemana === 5) diasParaAdicionar = 3
    if (diaSemana === 6) diasParaAdicionar = 2
    data.setDate(data.getDate() + diasParaAdicionar)
    return data.toISOString().split('T')[0]
  }

  const handleMudancaRetirada = (e) => {
      const novaRetirada = e.target.value
      setDatas({ retirada: novaRetirada, devolucao: calcularSugestaoDevolucao(novaRetirada) })
  }

  function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '')
    if (cpf === '') return false // Permite vazio se estiver editando sem cpf
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
    let soma = 0, resto
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i)
    resto = (soma * 10) % 11
    if ((resto === 10) || (resto === 11)) resto = 0
    if (resto !== parseInt(cpf.substring(9, 10))) return false
    soma = 0
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i)
    resto = (soma * 10) % 11
    if ((resto === 10) || (resto === 11)) resto = 0
    if (resto !== parseInt(cpf.substring(10, 11))) return false
    return true
  }

  const handleBuscaCPF = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '')
    const cpfFormatado = apenasNumeros.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1')
    setTermoBusca(cpfFormatado)
    if (cpfFormatado.length === 14) {
        const ehValido = validarCPF(cpfFormatado)
        setCpfInvalido(!ehValido)
    } else { setCpfInvalido(false) }
  }

  const handleTelefone = (valor) => {
    let v = valor.replace(/\D/g, "").replace(/^(\d\d)(\d)/g, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2")
    if (v.length > 15) return 
    setDadosCliente({ ...dadosCliente, telefone: v })
  }

  // BUSCA CLIENTE
  useEffect(() => {
    if (modoEdicaoCliente || termoBusca.length < 11 || cpfInvalido) { setClienteEncontradoNaBusca(null); return }
    const delay = setTimeout(async () => {
      const { data } = await supabase.from('clientes').select('*').ilike('cpf', `${termoBusca}%`).limit(1).single()
      if (data) setClienteEncontradoNaBusca(data)
      else setClienteEncontradoNaBusca(null)
    }, 300)
    return () => clearTimeout(delay)
  }, [termoBusca, modoEdicaoCliente, cpfInvalido])

  const selecionarCliente = () => { if (clienteEncontradoNaBusca) { setDadosCliente(clienteEncontradoNaBusca); setModoEdicaoCliente(false); setTermoBusca(''); setClienteEncontradoNaBusca(null); } }
  const ativarNovoCliente = () => { setModoEdicaoCliente(true); setClienteEncontradoNaBusca(null); setDadosCliente({ id: null, nome: '', cpf: termoBusca, telefone: '', endereco: '' }); setTermoBusca(''); }

  // BUSCA PRODUTOS
  useEffect(() => {
    if (!termoProduto || termoProduto.length === 0) { setProdutosEncontrados([]); return }
    const delay = setTimeout(async () => {
      const { data } = await supabase.from('produtos').select('*').limit(1000) 
      const termo = termoProduto.toLowerCase().trim()
      const ehNumero = /^[0-9]+$/.test(termo)
      const filtrados = (data || []).filter(produto => {
        const status = produto.status ? produto.status.toLowerCase() : 'disponivel'
        if (status === 'manutencao') return false
        if (ehNumero) return produto.codigo ? produto.codigo.toString().includes(termo) : false
        else return produto.nome ? produto.nome.toLowerCase().includes(termo) : false
      })
      setProdutosEncontrados(filtrados.slice(0, 10))
    }, 300)
    return () => clearTimeout(delay)
  }, [termoProduto])

  const verificarDisponibilidadeEAdicionar = async (produto) => {
    if (!datas.retirada || !datas.devolucao) { alert("Selecione as datas primeiro!"); return }
    if (carrinho.find(item => item.id === produto.id)) return 

    // Se estiver editando, ignorar o próprio aluguel na verificação de conflito
    let query = supabase.from('itens_aluguel')
        .select(`alugueis!inner (id, data_retirada, data_devolucao, status)`)
        .eq('produto_id', produto.id)
        .eq('alugueis.status', 'ativo')
        .lte('alugueis.data_retirada', datas.devolucao)
        .gte('alugueis.data_devolucao', datas.retirada)
    
    if (aluguelParaEditar) {
        query = query.neq('alugueis.id', aluguelParaEditar.id)
    }

    const { data: conflitos } = await query

    if (conflitos && conflitos.length > 0) {
        const c = conflitos[0].alugueis
        alert(`❌ Já alugado de ${new Date(c.data_retirada).toLocaleDateString()} até ${new Date(c.data_devolucao).toLocaleDateString()}`)
        return
    }
    setCarrinho([...carrinho, produto])
    setTermoProduto(''); setProdutosEncontrados([])
  }

  const adicionarProdutoManual = () => {
    if (!produtoManual.nome || !produtoManual.preco) return
    const novoItem = { id: `temp-${Date.now()}`, nome: produtoManual.nome, preco_aluguel: parseFloat(produtoManual.preco), codigo: 'NOVO', isNovo: true }
    setCarrinho([...carrinho, novoItem])
    setProdutoManual({ nome: '', preco: '' }); setModoProdutoManual(false)
  }

  // CÁLCULOS
  const total = carrinho.reduce((acc, item) => acc + item.preco_aluguel, 0)
  const valorEntrada = parseFloat(pagamento.entrada || 0)
  const valorRestante = total - valorEntrada

  // --- SALVAR (CRIAR OU ATUALIZAR) ---
  const finalizarAluguel = async () => {
    if (dadosCliente.cpf && !validarCPF(dadosCliente.cpf)) { alert("CPF Inválido."); return }
    if (!dadosCliente.nome || carrinho.length === 0 || !datas.devolucao) { alert('Preencha todos os dados obrigatórios!'); return }
    if (datas.devolucao < datas.retirada) { alert('Data de devolução inválida!'); return }
    
    setLoading(true)

    // 1. CLIENTE (Upsert)
    let clienteIdFinal = dadosCliente.id
    if (!clienteIdFinal) {
      const { data: novoC, error: errC } = await supabase.from('clientes').insert([{ nome: dadosCliente.nome, cpf: dadosCliente.cpf, telefone: dadosCliente.telefone, endereco: dadosCliente.endereco }]).select().single()
      if (errC) { alert('Erro Cliente: ' + errC.message); setLoading(false); return }
      clienteIdFinal = novoC.id
    } else {
        await supabase.from('clientes').update({ endereco: dadosCliente.endereco, telefone: dadosCliente.telefone }).eq('id', clienteIdFinal)
    }

    // 2. PRODUTOS NOVOS
    const carrinhoProcessado = []
    for (const item of carrinho) {
        if (item.isNovo) {
            const { data: prodNovo } = await supabase.from('produtos').insert([{ nome: item.nome, preco_aluguel: item.preco_aluguel, status: 'disponivel', tamanho: 'UNICO', codigo: 0 }]).select().single()
            if (prodNovo) carrinhoProcessado.push(prodNovo)
        } else { carrinhoProcessado.push(item) }
    }

    // 3. ALUGUEL (Insert ou Update)
    let aluguelId = null
    const dadosAluguel = {
        cliente_id: clienteIdFinal,
        data_retirada: datas.retirada,
        data_devolucao: datas.devolucao,
        valor_total: total,
        valor_entrada: valorEntrada,
        metodo_pagamento: pagamento.metodo,
        anotacoes: anotacoes, // Salvando anotações
        status: 'ativo'
    }

    if (aluguelParaEditar) {
        // ATUALIZAR
        await supabase.from('alugueis').update(dadosAluguel).eq('id', aluguelParaEditar.id)
        aluguelId = aluguelParaEditar.id
        // Limpar itens antigos para salvar os novos (jeito mais simples de editar lista)
        await supabase.from('itens_aluguel').delete().eq('aluguel_id', aluguelId)
    } else {
        // CRIAR
        const { data: novoAluguel, error } = await supabase.from('alugueis').insert([dadosAluguel]).select().single()
        if (error) { alert('Erro Aluguel'); setLoading(false); return }
        aluguelId = novoAluguel.id
    }

    // 4. ITENS
    const itensParaSalvar = carrinhoProcessado.map(prod => ({
      aluguel_id: aluguelId,
      produto_id: prod.id,
      preco_na_epoca: prod.preco_aluguel
    }))
    await supabase.from('itens_aluguel').insert(itensParaSalvar)

    setLoading(false)
    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <ShoppingBag size={20} className="text-blue-400"/> {aluguelParaEditar ? 'Editar Aluguel' : 'Novo Aluguel'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* SEÇÃO 1: CLIENTE */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                 <h4 className="font-bold text-gray-700 mb-2">1. Cliente</h4>
                 {!dadosCliente.id && !modoEdicaoCliente ? (
                     <div className="relative">
                        <input type="text" placeholder="Buscar CPF..." className="w-full p-2 border rounded" value={termoBusca} onChange={e => handleBuscaCPF(e.target.value)} autoFocus />
                        {termoBusca.length === 14 && <button onClick={ativarNovoCliente} className="mt-2 text-blue-600 font-bold">Cadastrar Novo</button>}
                        {clienteEncontradoNaBusca && <div onClick={selecionarCliente} className="p-2 bg-green-100 mt-1 cursor-pointer">{clienteEncontradoNaBusca.nome}</div>}
                     </div>
                 ) : (
                     <div className="grid grid-cols-2 gap-2">
                         <input disabled value={dadosCliente.nome} className="p-2 border rounded bg-gray-200 col-span-2" />
                         <input disabled value={dadosCliente.cpf} className="p-2 border rounded bg-gray-200" />
                         <input value={dadosCliente.telefone} onChange={e => handleTelefone(e.target.value)} className="p-2 border rounded" placeholder="Tel" />
                     </div>
                 )}
            </div>

            {/* SEÇÃO DATAS */}
            <div className="flex gap-4">
                <div className="flex-1"><label className="text-xs font-bold text-blue-600">Retirada</label><input type="date" className="w-full p-2 border rounded" value={datas.retirada} onChange={handleMudancaRetirada}/></div>
                <div className="flex-1"><label className="text-xs font-bold text-blue-600">Devolução</label><input type="date" className="w-full p-2 border rounded" value={datas.devolucao} onChange={e => setDatas({...datas, devolucao: e.target.value})}/></div>
            </div>

            {/* SEÇÃO PRODUTOS */}
            <div>
                 <div className="flex justify-between"><h4 className="font-bold text-gray-700">2. Roupas</h4><button onClick={() => setModoProdutoManual(!modoProdutoManual)} className="text-xs text-blue-600">Manual</button></div>
                 {modoProdutoManual ? (
                     <div className="flex gap-2 mt-2"><input placeholder="Nome" value={produtoManual.nome} onChange={e=>setProdutoManual({...produtoManual, nome:e.target.value})} className="border p-1 flex-1"/><input placeholder="R$" type="number" value={produtoManual.preco} onChange={e=>setProdutoManual({...produtoManual, preco:e.target.value})} className="border p-1 w-20"/><button onClick={adicionarProdutoManual} className="bg-orange-500 text-white px-2 rounded">OK</button></div>
                 ) : (
                    <div className="relative mt-2">
                        <input placeholder="Buscar Roupa..." className="w-full p-2 border rounded" value={termoProduto} onChange={e=>setTermoProduto(e.target.value)}/>
                        {produtosEncontrados.length > 0 && <div className="absolute w-full bg-white shadow border mt-1 max-h-40 overflow-auto z-10">{produtosEncontrados.map(p => <div key={p.id} onClick={()=>verificarDisponibilidadeEAdicionar(p)} className="p-2 hover:bg-gray-100 cursor-pointer">{p.nome} - R$ {p.preco_aluguel}</div>)}</div>}
                    </div>
                 )}
                 <div className="mt-2 space-y-1">{carrinho.map(item => <div key={item.id} className="flex justify-between bg-gray-50 p-2 rounded"><span>{item.nome}</span><div className="flex gap-2"><span>R$ {item.preco_aluguel}</span><button onClick={()=>setCarrinho(carrinho.filter(i=>i.id!==item.id))} className="text-red-500"><Trash2 size={14}/></button></div></div>)}</div>
            </div>

            {/* NOVO: ANOTAÇÕES */}
            <div>
                <h4 className="font-bold text-gray-700 mb-1 flex items-center gap-2"><FileText size={16}/> Anotações / Ajustes</h4>
                <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    rows="3"
                    placeholder="Ex: Fazer bainha, apertar na cintura, cliente virá buscar as 14h..."
                    value={anotacoes}
                    onChange={e => setAnotacoes(e.target.value)}
                ></textarea>
            </div>

            {/* PAGAMENTO */}
            <div className="bg-slate-100 p-3 rounded flex flex-col gap-2">
                 <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>R$ {total.toFixed(2)}</span></div>
                 <div className="flex gap-2">
                     <div className="flex-1"><label className="text-xs">Entrada</label><input type="number" className="w-full p-2 border rounded" value={pagamento.entrada} onChange={e=>setPagamento({...pagamento, entrada:e.target.value})}/></div>
                     <div className="flex-1"><label className="text-xs">Método</label><select className="w-full p-2 border rounded" value={pagamento.metodo} onChange={e=>setPagamento({...pagamento, metodo:e.target.value})}><option>Pix</option><option>Dinheiro</option><option>Cartão</option></select></div>
                 </div>
                 <div className="text-right text-red-600 font-bold">Falta: R$ {valorRestante.toFixed(2)}</div>
            </div>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Cancelar</button>
          <button onClick={finalizarAluguel} disabled={loading || !dadosCliente.nome || carrinho.length === 0} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg">{loading ? <span className="animate-spin">⏳</span> : <Save size={20} />} {aluguelParaEditar ? 'Salvar Alterações' : 'Confirmar Aluguel'}</button>
        </div>
      </div>
    </div>
  )
}