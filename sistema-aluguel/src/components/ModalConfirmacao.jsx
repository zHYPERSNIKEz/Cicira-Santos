import { AlertTriangle, CheckCircle, X } from 'lucide-react'

export default function ModalConfirmacao({ 
  isOpen, 
  onClose, 
  onConfirm, 
  titulo, 
  mensagem,
  textoBotao = "Sim, Excluir", // Padrão se não for informado
  corBotao = "bg-red-600 hover:bg-red-700", // Padrão se não for informado
  tipo = "perigo" // Padrão se não for informado
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative flex flex-col items-center text-center">
        
        {/* Botão Fechar (X) */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X size={20}/>
        </button>

        {/* Ícone Dinâmico (Muda se for Sucesso ou Perigo) */}
        <div className={`mb-4 p-4 rounded-full ${tipo === 'sucesso' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
            {tipo === 'sucesso' ? <CheckCircle size={40} /> : <AlertTriangle size={40} />}
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">{titulo}</h3>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            {mensagem}
        </p>

        <div className="flex gap-3 w-full">
            <button 
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
                Cancelar
            </button>
            <button 
                onClick={onConfirm}
                className={`flex-1 py-3 px-4 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95 ${corBotao}`}
            >
                {textoBotao}
            </button>
        </div>

      </div>
    </div>
  )
}