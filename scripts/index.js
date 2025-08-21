const formulario = document.querySelector('form');
const usuarioInput = document.getElementById('usuario');
const senhaInput = document.getElementById('senha');
const errorMessage = document.getElementById('error-message');

// Dados mockados de usuários
const mockUsers = [
  { email: 'teste@email.com', senha: '123' },
  { email: 'cicira@santos.com', senha: 'senhaforte' },
  { email: 'admin@admin.com', senha: 'admin' }
];

// Limpa a mensagem de erro quando o usuário digita
usuarioInput.addEventListener('input', () => {
  errorMessage.textContent = '';
});

senhaInput.addEventListener('input', () => {
  errorMessage.textContent = '';
});

formulario.addEventListener('submit', (e) => {
  e.preventDefault(); // Impede o envio padrão do formulário
  errorMessage.textContent = ''; // Limpa mensagens de erro anteriores

  const email = usuarioInput.value;
  const senha = senhaInput.value;

  if (!email || !senha) {
    errorMessage.textContent = 'Preencha todos os campos!';
    return;
  }

  // Procura o usuário na lista de dados mockados
  const user = mockUsers.find(u => u.email === email && u.senha === senha);

  if (user) {
    // Se o usuário for encontrado, armazena o email no sessionStorage
    sessionStorage.setItem('loggedInUser', user.email);
    // Redireciona para a tela inicial
    window.location.href = '../paginas/tela_inicial.html';
  } else {
    // Se o usuário não for encontrado, exibe a mensagem de erro
    errorMessage.textContent = 'Email ou senha incorretos!';
  }
});
