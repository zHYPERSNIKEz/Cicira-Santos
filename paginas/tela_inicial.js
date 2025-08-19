
document.addEventListener('DOMContentLoaded', () => {
    const avatar = document.querySelector('.avatar');
    const menu = document.querySelector('.menu-dropdown');
    const sairButton = document.getElementById('sair');

    // Exibe ou esconde o menu dropdown
    avatar.addEventListener('click', () => {
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });

    // Fecha o menu se clicar fora dele
    window.addEventListener('click', (event) => {
        if (!avatar.contains(event.target) && !menu.contains(event.target)) {
            menu.style.display = 'none';
        }
    });

    // Botão de sair
    sairButton.addEventListener('click', () => {
        window.location.href = '../index.html';
    });
});
