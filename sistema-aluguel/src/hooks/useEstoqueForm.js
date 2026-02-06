import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'

export function useEstoqueForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const modoEdicao = !!id

  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '', 
    tamanho: '',
    cor: '',
    preco_aluguel: '',
    status: 'disponivel',
    categoria: 'Vestido'
  })

  useEffect(() => {
    if (modoEdicao) {
      buscarProdutoExistente()
    } else {
      gerarSugestaoDeCodigo()
    }
  }, [id])

  async function buscarProdutoExistente() {
    setLoading(true)
    const { data, error } = await supabase.from('produtos').select('*').eq('id', id).single()
    if (error) { alert('Erro ao carregar'); navigate('/estoque') }
    else { setFormData(data) }
    setLoading(false)
  }

  // --- AQUI ESTÁ A MÁGICA QUE CONSERTAMOS ---
  async function gerarSugestaoDeCodigo() {
    setLoading(true)
    
    // 1. Busca o maior código que existe no banco
    const { data } = await supabase
      .from('produtos')
      .select('codigo')
      .not('codigo', 'is', null) // Ignora se tiver algum nulo
      .order('codigo', { ascending: false }) // Pega do maior pro menor
      .limit(1) // Só quero o maior de todos
      .maybeSingle()

    // 2. Se achou (ex: 150), soma +1. Se não achou nada (banco vazio), começa do 1.
    const ultimoCodigo = data?.codigo ? parseInt(data.codigo) : 0
    const proximoCodigo = ultimoCodigo + 1
    
    // 3. Joga esse valor no formulário
    setFormData(prev => ({ ...prev, codigo: proximoCodigo }))
    setLoading(false)
  }

  async function salvarProduto() {
    if (!formData.nome || !formData.preco_aluguel) {
      alert('Preencha Nome e Preço!')
      return
    }

    setLoading(true)
    const codigoFinal = formData.codigo ? parseInt(formData.codigo) : null

    // Verifica duplicidade antes de salvar
    if (codigoFinal) {
        let query = supabase.from('produtos').select('id').eq('codigo', codigoFinal)
        if (modoEdicao) query = query.neq('id', id) 
        
        const { data: conflito } = await query.maybeSingle()
        
        if (conflito) {
            alert(`Erro: O código ${codigoFinal} já existe! Tente o ${codigoFinal + 1}.`)
            setLoading(false)
            return
        }
    }

    const payload = { ...formData, codigo: codigoFinal, preco_aluguel: parseFloat(formData.preco_aluguel) }

    let error
    if (modoEdicao) {
      const { error: err } = await supabase.from('produtos').update(payload).eq('id', id)
      error = err
    } else {
      const { error: err } = await supabase.from('produtos').insert([payload])
      error = err
    }

    setLoading(false)
    if (error) alert('Erro ao salvar: ' + error.message)
    else navigate('/estoque')
  }

  return { loading, modoEdicao, formData, setFormData, salvarProduto, navigate }
}