import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import { LayoutDashboard, ShoppingBag, Users, Shirt, LogOut, X } from 'lucide-react'

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Aluguéis', icon: ShoppingBag, path: '/alugueis' },
    { name: 'Clientes', icon: Users, path: '/clientes' },
    { name: 'Estoque', icon: Shirt, path: '/estoque' },
  ]

  return (
    <>
      {/* Overlay Escuro (Mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white 
          transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Aluguel Sys
          </h1>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Rodapé: Sair + Versão */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 text-red-400 hover:bg-red-900/20 w-full rounded-lg transition-colors mb-4"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>

          {/* Versão do Sistema */}
          <div className="text-center">
            <p className="text-xs text-slate-600 font-mono">v1.2.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}