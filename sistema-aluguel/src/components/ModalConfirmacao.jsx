// src/components/ModalConfirmacao.jsx
import { AlertTriangle, X } from 'lucide-react'

export default function ModalConfirmacao({ isOpen, onClose, onConfirm, titulo, mensagem }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden scale-100 transition-transform">
        
        {/* Cabeçalho de Perigo */}
        <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
            <div className="bg-red-100 p-3 rounded-full mb-3">
                <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">{titulo || 'Tem certeza?'}</h3>
            <p className="text-gray-600 mt-2 text-sm">{mensagem || 'Essa ação não pode ser desfeita.'}</p>
        </div>

        {/* Botões */}
        <div className="p-4 flex gap-3 bg-gray-50">
            <button 
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={() => { onConfirm(); onClose() }}
                className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md transition-colors"
            >
                Sim, Excluir
            </button>
        </div>
      </div>
    </div>
  )
}