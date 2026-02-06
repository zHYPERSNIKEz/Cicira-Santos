import { useState } from 'react'
import Sidebar  from '../../components/Sidebar'
import { Save, ArrowLeft, Menu, Tag, Shirt, DollarSign } from 'lucide-react'
import { useEstoqueForm } from '../../hooks/useEstoqueForm'

export default function FormularioEstoque() {
  const [menuAberto, setMenuAberto] = useState(false)

  const { 
    loading, 
    modoEdicao, 
    formData, 
    setFormData, 
    salvarProduto, 
    navigate 
  } = useEstoqueForm()

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-0">
      <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />

      <main className="p-4 md:p-8 md:ml-64 transition-all">
        <div className="md:hidden flex items-center justify-between mb-4 sticky top-0 z-20 bg-gray-50 py-2">
            <button onClick={() => setMenuAberto(true)} className="p-2 bg-white rounded shadow text-gray-700"><Menu size={24}/></button>
            <span className="font-bold text-gray-700">Estoque</span><div className="w-8"></div>
        </div>

        <div className="max-w-3xl mx-auto">
            <header className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/estoque')} className="p-2 bg-white rounded-lg shadow hover:bg-gray-100"><ArrowLeft size={20}/></button>
                <h2 className="text-2xl font-bold text-gray-800">{modoEdicao ? 'Editar Peça' : 'Nova Peça'}</h2>
            </header>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
                
                {/* 1. Identificação */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2"><Tag size={18}/> Identificação</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-3">
                            <label className="text-xs font-bold text-gray-500">CÓDIGO (AUTO)</label>
                            
                            {/* CORREÇÃO AQUI: Scroll travado e Mínimo 1 */}
                            <input 
                                type="number"
                                min="1"
                                placeholder="Gerando..."
                                className="w-full p-3 border rounded-lg font-mono bg-blue-50/50 border-blue-200 focus:bg-white transition-colors"
                                value={formData.codigo || ''}
                                onChange={e => setFormData({...formData, codigo: e.target.value})}
                                onWheel={(e) => e.target.blur()} // Trava o scroll do mouse
                            />
                            
                            <p className="text-[10px] text-gray-400 mt-1">Sugerimos o próximo livre.</p>
                        </div>
                        <div className="lg:col-span-9">
                            <label className="text-xs font-bold text-gray-500">NOME DA PEÇA</label>
                            <input 
                                type="text" 
                                placeholder="Ex: Vestido Longo Azul Serenity"
                                className="w-full p-3 border rounded-lg"
                                value={formData.nome || ''}
                                onChange={e => setFormData({...formData, nome: e.target.value})}
                                autoFocus={!modoEdicao} 
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Detalhes */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2"><Shirt size={18}/> Detalhes</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500">CATEGORIA</label>
                            <select 
                                className="w-full p-3 border rounded-lg bg-white"
                                value={formData.categoria}
                                onChange={e => setFormData({...formData, categoria: e.target.value})}
                            >
                                <option>Vestido</option>
                                <option>Terno</option>
                                <option>Infantil</option>
                                <option>Acessório</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">TAMANHO</label>
                            <input 
                                type="text" placeholder="P, M, G..."
                                className="w-full p-3 border rounded-lg"
                                value={formData.tamanho}
                                onChange={e => setFormData({...formData, tamanho: e.target.value})}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500">COR</label>
                            <input 
                                type="text" placeholder="Ex: Azul Bebê"
                                className="w-full p-3 border rounded-lg"
                                value={formData.cor}
                                onChange={e => setFormData({...formData, cor: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Financeiro & Status */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2"><DollarSign size={18}/> Aluguel & Status</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500">VALOR DO ALUGUEL (R$)</label>
                            <input 
                                type="number" 
                                min="0"
                                className="w-full p-3 border rounded-lg font-bold text-lg text-blue-600"
                                value={formData.preco_aluguel}
                                onChange={e => setFormData({...formData, preco_aluguel: e.target.value})}
                                onWheel={(e) => e.target.blur()} // Trava scroll também no preço
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">SITUAÇÃO ATUAL</label>
                            <select 
                                className={`w-full p-3 border rounded-lg font-bold ${
                                    formData.status === 'disponivel' ? 'text-green-600 bg-green-50' :
                                    formData.status === 'manutencao' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'
                                }`}
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="disponivel">🟢 Disponível</option>
                                <option value="manutencao">🔴 Manutenção</option>
                                <option value="alugado">🔵 Alugado</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button onClick={() => navigate('/estoque')} className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-bold">Cancelar</button>
                    <button 
                        onClick={salvarProduto}
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2"
                    >
                       {loading ? 'Salvando...' : <><Save size={20}/> Salvar Peça</>}
                    </button>
                </div>

            </div>
        </div>
      </main>
    </div>
  )
}