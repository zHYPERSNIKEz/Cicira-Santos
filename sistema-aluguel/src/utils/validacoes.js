export const validarNome = (nome) => {
    if (!nome) return 'O nome não pode ficar vazio.'
    if (nome.length < 3) return 'O nome deve ter pelo menos 3 letras.'
    if (nome.trim().split(' ').length < 2) return 'Por favor, insira nome e sobrenome.'
    return null
}

// ATUALIZADO: Regra de "Mínimo 6 chars + 1 Número"
export const validarSenha = (senha) => {
    if (!senha) return 'A senha é obrigatória.'
    
    if (senha.length < 6) {
        return 'A senha deve ter no mínimo 6 caracteres.'
    }
    
    // Verifica se tem pelo menos um número (Regex simples)
    if (!/[0-9]/.test(senha)) {
        return 'A senha deve conter pelo menos um número.'
    }

    // Se quiser ser chato no futuro, descomente abaixo:
    /*
    if (!/[A-Z]/.test(senha)) return 'Precisa de uma letra maiúscula.';
    if (!/[!@#$%^&*]/.test(senha)) return 'Precisa de um caractere especial.';
    */

    return null
}