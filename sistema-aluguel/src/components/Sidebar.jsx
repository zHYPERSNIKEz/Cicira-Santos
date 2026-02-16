import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import { 
  User, LayoutDashboard, ShoppingBag, Users, Shirt, 
  LogOut, X, DollarSign, ChevronDown, Settings 
} from 'lucide-react'

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false)
  const menuRef = useRef(null)

  const [nomeUsuario, setNomeUsuario] = useState('Carregando...')
  const [avatarUrl, setAvatarUrl] = useState(null)
  // Estado extra para forçar atualização da imagem se a URL for a mesma
  const [timestamp, setTimestamp] = useState(Date.now()) 

  // Função isolada para buscar o usuário
  async function carregarDadosUsuario() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const nome = user.user_metadata?.display_name 
      const urlFoto = user.user_metadata?.avatar_url
      
      setNomeUsuario(nome || 'Usuário')
      setAvatarUrl(urlFoto)
      setTimestamp(Date.now()) // Força o react a redesenhar a imagem
    }
  }

  useEffect(() => {
    // 1. Carrega na primeira vez
    carregarDadosUsuario()

    // 2. Cria o ouvinte do evento
    const handleAtualizacao = () => {
        carregarDadosUsuario();
    }

    // 3. Registra o ouvinte
    window.addEventListener('perfil_atualizado', handleAtualizacao);

    // 4. Clique fora fecha o menu dropdown
    function handleClickOutside(event) {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setMenuPerfilAberto(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);

    // 5. Limpeza (importante para não travar a memória)
    return () => {
        window.removeEventListener('perfil_atualizado', handleAtualizacao);
        document.removeEventListener("mousedown", handleClickOutside);
    }

  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Aluguéis', icon: ShoppingBag, path: '/alugueis' },
    { name: 'Clientes', icon: Users, path: '/clientes' },
    { name: 'Estoque', icon: Shirt, path: '/estoque' },
    { name: 'Financeiro', icon: DollarSign, path: '/financeiro' }
  ]

  const inicialNome = nomeUsuario.charAt(0).toUpperCase();

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}

      <aside 
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white 
          transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 
        `}
      >
        <div className="p-6 flex justify-between items-center shrink-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Aluguel Sys
          </h1>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* ÁREA DO PERFIL */}
        <div className="px-4 pb-4 relative shrink-0 z-20" ref={menuRef}>
            <button 
                onClick={() => setMenuPerfilAberto(!menuPerfilAberto)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${menuPerfilAberto ? 'bg-slate-800 border-slate-700' : 'hover:bg-slate-800 border-transparent hover:border-slate-700'}`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-full bg-blue-900 flex items-center justify-center text-blue-200 font-bold border border-blue-700 shrink-0 overflow-hidden">
                        {avatarUrl ? (
                            // Usamos key={timestamp} para forçar a imagem a piscar/recarregar se mudar
                            <img key={timestamp} src={avatarUrl} alt={nomeUsuario} className="w-full h-full object-cover" />
                        ) : (
                            <span>{inicialNome}</span>
                        )}
                    </div>
                    <span className="font-bold truncate text-sm">{nomeUsuario}</span>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${menuPerfilAberto ? 'rotate-180' : ''}`}/>
            </button>

            {menuPerfilAberto && (
                <div className="absolute left-4 right-4 top-full mt-2 bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden animate-fade-in-down">
                    <button
                        onClick={() => { navigate('/perfil'); setMenuPerfilAberto(false); onClose && onClose(); }}
                        className="flex items-center gap-3 p-3 hover:bg-slate-700 w-full text-left text-sm transition-colors text-slate-300 hover:text-white border-b border-slate-700/50"
                    >
                        <Settings size={18} />
                        <span>Configurações do Perfil</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-3 hover:bg-red-900/20 w-full text-left text-sm transition-colors text-red-400 hover:text-red-300"
                    >
                        <LogOut size={18} />
                        <span>Sair do Sistema</span>
                    </button>
                </div>
            )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto border-t border-slate-800 pt-6">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="text-center">
            <p className="text-[10px] text-slate-700 font-mono">v1.4.1 - Auto Update</p>
          </div>
        </div>

      </aside>
    </>
  )
}