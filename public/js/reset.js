document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resetForm');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const errorMessage = document.getElementById('errorMessage');

    const checkPasswords = () => {
        if (password.value && confirmPassword.value && password.value !== confirmPassword.value) {
            confirmPassword.classList.add('input-error');
            errorMessage.textContent = 'Passwords do not match.';
            errorMessage.style.display = 'block';
            return false;
        } else {
            confirmPassword.classList.remove('input-error');
            if (password.value === confirmPassword.value && password.value) {
                errorMessage.style.display = 'none';
            }
            return true;
        }
    };

    password.addEventListener('input', checkPasswords);
    confirmPassword.addEventListener('input', checkPasswords);

    form.addEventListener('submit', (e) => {
        password.classList.remove('input-error');
        confirmPassword.classList.remove('input-error');
        errorMessage.style.display = 'none';

        if (!password.value.trim() || password.value.trim().length < 6) {
            password.classList.add('input-error');
            errorMessage.textContent = 'Password must be at least 6 characters long.';
            errorMessage.style.display = 'block';
            e.preventDefault();
            return;
        }

        if (!checkPasswords()) {
            e.preventDefault();
            return;
        }
    });
});

