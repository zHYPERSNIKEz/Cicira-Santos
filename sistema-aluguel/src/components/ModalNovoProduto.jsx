import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { X, Save, Loader2, Tag } from 'lucide-react'

export default function ModalNovoProduto({ onClose, onSave }) {
  const [loading, setLoading] = useState(false)
  const [proximoCodigo, setProximoCodigo] = useState('...') // Começa com ...
  const [formData, setFormData] = useState({
    nome: '',
    tamanho: '',
    cor: '',
    preco_aluguel: ''
  })

  // Assim que a janela abre, buscamos qual será o próximo número
  useEffect(() => {
    async function descobrirProximoCodigo() {
      // Busca o produto com o MAIOR código que existe hoje
      const { data, error } = await supabase
        .from('produtos')
        .select('codigo')
        .order('codigo', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Erro ao buscar código', error)
        setProximoCodigo('001') // Se der erro, sugerimos o 1
      } else {
        // Se tem produtos, pega o último + 1. Se não tem, é o 1.
        const ultimoCodigo = data.length > 0 ? data[0].codigo : 0
        const proximo = ultimoCodigo + 1
        // Formata para ficar bonito (ex: 5 vira 005)
        setProximoCodigo(proximo.toString().padStart(3, '0'))
      }
    }

    descobrirProximoCodigo()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    // Convertemos o texto "#050" de volta para número 50
    const codigoParaSalvar = parseInt(proximoCodigo)

    const { error } = await supabase
      .from('produtos')
      .insert([
        {
          nome: formData.nome,
          codigo: codigoParaSalvar, // Forçamos o salvamento deste número exato
          tamanho: formData.tamanho,
          cor: formData.cor,
          preco_aluguel: parseFloat(formData.preco_aluguel),
          status: 'disponivel'
        }
      ])

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
        
        {/* Cabeçalho */}
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Tag size={20} className="text-blue-400"/>
            Novo Item
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* CAMPO DO CÓDIGO AUTOMÁTICO */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">
                Etiqueta da Roupa
              </label>
              <p className="text-blue-600 text-xs">Escreva este número na etiqueta física.</p>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">#</span>
              <input
                type="text"
                disabled // ISSO BLOQUEIA A EDIÇÃO
                value={proximoCodigo}
                className="w-24 pl-7 py-2 bg-white border-2 border-blue-200 rounded-lg text-xl font-black text-slate-800 text-center shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome / Descrição</label>
            <input
              type="text"
              required
              autoFocus
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ex: Vestido Longo Azul..."
              value={formData.nome}
              onChange={e => setFormData({...formData, nome: e.target.value})}
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho</label>
              <select 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.tamanho}
                onChange={e => setFormData({...formData, tamanho: e.target.value})}
              >
                <option value="">Selecione</option>
                <option value="PP">PP</option>
                <option value="P">P</option>
                <option value="M">M</option>
                <option value="G">G</option>
                <option value="GG">GG</option>
                <option value="XG">XG</option>
                <option value="UNICO">Único</option>
                <option value="36">36</option>
                <option value="38">38</option>
                <option value="40">40</option>
                <option value="42">42</option>
                <option value="44">44</option>
                <option value="46">46</option>
                <option value="48">48</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
              <input
                type="text"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Azul Royal"
                value={formData.cor}
                onChange={e => setFormData({...formData, cor: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço do Aluguel</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 font-medium">R$</span>
              <input
                type="number"
                required
                step="0.01"
                className="pl-10 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-lg"
                placeholder="0.00"
                value={formData.preco_aluguel}
                onChange={e => setFormData({...formData, preco_aluguel: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || proximoCodigo === '...'}
            className="w-full bg-slate-900 text-white py-3.5 rounded-lg hover:bg-slate-800 transition-all font-medium flex items-center justify-center gap-2 mt-4 shadow-lg hover:shadow-xl transform active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Salvar e Confirmar Etiqueta
          </button>
        </form>
      </div>
    </div>
  )
}