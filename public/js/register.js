document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const errorMessage = document.getElementById('errorMessage');

    const checkPasswords = () => {
        if (password.value && confirmPassword.value && password.value !== confirmPassword.value) {
            confirmPassword.classList.add('input-error');
            errorMessage.textContent = 'Passwords do not match.';
            errorMessage.style.display = 'block';
        } else {
            confirmPassword.classList.remove('input-error');
            errorMessage.textContent = '';
            errorMessage.style.display = 'none';
        }
    };

    password.addEventListener('input', checkPasswords);
    confirmPassword.addEventListener('input', checkPasswords);

    form.addEventListener('submit', (e) => {
        checkPasswords();
        if (errorMessage.textContent) {
            e.preventDefault();
        }
    });
});