document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    form.addEventListener('submit', (e) => {
        email.classList.remove('input-error');
        if (password) password.classList.remove('input-error');
        errorMessage.style.display = 'none';

        if (!email.value.trim() || (password && !password.value.trim())) {
            if (!email.value.trim()) email.classList.add('input-error');
            if (password && !password.value.trim()) password.classList.add('input-error');

            errorMessage.textContent = 'Please fill in all fields.';
            errorMessage.style.display = 'block';
            e.preventDefault(); 
        }
    });
});