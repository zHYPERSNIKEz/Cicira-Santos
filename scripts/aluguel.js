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


/*Verifica CPF*/

function formatarCPF(cpfInput) {
    // Get only the digits
    const rawValue = cpfInput.value.replace(/\D/g, '');
    let formattedValue = rawValue;

    if (rawValue.length > 9) {
        formattedValue = `${rawValue.slice(0, 3)}.${rawValue.slice(3, 6)}.${rawValue.slice(6, 9)}-${rawValue.slice(9, 11)}`;
    } else if (rawValue.length > 6) {
        formattedValue = `${rawValue.slice(0, 3)}.${rawValue.slice(3, 6)}.${rawValue.slice(6)}`;
    } else if (rawValue.length > 3) {
        formattedValue = `${rawValue.slice(0, 3)}.${rawValue.slice(3)}`;
    }

    cpfInput.value = formattedValue;

    // Perform validation
    if (rawValue.length === 11) {
        validarCPF(cpfInput);
    } else {
        // Clear validation if not exactly 11 digits
        cpfInput.classList.remove('cpf-invalido');
        cpfInput.classList.remove('cpf-valido');
        const errorSpan = document.getElementById('cpf-error');
        if (errorSpan) {
            errorSpan.textContent = '';
        }
    }
}

function validarCPF(cpfInput) {
    const cpf = cpfInput.value.replace(/\D/g, '');
    const errorSpan = document.getElementById('cpf-error');
    cpfInput.classList.remove('cpf-invalido');
    cpfInput.classList.remove('cpf-valido');
    errorSpan.textContent = '';

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        cpfInput.classList.add('cpf-invalido');
        errorSpan.textContent = 'CPF inválido.';
        return false;
    }

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.substring(9, 10))) {
        cpfInput.classList.add('cpf-invalido');
        errorSpan.textContent = 'CPF inválido.';
        return false;
    }

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.substring(10, 11))) {
        cpfInput.classList.add('cpf-invalido');
        errorSpan.textContent = 'CPF inválido.';
        return false;
    }

    cpfInput.classList.add('cpf-valido');
    return true;
}