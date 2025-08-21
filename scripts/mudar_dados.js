document.addEventListener('DOMContentLoaded', () => {
    const updateForm = document.getElementById('update-form');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');

    // Dados mockados de usuários (mesma lista do index.js)
    // Em uma aplicação real, isso viria de um backend
    const mockUsers = [
        { email: 'teste@email.com', senha: '123' },
        { email: 'cicira@santos.com', senha: 'senhaforte' },
        { email: 'admin@admin.com', senha: 'admin' }
    ];

    // Pega o email do usuário logado do sessionStorage
    const loggedInUserEmail = sessionStorage.getItem('loggedInUser');

    if (loggedInUserEmail) {
        // Encontra o usuário na lista
        const user = mockUsers.find(u => u.email === loggedInUserEmail);

        if (user) {
            // Preenche o campo de email com o email atual
            emailInput.value = user.email;
        } else {
            errorMessage.textContent = 'Usuário não encontrado!';
        }
    } else {
        // Redireciona para a página de login se não houver usuário logado
        window.location.href = '../index.html';
    }

    updateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        successMessage.textContent = '';
        errorMessage.textContent = '';

        const newEmail = emailInput.value;
        const newSenha = senhaInput.value;

        const loggedInUserEmail = sessionStorage.getItem('loggedInUser');
        const userIndex = mockUsers.findIndex(u => u.email === loggedInUserEmail);

        if (userIndex !== -1) {
            // Atualiza o email
            mockUsers[userIndex].email = newEmail;
            sessionStorage.setItem('loggedInUser', newEmail); // Atualiza o sessionStorage

            // Atualiza a senha apenas se um novo valor for fornecido
            if (newSenha) {
                mockUsers[userIndex].senha = newSenha;
            }

            successMessage.textContent = 'Dados alterados com sucesso!';
            
            // Limpa o campo da senha para segurança
            senhaInput.value = '';

        } else {
            errorMessage.textContent = 'Ocorreu um erro ao atualizar os dados.';
        }
    });
});