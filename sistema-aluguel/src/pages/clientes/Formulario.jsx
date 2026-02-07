import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { Save, ArrowLeft, User, MapPin, Menu } from 'lucide-react'
// Importa a lógica que criamos no passo 1
import { useClienteForm } from '../../hooks/useClienteForm'

export default function FormularioCliente() {
  const [menuAberto, setMenuAberto] = useState(false)
  
  // Usa o Hook para controlar os dados
  const { 
    loading, modoEdicao, formData, setFormData, 
    handleCPF, handleTelefone, salvarCliente, navigate,
    errorCPF, validarCpfUnico // Adicionado validarCpfUnico
  } = useClienteForm()

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-0">
      <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />

      <main className="p-4 md:p-8 md:ml-64 transition-all">
        {/* Header Mobile */}
        <div className="md:hidden flex items-center justify-between mb-4 sticky top-0 z-20 bg-gray-50 py-2">
            <button onClick={() => setMenuAberto(true)} className="p-2 bg-white rounded shadow text-gray-700"><Menu size={24}/></button>
            <span className="font-bold text-gray-700">Clientes</span><div className="w-8"></div>
        </div>

        <div className="max-w-4xl mx-auto">
            <header className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/clientes')} className="p-2 bg-white rounded-lg shadow hover:bg-gray-100"><ArrowLeft size={20}/></button>
                <h2 className="text-2xl font-bold text-gray-800">{modoEdicao ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            </header>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
                
                {/* 1. Dados Pessoais */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2"><User size={18}/> Dados Pessoais</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-6">
                            <label className="text-xs font-bold text-gray-500">NOME COMPLETO</label>
                            <input 
                                className="w-full p-3 border rounded-lg" placeholder="Ex: Maria Silva"
                                value={formData.nome || ''} onChange={e => setFormData({...formData, nome: e.target.value})}
                            />
                        </div>
                        <div className="lg:col-span-3">
                            <label className="text-xs font-bold text-gray-500">CPF</label>
                            <input 
                                className={`w-full p-3 border rounded-lg ${errorCPF ? 'border-red-500' : ''} font-mono`} placeholder="000.000.000-00"
                                value={formData.cpf || ''}
                                onChange={e => handleCPF(e.target.value)}
                                onBlur={() => validarCpfUnico()} // Chamada no onBlur
                            />
                            {errorCPF && <p className="text-red-500 text-xs mt-1">{errorCPF}</p>}
                        </div>
                        <div className="lg:col-span-3">
                            <label className="text-xs font-bold text-gray-500">TELEFONE</label>
                            <input 
                                className="w-full p-3 border rounded-lg" placeholder="(00) 00000-0000"
                                value={formData.telefone || ''} onChange={e => handleTelefone(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Endereço */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2"><MapPin size={18}/> Endereço</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-9">
                            <label className="text-xs font-bold text-gray-500">RUA / AVENIDA</label>
                            <input 
                                className="w-full p-3 border rounded-lg" placeholder="Rua das Flores"
                                value={formData.rua || ''} onChange={e => setFormData({...formData, rua: e.target.value})}
                            />
                        </div>
                        <div className="lg:col-span-3">
                            <label className="text-xs font-bold text-gray-500">NÚMERO</label>
                            <input 
                                className="w-full p-3 border rounded-lg" placeholder="123"
                                value={formData.numero || ''} onChange={e => setFormData({...formData, numero: e.target.value})}
                            />
                        </div>
                        <div className="lg:col-span-6">
                            <label className="text-xs font-bold text-gray-500">BAIRRO</label>
                            <input 
                                className="w-full p-3 border rounded-lg"
                                value={formData.bairro || ''} onChange={e => setFormData({...formData, bairro: e.target.value})}
                            />
                        </div>
                        <div className="lg:col-span-6">
                            <label className="text-xs font-bold text-gray-500">CIDADE</label>
                            <input 
                                className="w-full p-3 border rounded-lg"
                                value={formData.cidade || ''} onChange={e => setFormData({...formData, cidade: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button onClick={() => navigate('/clientes')} className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-bold">Cancelar</button>
                    <button onClick={salvarCliente} disabled={loading} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2">
                       {loading ? 'Salvando...' : <><Save size={20}/> Salvar Cliente</>}
                    </button>
                </div>

            </div>
        </div>
      </main>
    </div>
  )
}