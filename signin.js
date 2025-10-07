document.addEventListener('DOMContentLoaded', function() {
    const signupButton = document.getElementById('signup');
    const submitButton = document.getElementById('submit');
    const titleElement = document.querySelector('h2txt');
    const formContainer = document.querySelector('.sbox');
    const buttonContainer = document.querySelector('.btn');

    if (signupButton) {
        signupButton.addEventListener('click', switchToSignup);
    }

    function switchToSignup() {
        titleElement.textContent = 'Signup';
        
        formContainer.innerHTML = `
            <div class="lableBox">
                <label for="name">Full Name</label>
                <input type="text" id="name" required>
                <span class="error-message" id="nameError"></span>
            </div>
            <div class="lableBox">
                <label for="email">Email</label>
                <input type="email" id="email" required>
                <span class="error-message" id="emailError"></span>
            </div>
            <div class="lableBox">
                <label for="userid">User ID</label>
                <input type="text" id="userid" required>
                <span class="error-message" id="useridError"></span>
            </div>
            <div class="lableBox">
                <label for="password">Set Password</label>
                <input type="password" id="password" required>
                <span class="error-message" id="passwordError"></span>
            </div>
            <div class="lableBox">
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" required>
                <span class="error-message" id="confirmPasswordError"></span>
            </div>
            <div class="lableBox">
                <label for="captcha">Captcha: <span id="captchaText"></span></label>
                <input type="text" id="captcha" placeholder="Enter captcha" required>
                <span class="error-message" id="captchaError"></span>
            </div>
        `;

        buttonContainer.innerHTML = `
            <button id="submit">Submit</button>
            <button id="signin">Sign-in</button>`;
        generateCaptcha();
        document.getElementById('submit').addEventListener('click', handleSignupSubmit);
        document.getElementById('signin').addEventListener('click', switchToSignin);
        addRealTimeValidation();
    }

    function switchToSignin() {
        // Change title
        titleElement.textContent = 'Signin';
        
        formContainer.innerHTML = `
            <div class="lableBox">
                <label for="userid">User Id</label>
                <input type="text" id="userid">
            </div>
            <div class="lableBox">
                <label for="password">Password</label>
                <input type="password" id="password">
            </div>
            <div class="lableBox">
                <label for="otp">OTP</label>
                <input type="text" id="otp">
            </div>
        `;

        buttonContainer.innerHTML = `
            <button id="submit">Submit</button>
            <button id="signup">Sign-up</button>
        `;

        document.getElementById('submit').addEventListener('click', handleSigninSubmit);
        document.getElementById('signup').addEventListener('click', switchToSignup);
    }

    function handleSignupSubmit() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const userid = document.getElementById('userid').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const captchaInput = document.getElementById('captcha').value.trim();
        const storedCaptcha = document.getElementById('captchaText').textContent;
        clearErrors();

        let isValid = true;

        if (name.length < 2) {
            showError('nameError', 'Name must be at least 2 characters long');
            isValid = false;
        }
        if (!validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }
        if (userid.length < 4) {
            showError('useridError', 'User ID must be at least 4 characters long');
            isValid = false;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            showError('passwordError', passwordValidation.message);
            isValid = false;
        }

        if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }

        if (captchaInput !== storedCaptcha) {
            showError('captchaError', 'Captcha does not match');
            isValid = false;
        }

        if (isValid) {
            alert('Signup successful! You can now sign in.');
            switchToSignin();
        }
    }

    function handleSigninSubmit() {
        const userid = document.getElementById('userid').value.trim();
        const password = document.getElementById('password').value;
        const otp = document.getElementById('otp').value.trim();

        if (!userid || !password) {
            alert('Please fill in all required fields');
            return;
        }
        alert('Signin successful! Redirecting...');
    }

    function generateCaptcha() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        document.getElementById('captchaText').textContent = captcha;
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            return { isValid: false, message: `Password must be at least ${minLength} characters long` };
        }
        if (!hasUpperCase) {
            return { isValid: false, message: 'Password must contain at least one uppercase letter' };
        }
        if (!hasLowerCase) {
            return { isValid: false, message: 'Password must contain at least one lowercase letter' };
        }
        if (!hasNumbers) {
            return { isValid: false, message: 'Password must contain at least one number' };
        }
        if (!hasSpecialChar) {
            return { isValid: false, message: 'Password must contain at least one special character' };
        }

        return { isValid: true, message: '' };
    }

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
    }

    function addRealTimeValidation() {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                if (!validateEmail(this.value.trim())) {
                    showError('emailError', 'Please enter a valid email address');
                } else {
                    document.getElementById('emailError').style.display = 'none';
                }
            });
        }

        if (passwordInput) {
            passwordInput.addEventListener('blur', function() {
                const validation = validatePassword(this.value);
                if (!validation.isValid) {
                    showError('passwordError', validation.message);
                } else {
                    document.getElementById('passwordError').style.display = 'none';
                }
            });
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('blur', function() {
                const password = document.getElementById('password').value;
                if (this.value !== password) {
                    showError('confirmPasswordError', 'Passwords do not match');
                } else {
                    document.getElementById('confirmPasswordError').style.display = 'none';
                }
            });
        }
    }

    // Add refresh captcha functionality
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'captchaText') {
            generateCaptcha();
        }
    });

    // Initialize the form with signin view
    switchToSignin();
});

document.addEventListener('DOMContentLoaded',function(){
    const rHome = document.getElementById('returnHome');
    if (rHome){
        rHome.addEventListener('click', function(){
            window.location.href = 'index.html';
        });
    }
})
document.addEventListener('DOMContentLoaded', () => {
    window.powerSystem = new PowerManagementSystem();
});