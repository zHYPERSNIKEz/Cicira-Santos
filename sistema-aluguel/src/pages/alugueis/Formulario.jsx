import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../supabase'
import { Save, ShoppingBag, UserPlus, MapPin, Trash2, FileText, ArrowLeft } from 'lucide-react'
import Sidebar from '../../components/Sidebar'

export default function Formulario() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams() // id do aluguel para edição

  // --- ESTADOS ---
  const [dadosCliente, setDadosCliente] = useState({ id: null, nome: '', cpf: '', telefone: '', rua: '', numero: '', bairro: '', cidade: '' })
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
  const [anotacoes, setAnotacoes] = useState('')
  const [statusAluguel, setStatusAluguel] = useState('pendente')
  
  const [menuAberto, setMenuAberto] = useState(false)

  // --- MODO EDIÇÃO ---
  useEffect(() => {
    async function carregarAluguel() {
      if (id) {
        setLoading(true)
        const { data: aluguelParaEditar, error } = await supabase.from('alugueis').select('*, clientes(*)').eq('id', id).single()
        
        if (error) {
          console.error("Erro ao buscar aluguel:", error)
          navigate('/alugueis')
          return
        }

        if (aluguelParaEditar) {
            if (aluguelParaEditar.clientes) {
                setDadosCliente({
                    ...aluguelParaEditar.clientes,
                    rua: aluguelParaEditar.clientes.rua || '',
                    numero: aluguelParaEditar.clientes.numero || '',
                    bairro: aluguelParaEditar.clientes.bairro || '',
                    cidade: aluguelParaEditar.clientes.cidade || ''
                })
                setModoEdicaoCliente(false)
            }
            setDatas({ retirada: aluguelParaEditar.data_retirada, devolucao: aluguelParaEditar.data_devolucao })
            setPagamento({ entrada: aluguelParaEditar.valor_entrada, metodo: aluguelParaEditar.metodo_pagamento })
            setAnotacoes(aluguelParaEditar.anotacoes || '')
            setStatusAluguel(aluguelParaEditar.status)

            const { data: itens } = await supabase.from('itens_aluguel').select('*, produtos(*)').eq('aluguel_id', aluguelParaEditar.id)
            if (itens) {
                setCarrinho(itens.map(item => ({
                    id: item.produtos?.id, nome: item.produtos?.nome, codigo: item.produtos?.codigo, preco_aluguel: item.preco_na_epoca
                })))
            }
        }
        setLoading(false)
      } else {
        const hoje = new Date().toISOString().split('T')[0]
        setDatas(prev => ({ ...prev, devolucao: calcularSugestaoDevolucao(hoje) }))
      }
    }
    carregarAluguel()
  }, [id, navigate])

  // ... (manter as funções auxiliares, de busca, etc., com as devidas adaptações)

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
    if (cpf === '') return true 
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

  useEffect(() => {
    if (modoEdicaoCliente || termoBusca.length < 11 || cpfInvalido) { setClienteEncontradoNaBusca(null); return }
    const delay = setTimeout(async () => {
      const { data } = await supabase.from('clientes').select('*').ilike('cpf', `${termoBusca}%`).limit(1).single()
      if (data) setClienteEncontradoNaBusca(data)
      else setClienteEncontradoNaBusca(null)
    }, 300)
    return () => clearTimeout(delay)
  }, [termoBusca, modoEdicaoCliente, cpfInvalido])

  const selecionarCliente = () => { 
      if (clienteEncontradoNaBusca) { 
          setDadosCliente({
              ...clienteEncontradoNaBusca,
              rua: clienteEncontradoNaBusca.rua || '',
              numero: clienteEncontradoNaBusca.numero || '',
              bairro: clienteEncontradoNaBusca.bairro || '',
              cidade: clienteEncontradoNaBusca.cidade || ''
          })
          setModoEdicaoCliente(false)
          setTermoBusca('')
          setClienteEncontradoNaBusca(null)
      } 
  }

  const ativarNovoCliente = () => { 
      setModoEdicaoCliente(true)
      setClienteEncontradoNaBusca(null)
      setDadosCliente({ 
          id: null, nome: '', cpf: termoBusca, telefone: '', 
          rua: '', numero: '', bairro: '', cidade: '' 
      })
      setTermoBusca('')
  }

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

    let query = supabase.from('itens_aluguel')
        .select(`alugueis!inner (id, data_retirada, data_devolucao, status)`)
        .eq('produto_id', produto.id)
        .in('alugueis.status', ['ativo', 'pendente'])
        .lte('alugueis.data_retirada', datas.devolucao)
        .gte('alugueis.data_devolucao', datas.retirada)
    
    if (id) query = query.neq('alugueis.id', id)

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

  const total = carrinho.reduce((acc, item) => acc + (item.preco_aluguel || 0), 0)
  const valorEntrada = parseFloat(pagamento.entrada || 0)
  const valorRestante = total - valorEntrada

  // --- SALVAR ---
  const finalizarAluguel = async () => {
    if (dadosCliente.cpf && !validarCPF(dadosCliente.cpf)) { alert("CPF Inválido."); return }
    if (!dadosCliente.nome || carrinho.length === 0 || !datas.devolucao) { alert('Preencha os dados obrigatórios!'); return }
    if (datas.devolucao < datas.retirada) { alert('Data de devolução inválida!'); return }
    setLoading(true)

    const clientePayload = { 
        nome: dadosCliente.nome, cpf: dadosCliente.cpf, telefone: dadosCliente.telefone, 
        rua: dadosCliente.rua, numero: dadosCliente.numero, bairro: dadosCliente.bairro, cidade: dadosCliente.cidade,
        endereco: `${dadosCliente.rua}, ${dadosCliente.numero} - ${dadosCliente.bairro}` 
    }

    let clienteIdFinal = dadosCliente.id
    if (!clienteIdFinal) {
      const { data: novoC, error: errC } = await supabase.from('clientes').insert([clientePayload]).select().single()
      if (errC) { alert('Erro Cliente: ' + errC.message); setLoading(false); return }
      clienteIdFinal = novoC.id
    } else {
        await supabase.from('clientes').update(clientePayload).eq('id', clienteIdFinal)
    }

    const carrinhoProcessado = []
    for (const item of carrinho) {
        if (item.isNovo) {
            const { data: prodNovo } = await supabase.from('produtos').insert([{ nome: item.nome, preco_aluguel: item.preco_aluguel, status: 'disponivel', tamanho: 'UNICO', codigo: 0 }]).select().single()
            if (prodNovo) carrinhoProcessado.push(prodNovo)
        } else { carrinhoProcessado.push(item) }
    }

    let aluguelId = id
    const dadosAluguel = {
        cliente_id: clienteIdFinal, data_retirada: datas.retirada, data_devolucao: datas.devolucao,
        valor_total: total, valor_entrada: valorEntrada, metodo_pagamento: pagamento.metodo,
        anotacoes: anotacoes, status: statusAluguel
    }

    if (id) {
        await supabase.from('alugueis').update(dadosAluguel).eq('id', id)
        await supabase.from('itens_aluguel').delete().eq('aluguel_id', id)
    } else {
        const { data: novoAluguel, error } = await supabase.from('alugueis').insert([dadosAluguel]).select().single()
        if (error) { alert('Erro Aluguel'); setLoading(false); return }
        aluguelId = novoAluguel.id
    }

    const itensParaSalvar = carrinhoProcessado.map(prod => ({
      aluguel_id: aluguelId, produto_id: prod.id, preco_na_epoca: prod.preco_aluguel
    }))
    await supabase.from('itens_aluguel').insert(itensParaSalvar)

    setLoading(false)
    navigate('/alugueis')
  }

  const camposIdentificacaoTravados = !!dadosCliente.id && !modoEdicaoCliente

  return (
    <div className="bg-gray-50 min-h-screen">
        <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />
        <main className="p-4 md:p-8 md:ml-64 transition-all">
             <header className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                   <ShoppingBag size={28} className="text-blue-600"/> {id ? 'Editar Aluguel' : 'Novo Aluguel'}
                </h2>
                <Link to="/alugueis" className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium flex items-center gap-2">
                    <ArrowLeft size={16}/> Voltar
                </Link>
            </header>

            {loading && <div className="p-8 text-center text-gray-500 animate-pulse">Carregando dados...</div>}
            
            {!loading && (
                 <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto">
                    <div className="space-y-6">
                        {/* SEÇÃO 1: CLIENTE */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h4 className="font-bold text-gray-700 flex items-center gap-2"><span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> Cliente</h4>
                            {!dadosCliente.id && !modoEdicaoCliente && (
                                <div className="relative">
                                    <label className="text-xs font-bold text-gray-500">BUSCAR POR CPF</label>
                                    <input type="text" placeholder="000.000.000-00" className="w-full p-2 border rounded font-mono text-lg" value={termoBusca} onChange={e => handleBuscaCPF(e.target.value)} autoFocus />
                                    {termoBusca.length === 14 && (<button onClick={ativarNovoCliente} className="mt-2 w-full py-3 bg-blue-600 text-white font-bold rounded flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"><UserPlus size={18}/> Cadastrar Novo Cliente</button>)}
                                    {clienteEncontradoNaBusca && (<div onClick={selecionarCliente} className="mt-2 p-3 bg-green-100 border border-green-300 rounded cursor-pointer hover:bg-green-200 flex justify-between items-center"><div><div className="font-bold text-green-800">{clienteEncontradoNaBusca.nome}</div><div className="text-xs text-green-700">CPF: {clienteEncontradoNaBusca.cpf}</div></div><span className="text-xs font-bold bg-green-700 text-white px-2 py-1 rounded">Selecionar</span></div>)}
                                </div>
                            )}
                            {(dadosCliente.id || modoEdicaoCliente) && (
                                <div className="grid grid-cols-12 gap-3 animate-fade-in">
                                    <div className="col-span-12 flex justify-end"><button onClick={()=>{setDadosCliente({id:null, nome:'', cpf:'', telefone:'', rua:'', numero:'', bairro:'', cidade:''}); setModoEdicaoCliente(false); setTermoBusca('')}} className="text-xs text-red-500 hover:text-red-700 font-bold underline">Trocar / Limpar</button></div>
                                    <div className="col-span-12 md:col-span-8"><label className="text-xs font-bold text-gray-500">NOME</label><input disabled={camposIdentificacaoTravados} value={dadosCliente.nome} onChange={e => setDadosCliente({...dadosCliente, nome: e.target.value})} className={`w-full p-2 border rounded font-medium ${camposIdentificacaoTravados ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-500'}`} placeholder="Nome Completo"/></div>
                                    <div className="col-span-12 md:col-span-4"><label className="text-xs font-bold text-gray-500">CPF</label><input disabled={camposIdentificacaoTravados} value={dadosCliente.cpf} className={`w-full p-2 border rounded font-mono ${camposIdentificacaoTravados ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'bg-white border-blue-300'}`} readOnly/></div>
                                    <div className="col-span-12 md:col-span-4"><label className="text-xs font-bold text-gray-500">TELEFONE</label><input value={dadosCliente.telefone} onChange={e => handleTelefone(e.target.value)} className="w-full p-2 border rounded bg-white font-medium" placeholder="(00) 00000-0000"/></div>
                                    <div className="col-span-12 md:col-span-8"><label className="text-xs font-bold text-gray-500 flex gap-1"><MapPin size={12}/> RUA</label><input value={dadosCliente.rua} onChange={e => setDadosCliente({...dadosCliente, rua: e.target.value})} className="w-full p-2 border rounded" placeholder="Rua / Avenida"/></div>
                                    <div className="col-span-4 md:col-span-3"><label className="text-xs font-bold text-gray-500">NÚMERO</label><input value={dadosCliente.numero} onChange={e => setDadosCliente({...dadosCliente, numero: e.target.value})} className="w-full p-2 border rounded" placeholder="Nº"/></div>
                                    <div className="col-span-8 md:col-span-5"><label className="text-xs font-bold text-gray-500">BAIRRO</label><input value={dadosCliente.bairro} onChange={e => setDadosCliente({...dadosCliente, bairro: e.target.value})} className="w-full p-2 border rounded" placeholder="Bairro"/></div>
                                    <div className="col-span-12 md:col-span-4"><label className="text-xs font-bold text-gray-500">CIDADE</label><input value={dadosCliente.cidade} onChange={e => setDadosCliente({...dadosCliente, cidade: e.target.value})} className="w-full p-2 border rounded" placeholder="Cidade"/></div>
                                </div>
                            )}
                        </div>

                        {/* SEÇÃO 2: DATAS */}
                        <div className="flex gap-4"><div className="flex-1"><label className="text-xs font-bold text-blue-600">Retirada</label><input type="date" className="w-full p-2 border rounded" value={datas.retirada} onChange={handleMudancaRetirada}/></div><div className="flex-1"><label className="text-xs font-bold text-blue-600">Devolução</label><input type="date" className="w-full p-2 border rounded" value={datas.devolucao} onChange={e => setDatas({...prev, devolucao: e.target.value})}/></div></div>

                        {/* SEÇÃO 3: PRODUTOS */}
                        <div>
                            <div className="flex justify-between"><h4 className="font-bold text-gray-700">3. Roupas</h4><button onClick={() => setModoProdutoManual(!modoProdutoManual)} className="text-xs text-blue-600">Manual</button></div>
                            {modoProdutoManual ? (<div className="flex gap-2 mt-2"><input placeholder="Nome" value={produtoManual.nome} onChange={e=>setProdutoManual({...produtoManual, nome:e.target.value})} className="border p-1 flex-1"/><input placeholder="R$" type="number" value={produtoManual.preco} onChange={e=>setProdutoManual({...produtoManual, preco:e.target.value})} className="border p-1 w-20"/><button onClick={adicionarProdutoManual} className="bg-orange-500 text-white px-2 rounded">OK</button></div>) : (<div className="relative mt-2"><input placeholder="Buscar Roupa..." className="w-full p-2 border rounded" value={termoProduto} onChange={e=>setTermoProduto(e.target.value)}/><div className="absolute w-full bg-white shadow border mt-1 max-h-40 overflow-auto z-10">{produtosEncontrados.map(p => <div key={p.id} onClick={()=>verificarDisponibilidadeEAdicionar(p)} className="p-2 hover:bg-gray-100 cursor-pointer">{p.nome} - R$ {p.preco_aluguel}</div>)}</div></div>)}
                            <div className="mt-2 space-y-1">{carrinho.map(item => <div key={item.id} className="flex justify-between bg-gray-50 p-2 rounded"><span>{item.nome}</span><div className="flex gap-2"><span>R$ {item.preco_aluguel}</span><button onClick={()=>setCarrinho(carrinho.filter(i=>i.id!==item.id))} className="text-red-500"><Trash2 size={14}/></button></div></div>)}</div>
                        </div>

                        {/* ANOTAÇÕES */}
                        <div><h4 className="font-bold text-gray-700 mb-1 flex items-center gap-2"><FileText size={16}/> Anotações</h4><textarea className="w-full p-3 border border-gray-300 rounded text-sm" rows="2" placeholder="Ex: Ajustes..." value={anotacoes} onChange={e => setAnotacoes(e.target.value)}></textarea></div>

                        {/* PAGAMENTO */}
                        <div className="bg-slate-100 p-3 rounded flex flex-col gap-2">
                            <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>R$ {total.toFixed(2)}</span></div>
                            <div className="flex gap-2"><div className="flex-1"><label className="text-xs">Entrada</label><input type="number" className="w-full p-2 border rounded" value={pagamento.entrada} onChange={e=>setPagamento({...pagamento, entrada:e.target.value})}/></div><div className="flex-1"><label className="text-xs">Método</label><select className="w-full p-2 border rounded" value={pagamento.metodo} onChange={e=>setPagamento({...pagamento, metodo:e.target.value})}><option>Pix</option><option>Dinheiro</option><option>Cartão</option></select></div></div>
                            <div className="text-right text-red-600 font-bold">Falta: R$ {valorRestante.toFixed(2)}</div>
                        </div>

                         <div className="pt-6 border-t flex justify-end gap-3">
                            <Link to="/alugueis" className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Cancelar</Link>
                            <button onClick={finalizarAluguel} disabled={loading || !dadosCliente.nome || carrinho.length === 0} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg">{loading ? <span className="animate-spin">⏳</span> : <Save size={20} />} Salvar Aluguel</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    </div>
  )
}
