import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import HeaderMobile from '../components/HeaderMobile'
import ModalRecorte from '../components/ModalRecorte'
import { usePerfil } from '../hooks/usePerfil'
import { User, Lock, Save, ShieldCheck, AlertCircle, Camera } from 'lucide-react'

export default function Perfil() {
  const [menuAberto, setMenuAberto] = useState(false)
  const { user, loading, feedback, salvarPerfil } = usePerfil()

  const [nomeInput, setNomeInput] = useState('')
  const [senhaInput, setSenhaInput] = useState('')
  
  // Estados para a foto
  const [imagemParaRecortar, setImagemParaRecortar] = useState(null)
  const [modalRecorteAberto, setModalRecorteAberto] = useState(false)
  const [previewFoto, setPreviewFoto] = useState(null) // Para mostrar na tela antes de salvar
  const [arquivoFotoParaEnviar, setArquivoFotoParaEnviar] = useState(null) // O arquivo real (blob)
  
  const fileInputRef = useRef(null)

  // Carrega dados iniciais
  useEffect(() => {
    if (user?.user_metadata?.display_name) {
      setNomeInput(user.user_metadata.display_name)
    }
  }, [user])

  // 1. Selecionou arquivo -> Abre Modal
  const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
            alert('Apenas imagens são permitidas.');
            return;
        }
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImagemParaRecortar(reader.result?.toString() || null);
            setModalRecorteAberto(true);
        });
        reader.readAsDataURL(file);
        event.target.value = '' 
      }
  };

  // 2. Confirmou Recorte -> Salva no Preview (NÃO envia pro Supabase ainda)
  const handleSalvarRecorte = (blobCortado) => {
      setModalRecorteAberto(false);
      
      // Cria uma URL temporária só pra mostrar na tela
      const urlPreview = URL.createObjectURL(blobCortado);
      setPreviewFoto(urlPreview);
      
      // Guarda o arquivo para enviar depois
      setArquivoFotoParaEnviar(blobCortado);
  };

  // 3. Clicou em Salvar Geral -> Envia tudo
  const handleSalvarGeral = () => {
      // Passa o arquivo novo (se tiver) para o hook
      salvarPerfil(nomeInput, senhaInput, arquivoFotoParaEnviar);
      
      // Limpa senha após salvar (UX)
      if (senhaInput) setSenhaInput('');
  }

  // Lógica de qual imagem mostrar: Preview Novo > Imagem do Banco > Inicial do Nome
  const avatarUrl = user?.user_metadata?.avatar_url;
  const inicialNome = user?.user_metadata?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase();
  
  const imagemParaMostrar = previewFoto || avatarUrl;

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-0">
      <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />
      
      {modalRecorteAberto && imagemParaRecortar && (
          <ModalRecorte 
            imagem={imagemParaRecortar}
            aoFechar={() => setModalRecorteAberto(false)}
            aoSalvar={handleSalvarRecorte}
          />
      )}

      <main className="p-4 md:p-8 md:ml-64 transition-all">
        <HeaderMobile titulo="Meu Perfil" aoAbrir={() => setMenuAberto(true)} />

        <div className="max-w-2xl mx-auto">
             <header className="mb-8 hidden md:block">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <User className="text-blue-600"/> Meu Perfil
                </h2>
                <p className="text-gray-500">Edite suas informações e clique em salvar.</p>
            </header>

            {feedback.texto && (
                <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 border shadow-sm animate-fade-in ${
                    feedback.tipo === 'erro' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
                }`}>
                    {feedback.tipo === 'erro' ? <AlertCircle className="shrink-0 mt-0.5" size={20}/> : <ShieldCheck className="shrink-0 mt-0.5" size={20}/>}
                    <div>
                        <h4 className="font-bold text-sm">{feedback.tipo === 'erro' ? 'Atenção' : 'Sucesso'}</h4>
                        <p className="text-sm">{feedback.texto}</p>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    
                    {/* FOTO */}
                    <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-100">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                            <div className="w-24 h-24 rounded-full border-4 border-blue-100 overflow-hidden bg-blue-50 flex items-center justify-center relative shadow-inner">
                                {imagemParaMostrar ? (
                                    <img src={imagemParaMostrar} alt="Perfil" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-blue-300">{inicialNome}</span>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={24}/>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 font-bold">
                            {previewFoto ? 'Foto selecionada (Clique em Salvar)' : 'Alterar foto'}
                        </p>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>

                    {/* FORMULÁRIO */}
                    <div className="grid gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-400 mb-1 block uppercase">Email</label>
                            <input disabled value={user?.email || '...'} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed select-none" />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block uppercase">Seu Nome</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                                <input 
                                    value={nomeInput} 
                                    onChange={e => setNomeInput(e.target.value)}
                                    className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:border-blue-500 outline-none transition-colors font-medium text-gray-800" 
                                    placeholder="Nome e Sobrenome"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block uppercase flex justify-between">
                                Nova Senha
                                <span className="text-gray-400 font-normal normal-case italic">Opcional</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                                <input 
                                    type="password"
                                    value={senhaInput} 
                                    onChange={e => setSenhaInput(e.target.value)}
                                    className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:border-blue-500 outline-none transition-colors" 
                                    placeholder="Deixe vazio para manter a atual"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTÃO SALVAR */}
                <div className="flex justify-end">
                    <button 
                        onClick={handleSalvarGeral}
                        disabled={loading}
                        className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10 active:scale-95 transition-all disabled:opacity-70"
                    >
                        {loading ? 'Processando...' : <><Save size={20}/> Salvar Alterações</>}
                    </button>
                </div>

            </div>
        </div>
      </main>
    </div>
  )
}