const formulario = document.querySelector('form');
const usuarioInput = document.getElementById('usuario');
const senhaInput = document.getElementById('senha');

formulario.addEventListener('submit', (e) => {
  if (!usuarioInput.value || !senhaInput.value) {
    e.preventDefault(); // Impede envio do formulário
    alert("Preencha todos os campos!");
  }
});
