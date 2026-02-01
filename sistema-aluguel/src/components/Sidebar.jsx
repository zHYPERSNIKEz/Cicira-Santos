import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import { LayoutDashboard, ShoppingBag, Users, Shirt, LogOut } from 'lucide-react'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Aluguéis', icon: ShoppingBag, path: '/alugueis' }, // Criaremos depois
    { name: 'Clientes', icon: Users, path: '/clientes' },       // Criaremos depois
    { name: 'Estoque', icon: Shirt, path: '/estoque' },         // Criaremos depois
  ]

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Aluguel Sys
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
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

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3 text-red-400 hover:bg-red-900/20 w-full rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}