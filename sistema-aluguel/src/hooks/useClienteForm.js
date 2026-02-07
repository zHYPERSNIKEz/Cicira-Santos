import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'

export function useClienteForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const modoEdicao = !!id
  const [loading, setLoading] = useState(false)
  const [errorCPF, setErrorCPF] = useState(null) // Novo estado para erro de CPF

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: ''
  })

  // Se for edição, busca os dados do cliente no banco
  useEffect(() => {
    if (modoEdicao) {
      async function buscar() {
        setLoading(true)
        const { data, error } = await supabase.from('clientes').select('*').eq('id', id).single()
        if (error) { 
            console.error(error)
            alert('Erro ao carregar cliente')
            navigate('/clientes') 
        } else { 
            setFormData(data) 
        }
        setLoading(false)
      }
      buscar()
    }
  }, [id, navigate, modoEdicao])

  // Máscara de CPF (000.000.000-00)
  const handleCPF = (v) => {
    v = v.replace(/\D/g, '').slice(0, 11)
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d{1,2})/, '$1-$2')
    setFormData(prev => ({ ...prev, cpf: v }))
    setErrorCPF(null) // Limpa o erro ao digitar
  }

  // Validação de unicidade do CPF (função separada para reuso)
  const validarCpfUnico = async () => {
    setErrorCPF(null) // Limpa erros anteriores
    if (!formData.cpf) return true // Se o CPF estiver vazio, não valida unicidade

    setLoading(true) // Ativar loading para a validação
    let query = supabase.from('clientes').select('id').eq('cpf', formData.cpf)
    
    if (modoEdicao) {
      query = query.neq('id', id) // Excluir o próprio cliente da verificação na edição
    }
    
    const { data, error } = await query.single() // Usar single para esperar um único resultado ou null/error
    setLoading(false) // Desativar loading após a validação

    if (error && error.code !== 'PGRST116') { // PGRST116 significa "nenhuma linha encontrada", o que é ok
      console.error('Erro ao verificar CPF:', error)
      setErrorCPF('Erro ao verificar CPF: ' + error.message)
      return false
    }

    if (data) { // Se data não é null, significa que o CPF já existe
      setErrorCPF('Este CPF já está cadastrado para outro cliente.')
      return false
    }
    return true // CPF é único
  }

  // Máscara de Telefone (00) 00000-0000
  const handleTelefone = (v) => {
    v = v.replace(/\D/g, '').slice(0, 11)
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2')
    v = v.replace(/(\d{5})(\d)/, '$1-$2')
    setFormData(prev => ({ ...prev, telefone: v }))
  }

  // Função de Salvar
  const salvarCliente = async () => {
    setErrorCPF(null) // Limpa erros anteriores

    if (!formData.nome) { alert('Nome é obrigatório!'); return }
    
    // Chama a validação de unicidade antes de salvar
    const isCpfUnique = await validarCpfUnico()
    if (!isCpfUnique) return // Se o CPF não for único, impede o salvamento

    setLoading(true)
    // Cria o campo "endereco" juntando rua e número para compatibilidade
    const payload = { ...formData, endereco: `${formData.rua}, ${formData.numero}` }

    let error
    if (modoEdicao) {
      const { error: err } = await supabase.from('clientes').update(payload).eq('id', id)
      error = err
    } else {
      const { error: err } = await supabase.from('clientes').insert([payload])
      error = err
    }

    setLoading(false)
    if (error) alert('Erro ao salvar: ' + error.message)
    else navigate('/clientes')
  }

  return { loading, modoEdicao, formData, setFormData, handleCPF, handleTelefone, salvarCliente, navigate, errorCPF }
}