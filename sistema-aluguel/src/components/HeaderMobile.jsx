import { Menu } from 'lucide-react'

export default function HeaderMobile({ titulo, aoAbrir }) {
  return (
    <div className="md:hidden flex items-center justify-between mb-6 sticky top-0 z-30 bg-gray-50 py-2">
      <button 
        onClick={aoAbrir} 
        className="p-2 bg-white rounded-lg shadow-sm text-gray-700 active:scale-95 transition-transform hover:bg-gray-50"
      >
        <Menu size={24}/>
      </button>
      <span className="font-bold text-gray-700 text-lg">{titulo}</span>
      <div className="w-10"></div> {/* Espaço vazio para centralizar o título */}
    </div>
  )
}