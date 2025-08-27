document.addEventListener('DOMContentLoaded', () => {
    const rentalForm = document.getElementById('rental-form');
    const successMessage = document.getElementById('success-message');
    const eventDateInput = document.getElementById('event-date');
    const returnDateInput = document.getElementById('return-date');

    // Desabilita o campo de data de devolução inicialmente
    returnDateInput.disabled = true;

    eventDateInput.addEventListener('change', () => {
        const eventDateValue = eventDateInput.value;
        if (eventDateValue) {
            // Habilita o campo de data de devolução
            returnDateInput.disabled = false;
            
            // Define a data mínima para a devolução como a data do evento
            returnDateInput.min = eventDateValue;
            
            // Se a data de devolução já selecionada for anterior à nova data do evento, limpa o campo
            if (returnDateInput.value && returnDateInput.value < eventDateValue) {
                returnDateInput.value = '';
            }
        } else {
            // Se a data do evento for limpa, desabilita e limpa a data de devolução
            returnDateInput.disabled = true;
            returnDateInput.value = '';
        }
    });

    rentalForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const eventDate = new Date(eventDateInput.value);
        const returnDate = new Date(returnDateInput.value);

        const eventDateLocal = new Date(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate());
        const returnDateLocal = new Date(returnDate.getUTCFullYear(), returnDate.getUTCMonth(), returnDate.getUTCDate());


        if (returnDateLocal < eventDateLocal) {
            alert('A data de devolução não pode ser anterior à data do evento!');
            return;
        }

        // Lógica para salvar os dados
        successMessage.textContent = 'Aluguel registrado com sucesso!';
        rentalForm.reset();
        returnDateInput.disabled = true;

        setTimeout(() => {
            successMessage.textContent = '';
        }, 3000);
    });
});