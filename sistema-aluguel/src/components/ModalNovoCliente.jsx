import { useState } from 'react'
import { supabase } from '../supabase'
import { X, Save, Loader2, User } from 'lucide-react'

export default function ModalNovoCliente({ onClose, onSave }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: ''
  })

  // Função simples para formatar CPF enquanto digita (000.000.000-00)
  const formatarCPF = (valor) => {
    return valor
      .replace(/\D/g, '') // Remove tudo o que não é dígito
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1') // Impede de digitar mais que o necessário
  }

  // Função para formatar Telefone ((00) 00000-0000)
  const formatarTelefone = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('clientes')
      .insert([formData])

    setLoading(false)

    if (error) {
      alert('Erro ao salvar: ' + error.message)
    } else {
      onSave()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in scale-100">
        
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <User size={20} className="text-green-400"/>
            Novo Cliente
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input
              type="text"
              required
              autoFocus
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Ex: Maria da Silva"
              value={formData.nome}
              onChange={e => setFormData({...formData, nome: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF (Opcional)</label>
            <input
              type="text"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={e => setFormData({...formData, cpf: formatarCPF(e.target.value)})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
            <input
              type="text"
              required
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={e => setFormData({...formData, telefone: formatarTelefone(e.target.value)})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-all font-medium flex items-center justify-center gap-2 mt-4 shadow-lg hover:shadow-xl active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Cadastrar Cliente
          </button>
        </form>
      </div>
    </div>
  )
}