import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { validarNome, validarSenha } from '../utils/validacoes'
import { comprimirImagem } from '../utils/compressor'

export function usePerfil() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [feedback, setFeedback] = useState({ tipo: '', texto: '' })

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  function limparFeedback() {
    setFeedback({ tipo: '', texto: '' })
  }

  async function salvarPerfil(nome, senha, arquivoFotoNovo) {
    limparFeedback()
    setLoading(true)

    // Validações...
    const erroNome = validarNome(nome)
    if (erroNome) {
        setFeedback({ tipo: 'erro', texto: erroNome })
        setLoading(false)
        return
    }

    if (senha && senha.trim() !== '') {
        const erroSenha = validarSenha(senha)
        if (erroSenha) {
            setFeedback({ tipo: 'erro', texto: erroSenha })
            setLoading(false)
            return
        }
    }

    try {
        let avatarUrlFinal = user.user_metadata?.avatar_url;

        // Upload da Foto
        if (arquivoFotoNovo) {
            const imagemComprimida = await comprimirImagem(arquivoFotoNovo);
            const nomeArquivo = `${user.id}/avatar.jpg?t=${Date.now()}`; // Timestamp para evitar cache

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(`${user.id}/avatar.jpg`, imagemComprimida, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(`${user.id}/avatar.jpg`);
            
            avatarUrlFinal = `${publicUrl}?t=${Date.now()}`;
        }

        // Monta Payload
        const payload = {
            data: { 
                display_name: nome,
                avatar_url: avatarUrlFinal
            }
        }

        if (senha && senha.trim() !== '') {
            payload.password = senha
        }

        // Atualiza Usuário
        const { error: updateError } = await supabase.auth.updateUser(payload)

        if (updateError) throw updateError;

        setFeedback({ tipo: 'sucesso', texto: 'Perfil salvo com sucesso!' })
        
        // Atualiza estado local do hook
        setUser(prev => ({ 
            ...prev, 
            user_metadata: { 
                ...prev.user_metadata, 
                display_name: nome,
                avatar_url: avatarUrlFinal 
            } 
        }))

        // --- AQUI ESTÁ A MÁGICA ---
        // Dispara um evento global avisando que o perfil mudou
        window.dispatchEvent(new Event('perfil_atualizado'));
        // --------------------------

    } catch (error) {
        console.error(error)
        setFeedback({ tipo: 'erro', texto: 'Erro ao salvar: ' + error.message })
    } finally {
        setLoading(false)
    }
  }

  return { user, loading, feedback, salvarPerfil, limparFeedback }
}