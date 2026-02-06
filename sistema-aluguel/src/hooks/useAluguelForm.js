import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'

export function useAluguelForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const modoEdicao = !!id

  const [loading, setLoading] = useState(false)
  
  // CLIENTE
  const [dadosCliente, setDadosCliente] = useState({ id: null, nome: '', cpf: '', telefone: '', rua: '', numero: '', bairro: '', cidade: '' })
  const [termoBusca, setTermoBusca] = useState('')
  const [clienteEncontradoNaBusca, setClienteEncontradoNaBusca] = useState(null)
  const [modoNovoCliente, setModoNovoCliente] = useState(false)
  const [cpfInvalido, setCpfInvalido] = useState(false)

  // PRODUTOS
  const [termoProduto, setTermoProduto] = useState('')
  const [produtosEncontrados, setProdutosEncontrados] = useState([])
  const [carrinho, setCarrinho] = useState([])
  const [modoProdutoManual, setModoProdutoManual] = useState(false)
  const [produtoManual, setProdutoManual] = useState({ nome: '', preco: '' })

  // DADOS GERAIS
  const [datas, setDatas] = useState({ retirada: new Date().toISOString().split('T')[0], devolucao: '' })
  const [pagamento, setPagamento] = useState({ entrada: '', metodo: 'Pix' })
  const [anotacoes, setAnotacoes] = useState('')
  const [statusAluguel, setStatusAluguel] = useState('pendente')

  // --- 1. CARREGAMENTO INICIAL (EDIÇÃO) ---
  useEffect(() => {
    async function carregar() {
      if (id) {
        setLoading(true)
        const { data: aluguel, error } = await supabase.from('alugueis').select('*, clientes(*)').eq('id', id).single()
        
        if (error || !aluguel) { navigate('/alugueis'); return }

        if (aluguel.clientes) {
            setDadosCliente({ ...aluguel.clientes, rua: aluguel.clientes.rua || '', numero: aluguel.clientes.numero || '', bairro: aluguel.clientes.bairro || '', cidade: aluguel.clientes.cidade || '' })
            setModoNovoCliente(false)
        }
        setDatas({ retirada: aluguel.data_retirada, devolucao: aluguel.data_devolucao })
        setPagamento({ entrada: aluguel.valor_entrada, metodo: aluguel.metodo_pagamento })
        setAnotacoes(aluguel.anotacoes || ''); setStatusAluguel(aluguel.status)

        const { data: itens } = await supabase.from('itens_aluguel').select('*, produtos(*)').eq('aluguel_id', id)
        if (itens) setCarrinho(itens.map(i => ({ id: i.produtos?.id, nome: i.produtos?.nome, codigo: i.produtos?.codigo, preco_aluguel: i.preco_na_epoca })))
        
        setLoading(false)
      } else {
        const hoje = new Date().toISOString().split('T')[0]
        setDatas(prev => ({ ...prev, devolucao: calcularSugestaoDevolucao(hoje) }))
      }
    }
    carregar()
  }, [id, navigate])

  // --- FUNÇÕES AUXILIARES ---
  function calcularSugestaoDevolucao(dataRetiradaString) {
    if (!dataRetiradaString) return ''
    const data = new Date(dataRetiradaString + 'T12:00:00'); const dia = data.getDay()
    let add = 1; if (dia === 5) add = 3; if (dia === 6) add = 2
    data.setDate(data.getDate() + add); return data.toISOString().split('T')[0]
  }
  const handleMudancaRetirada = (e) => { const v = e.target.value; setDatas({ retirada: v, devolucao: calcularSugestaoDevolucao(v) }) }

  // --- VALIDAÇÕES ---
  function validarCPF(cpf) { 
    cpf = cpf.replace(/[^\d]+/g, ''); if (cpf === '') return true; if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
    let soma = 0, resto; for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i); resto = (soma * 10) % 11
    if ((resto === 10) || (resto === 11)) resto = 0; if (resto !== parseInt(cpf.substring(9, 10))) return false
    soma = 0; for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i); resto = (soma * 10) % 11
    if ((resto === 10) || (resto === 11)) resto = 0; if (resto !== parseInt(cpf.substring(10, 11))) return false; return true 
  }
  
  const handleBuscaCPF = (valor) => { 
    const v = valor.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1')
    setTermoBusca(v)
    // Marca visualmente se é inválido, mas NÃO impede a busca mais
    if (v.length === 14) setCpfInvalido(!validarCPF(v)); else setCpfInvalido(false)
  }
  
  const handleTelefone = (v) => { let tel = v.replace(/\D/g, "").replace(/^(\d\d)(\d)/g, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2"); if (tel.length <= 15) setDadosCliente({ ...dadosCliente, telefone: tel }) }

  // --- 2. BUSCA DE CLIENTE (CORRIGIDA) ---
  useEffect(() => {
    // Se digitou menos de 3 números ou está criando novo, não busca
    if (modoNovoCliente || termoBusca.length < 3) { setClienteEncontradoNaBusca(null); return }
    
    const delay = setTimeout(async () => {
      // Limpa para buscar só números no banco (caso o banco tenha salvo sem pontos)
      const cpfLimpo = termoBusca.replace(/\D/g, '')
      
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .or(`cpf.eq.${termoBusca},cpf.eq.${cpfLimpo}`) // Tenta achar com ou sem pontos
        .maybeSingle()
      
      setClienteEncontradoNaBusca(data || null)
    }, 300); 
    return () => clearTimeout(delay)
  }, [termoBusca, modoNovoCliente]) // Removido 'cpfInvalido' daqui para não travar a busca

  // --- 3. BUSCA DE PRODUTO (INTELIGENTE) ---
  useEffect(() => {
    if (!termoProduto) { setProdutosEncontrados([]); return }
    const delay = setTimeout(async () => {
      const termo = termoProduto.trim()
      let query = supabase.from('produtos').select('*').limit(10)

      // Se for só número, busca por Código. Se for letra, busca por Nome.
      if (/^\d+$/.test(termo)) {
         query = query.eq('codigo', parseInt(termo))
      } else {
         query = query.ilike('nome', `%${termo}%`)
      }

      const { data } = await query
      setProdutosEncontrados(data || [])
    }, 300); return () => clearTimeout(delay)
  }, [termoProduto])

  // --- AÇÕES DO FORMULÁRIO ---
  const selecionarCliente = () => { if (clienteEncontradoNaBusca) { setDadosCliente(clienteEncontradoNaBusca); setModoNovoCliente(false); setTermoBusca(''); setClienteEncontradoNaBusca(null) } }
  const ativarNovoCliente = () => { setModoNovoCliente(true); setClienteEncontradoNaBusca(null); setDadosCliente({ id: null, nome: '', cpf: termoBusca, telefone: '', rua: '', numero: '', bairro: '', cidade: '' }); setTermoBusca('') }
  
  const verificarDisponibilidadeEAdicionar = async (produto) => {
    if (!datas.retirada || !datas.devolucao) { alert("Datas primeiro!"); return }
    if (carrinho.find(i => i.id === produto.id)) return
    let q = supabase.from('itens_aluguel').select('alugueis!inner(id)').eq('produto_id', produto.id).in('alugueis.status', ['ativo', 'pendente']).lte('alugueis.data_retirada', datas.devolucao).gte('alugueis.data_devolucao', datas.retirada)
    if (id) q = q.neq('alugueis.id', id)
    const { data } = await q
    if (data?.length > 0) { alert(`❌ Item indisponível.`); return }
    setCarrinho([...carrinho, produto]); setTermoProduto(''); setProdutosEncontrados([])
  }

  const adicionarProdutoManual = () => {
    if (!produtoManual.nome || !produtoManual.preco) return
    setCarrinho([...carrinho, { id: `temp-${Date.now()}`, nome: produtoManual.nome, preco_aluguel: parseFloat(produtoManual.preco), isNovo: true }])
    setProdutoManual({ nome: '', preco: '' }); setModoProdutoManual(false)
  }

  const finalizarAluguel = async () => {
    // Validação flexível no salvamento
    if (dadosCliente.cpf && !validarCPF(dadosCliente.cpf)) { 
       // Se quiser travar CPF inválido, descomente: alert("CPF Inválido"); return 
    }
    if (!dadosCliente.nome || !carrinho.length || !datas.devolucao) { alert('Preencha obrigatórios'); return }
    setLoading(true)

    let cid = dadosCliente.id
    const cPayload = { nome: dadosCliente.nome, cpf: dadosCliente.cpf, telefone: dadosCliente.telefone, rua: dadosCliente.rua, numero: dadosCliente.numero, bairro: dadosCliente.bairro, cidade: dadosCliente.cidade, endereco: `${dadosCliente.rua}, ${dadosCliente.numero}` }
    
    if (!cid) { const { data } = await supabase.from('clientes').insert([cPayload]).select().single(); cid = data.id }
    else { await supabase.from('clientes').update(cPayload).eq('id', cid) }

    const itensFinais = []
    for (const item of carrinho) {
        if (item.isNovo) { const { data } = await supabase.from('produtos').insert([{ nome: item.nome, preco_aluguel: item.preco_aluguel, status: 'disponivel', codigo: 0 }]).select().single(); itensFinais.push(data) }
        else itensFinais.push(item)
    }

    const aluguelPayload = { cliente_id: cid, data_retirada: datas.retirada, data_devolucao: datas.devolucao, valor_total: total, valor_entrada: parseFloat(pagamento.entrada||0), metodo_pagamento: pagamento.metodo, anotacoes, status: modoEdicao ? statusAluguel : 'pendente' }
    
    let aid = id
    if (id) { await supabase.from('alugueis').update(aluguelPayload).eq('id', id); await supabase.from('itens_aluguel').delete().eq('aluguel_id', id) }
    else { const { data } = await supabase.from('alugueis').insert([aluguelPayload]).select().single(); aid = data.id }

    await supabase.from('itens_aluguel').insert(itensFinais.map(p => ({ aluguel_id: aid, produto_id: p.id, preco_na_epoca: p.preco_aluguel })))
    setLoading(false); navigate('/alugueis')
  }

  const total = carrinho.reduce((acc, i) => acc + (i.preco_aluguel || 0), 0)
  const valorRestante = total - parseFloat(pagamento.entrada || 0)
  const travadoIdentificacao = !!dadosCliente.id && !modoNovoCliente

  return {
    loading, modoEdicao, id, navigate,
    dadosCliente, setDadosCliente, termoBusca, handleBuscaCPF, clienteEncontradoNaBusca, ativarNovoCliente, selecionarCliente, modoNovoCliente, handleTelefone, travadoIdentificacao, setModoNovoCliente, setTermoBusca,
    datas, handleMudancaRetirada, setDatas,
    termoProduto, setTermoProduto, produtosEncontrados, verificarDisponibilidadeEAdicionar, carrinho, setCarrinho, modoProdutoManual, setModoProdutoManual, produtoManual, setProdutoManual, adicionarProdutoManual,
    anotacoes, setAnotacoes, pagamento, setPagamento,
    total, valorRestante, finalizarAluguel
  }
}