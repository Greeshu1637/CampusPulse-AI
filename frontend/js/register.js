/**
 * ============================================================
 * CampusPulse AI — Registration Page JavaScript
 * File: frontend/js/register.js
 * 
 * Modules:
 * 1. Theme Manager
 * 2. Password Toggle
 * 3. Password Strength Meter
 * 4. Password Match Indicator
 * 5. Form Validator
 * 6. Registration Handler
 * 7. Google OAuth Handler
 * 8. Initialization
 * ============================================================
 */

'use strict';


/* ============================================================
   1. THEME MANAGER
   Handles dark/light mode toggle with localStorage persistence.
   ============================================================ */
const ThemeManager = (function () {
  const STORAGE_KEY = 'campuspulse_theme';
  const html = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');

  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';

    if (themeIcon) {
      themeIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
    if (themeLabel) {
      themeLabel.textContent = isDark ? 'Light' : 'Dark';
    }
    if (toggleBtn) {
      toggleBtn.setAttribute(
        'aria-label',
        isDark ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }

    localStorage.setItem(STORAGE_KEY, theme);
  }

  function toggleTheme() {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  function init() {
    const saved = getTheme();
    applyTheme(saved);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTheme);
    }
  }

  return { init };
})();


/* ============================================================
   2. PASSWORD TOGGLE
   Show/Hide password with icon change.
   ============================================================ */
const PasswordToggle = (function () {
  const toggleBtn = document.getElementById('pwToggle');
  const passwordInput = document.getElementById('passwordInput');
  const toggleIcon = document.getElementById('pwToggleIcon');

  const confirmToggleBtn = document.getElementById('confirmPwToggle');
  const confirmPasswordInput = document.getElementById('confirmPasswordInput');
  const confirmToggleIcon = document.getElementById('confirmPwToggleIcon');

  function setupToggle(btn, input, icon) {
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      if (icon) {
        icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
      }

      btn.setAttribute(
        'aria-label',
        isPassword ? 'Hide password' : 'Show password'
      );
    });
  }

  function init() {
    setupToggle(toggleBtn, passwordInput, toggleIcon);
    setupToggle(confirmToggleBtn, confirmPasswordInput, confirmToggleIcon);
  }

  return { init };
})();


/* ============================================================
   3. PASSWORD STRENGTH METER
   Real-time password strength indicator.
   ============================================================ */
const PasswordStrength = (function () {
  const passwordInput = document.getElementById('passwordInput');
  const strengthMeter = document.getElementById('passwordStrength');
  const strengthText = document.getElementById('strengthText');

  function calculateStrength(password) {
    if (!password) return { score: 0, text: '' };

    let score = 0;

    // Length
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;

    // Uppercase
    if (/[A-Z]/.test(password)) score += 20;

    // Lowercase
    if (/[a-z]/.test(password)) score += 20;

    // Numbers
    if (/[0-9]/.test(password)) score += 20;

    // Special characters
    if (/[^A-Za-z0-9]/.test(password)) score += 20;

    // Determine strength text
    let text = '';
    if (score < 40) text = 'Weak';
    else if (score < 60) text = 'Fair';
    else if (score < 80) text = 'Good';
    else text = 'Strong';

    return { score, text };
  }

  function updateStrengthMeter() {
    if (!passwordInput || !strengthMeter) return;

    const password = passwordInput.value;
    const { score, text } = calculateStrength(password);

    // Update bars
    const bars = strengthMeter.querySelectorAll('.lp-pw-strength__bar');
    const activeBars = Math.ceil((score / 100) * 4);

    bars.forEach((bar, index) => {
      bar.classList.remove('active', 'weak', 'fair', 'good', 'strong');
      if (index < activeBars) {
        bar.classList.add('active');
        if (score < 40) bar.classList.add('weak');
        else if (score < 60) bar.classList.add('fair');
        else if (score < 80) bar.classList.add('good');
        else bar.classList.add('strong');
      }
    });

    // Update text
    if (strengthText) {
      strengthText.textContent = text;
      strengthText.className = 'lp-pw-strength__text';
      if (password.length > 0) {
        if (score < 40) strengthText.classList.add('weak');
        else if (score < 60) strengthText.classList.add('fair');
        else if (score < 80) strengthText.classList.add('good');
        else strengthText.classList.add('strong');
      }
    }
  }

  function init() {
    if (passwordInput) {
      passwordInput.addEventListener('input', updateStrengthMeter);
    }
  }

  return { init };
})();


/* ============================================================
   4. PASSWORD MATCH INDICATOR
   Show checkmark when passwords match.
   ============================================================ */
const PasswordMatch = (function () {
  const passwordInput = document.getElementById('passwordInput');
  const confirmPasswordInput = document.getElementById('confirmPasswordInput');
  const matchIndicator = document.getElementById('pwMatch');

  function checkMatch() {
    if (!passwordInput || !confirmPasswordInput || !matchIndicator) return;

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (confirmPassword.length > 0 && password === confirmPassword) {
      matchIndicator.classList.add('show');
    } else {
      matchIndicator.classList.remove('show');
    }
  }

  function init() {
    if (passwordInput) {
      passwordInput.addEventListener('input', checkMatch);
    }
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', checkMatch);
    }
  }

  return { init };
})();


/* ============================================================
   5. FORM VALIDATOR
   Validates registration form fields.
   ============================================================ */
const FormValidator = (function () {
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validateName(name) {
    if (!name) {
      return { valid: false, message: 'Full name is required.' };
    }
    if (name.length < 2) {
      return { valid: false, message: 'Name must be at least 2 characters.' };
    }
    return { valid: true, message: '' };
  }

  function validateEmail(email) {
    if (!email) {
      return { valid: false, message: 'Email is required.' };
    }
    if (!isValidEmail(email)) {
      return { valid: false, message: 'Please enter a valid email address.' };
    }
    return { valid: true, message: '' };
  }

  function validatePassword(password) {
    if (!password) {
      return { valid: false, message: 'Password is required.' };
    }
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters.' };
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpper) {
      return { valid: false, message: 'Password must contain an uppercase letter.' };
    }
    if (!hasLower) {
      return { valid: false, message: 'Password must contain a lowercase letter.' };
    }
    if (!hasNumber) {
      return { valid: false, message: 'Password must contain a number.' };
    }

    return { valid: true, message: '' };
  }

  function validateConfirmPassword(password, confirmPassword) {
    if (!confirmPassword) {
      return { valid: false, message: 'Please confirm your password.' };
    }
    if (password !== confirmPassword) {
      return { valid: false, message: 'Passwords do not match.' };
    }
    return { valid: true, message: '' };
  }

  function validateForm(name, email, password, confirmPassword) {
    const nameResult = validateName(name);
    const emailResult = validateEmail(email);
    const passwordResult = validatePassword(password);
    const confirmResult = validateConfirmPassword(password, confirmPassword);

    return {
      valid: nameResult.valid && emailResult.valid && passwordResult.valid && confirmResult.valid,
      errors: {
        name: nameResult.message,
        email: emailResult.message,
        password: passwordResult.message,
        confirmPassword: confirmResult.message,
      },
    };
  }

  return { validateForm };
})();


/* ============================================================
   6. REGISTRATION HANDLER
   Handles form submission and API communication.
   ============================================================ */
const RegistrationHandler = (function () {
  const form = document.getElementById('registerForm');
  const nameInput = document.getElementById('nameInput');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const confirmPasswordInput = document.getElementById('confirmPasswordInput');
  const roleSelect = document.getElementById('roleSelect');
  const registerBtn = document.getElementById('registerBtn');
  const registerCard = document.getElementById('lpCard');

  const nameErr = document.getElementById('nameErr');
  const emailErr = document.getElementById('emailErr');
  const passwordErr = document.getElementById('passwordErr');
  const confirmPasswordErr = document.getElementById('confirmPasswordErr');

  let isSubmitting = false;

  function showError(input, errorEl, message) {
    if (input) input.classList.add('is-error');
    if (errorEl) {
      errorEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
      errorEl.classList.add('visible');
    }
  }

  function clearError(input, errorEl) {
    if (input) {
      input.classList.remove('is-error', 'is-success');
    }
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }

  function clearAllErrors() {
    clearError(nameInput, nameErr);
    clearError(emailInput, emailErr);
    clearError(passwordInput, passwordErr);
    clearError(confirmPasswordInput, confirmPasswordErr);
  }

  function showSuccess(input) {
    if (input) {
      input.classList.remove('is-error');
      input.classList.add('is-success');
    }
  }

  function shakeCard() {
    if (!registerCard) return;
    registerCard.classList.remove('lp-shake');
    void registerCard.offsetWidth;
    registerCard.classList.add('lp-shake');
    setTimeout(() => registerCard.classList.remove('lp-shake'), 500);
  }

  function setLoading(loading) {
    if (!registerBtn) return;

    if (loading) {
      registerBtn.classList.add('loading');
      registerBtn.disabled = true;
    } else {
      registerBtn.classList.remove('loading');
      registerBtn.disabled = false;
    }
  }

  async function registerUser(name, email, password, confirmPassword, role) {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
        confirm_password: confirmPassword,
        role: role,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw result;
    }

    return result;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (isSubmitting) return;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const role = roleSelect.value;

    // Clear previous errors
    clearAllErrors();

    // Validate form
    const validation = FormValidator.validateForm(name, email, password, confirmPassword);

    if (!validation.valid) {
      if (validation.errors.name) {
        showError(nameInput, nameErr, validation.errors.name);
      }
      if (validation.errors.email) {
        showError(emailInput, emailErr, validation.errors.email);
      }
      if (validation.errors.password) {
        showError(passwordInput, passwordErr, validation.errors.password);
      }
      if (validation.errors.confirmPassword) {
        showError(confirmPasswordInput, confirmPasswordErr, validation.errors.confirmPassword);
      }
      shakeCard();
      return;
    }

    // Show success state
    showSuccess(nameInput);
    showSuccess(emailInput);
    showSuccess(passwordInput);
    showSuccess(confirmPasswordInput);

    // Start loading
    isSubmitting = true;
    setLoading(true);

    // Attempt registration
    registerUser(name, email, password, confirmPassword, role)
      .then((response) => {
        // Success — redirect to dashboard
        window.location.href = response.redirect;
      })
      .catch((error) => {
        // Registration failed
        isSubmitting = false;
        setLoading(false);

        const message = error.message || 'Registration failed. Please try again.';
        const field = error.field;

        // Show error on specific field
        if (field === 'name') {
          showError(nameInput, nameErr, message);
        } else if (field === 'email') {
          showError(emailInput, emailErr, message);
        } else if (field === 'password') {
          showError(passwordInput, passwordErr, message);
        } else if (field === 'confirm_password') {
          showError(confirmPasswordInput, confirmPasswordErr, message);
        } else {
          // Generic error
          showError(emailInput, emailErr, message);
        }

        shakeCard();
      });
  }

  function setupLiveValidation() {
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        clearError(nameInput, nameErr);
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', () => {
        clearError(emailInput, emailErr);
      });
    }

    if (passwordInput) {
      passwordInput.addEventListener('input', () => {
        clearError(passwordInput, passwordErr);
      });
    }

    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', () => {
        clearError(confirmPasswordInput, confirmPasswordErr);
      });
    }
  }

  function init() {
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }

    setupLiveValidation();
  }

  return { init };
})();


/* ============================================================
   7. GOOGLE OAUTH HANDLER
   Handles Google Sign-In button.
   ============================================================ */
const GoogleAuthHandler = (function () {
  const googleBtn = document.getElementById('googleRegisterBtn');

  function handleGoogleRegister() {
    window.location.href = '/auth/google/login';
  }

  function init() {
    if (googleBtn) {
      googleBtn.addEventListener('click', handleGoogleRegister);
    }
  }

  return { init };
})();


/* ============================================================
   8. INITIALIZATION
   Initialize all modules when DOM is ready.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  PasswordToggle.init();
  PasswordStrength.init();
  PasswordMatch.init();
  RegistrationHandler.init();
  GoogleAuthHandler.init();

  console.log('✓ CampusPulse AI Registration — All modules initialized');
});


/* ============================================================
   END OF register.js
   ============================================================ */
